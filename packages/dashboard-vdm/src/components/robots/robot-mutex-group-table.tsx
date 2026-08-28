import { TableContainer, Typography } from '@mui/material';
import React from 'react';
import { ConfirmationDialog, MutexGroupData, MutexGroupTable } from 'react-components';

import { useAppController } from '../../hooks/use-app-controller';
import { useRmfApi } from '../../hooks/use-rmf-api';

const RefreshMutexGroupTableInterval = 3000;

// A mutex group can also be held by a system outside of RMF, through
// /mutex_groups. Those holders are not robots, so they are labelled with this
// prefix rather than the fleet/robot identifier used everywhere else, and they
// are released through a different endpoint.
const ExternalHolderPrefix = 'external: ';

interface MutexGroupRow extends MutexGroupData {
  // Set only while a system outside of RMF holds the group. Doubles as the flag
  // that decides which release endpoint the unlock button has to call.
  externalRequester?: string;
}

export const RobotMutexGroupsTable = () => {
  const rmfApi = useRmfApi();
  const appController = useAppController();

  const [mutexGroups, setMutexGroups] = React.useState<Record<string, MutexGroupRow>>({});
  const [selectedMutexGroup, setSelectedMutexGroup] = React.useState<MutexGroupRow | null>(null);

  const robotIdentifierDelimiter = '/';

  const generateRobotIdentifier = (fleet: string, robot: string) => {
    return `${fleet}${robotIdentifierDelimiter}${robot}`;
  };

  const getFleetFromRobotIdentifier = (robotIdentifier: string) => {
    const split = robotIdentifier.split(robotIdentifierDelimiter);
    if (split.length !== 2) {
      console.error(`Unable to parse fleet from robot identifier: ${robotIdentifier}`);
      return null;
    }
    return split[0];
  };

  const getRobotFromRobotIdentifier = (robotIdentifier: string) => {
    const split = robotIdentifier.split(robotIdentifierDelimiter);
    if (split.length !== 2) {
      console.error(`Unable to parse robot from robot identifier: ${robotIdentifier}`);
      return null;
    }
    return split[1];
  };

  React.useEffect(() => {
    const refreshMutexGroupTable = async () => {
      const [fleets, leases] = await Promise.all([
        rmfApi.fleetsApi.getFleetsFleetsGet().then((resp) => resp.data),
        // Leases are a bonus on top of the fleet view, so a server without them
        // should still leave the robot side of the table working.
        rmfApi.mutexGroupsApi
          .getLeasesMutexGroupsLeasesGet()
          .then((resp) => resp.data)
          .catch((e) => {
            console.error(`Unable to read mutex group leases: ${(e as Error).message}`);
            return [];
          }),
      ]);

      const updatedMutexGroups: Record<string, MutexGroupRow> = {};
      for (const fleet of fleets) {
        if (!fleet.name || !fleet.robots) {
          continue;
        }

        for (const robot of Object.values(fleet.robots)) {
          if (!robot.mutex_groups || !robot.name) {
            continue;
          }
          const robotIdentifier = generateRobotIdentifier(fleet.name, robot.name);

          if (robot.mutex_groups.locked) {
            for (const locked of robot.mutex_groups.locked) {
              if (updatedMutexGroups[locked]) {
                updatedMutexGroups[locked].lockedBy = robotIdentifier;
              } else {
                updatedMutexGroups[locked] = {
                  name: locked,
                  lockedBy: robotIdentifier,
                  requestedBy: [],
                };
              }
            }
          }
          if (robot.mutex_groups.requesting) {
            for (const requesting of robot.mutex_groups.requesting) {
              if (updatedMutexGroups[requesting]) {
                updatedMutexGroups[requesting].requestedBy.push(robotIdentifier);
              } else {
                updatedMutexGroups[requesting] = {
                  name: requesting,
                  lockedBy: undefined,
                  requestedBy: [robotIdentifier],
                };
              }
            }
          }
        }
      }

      // Fold in the holders that are not RMF robots. A granted lease is the
      // holder; a waiting one is queueing behind whichever robot holds it.
      for (const lease of leases) {
        const label = `${ExternalHolderPrefix}${lease.requester}`;
        const row = (updatedMutexGroups[lease.group] ??= {
          name: lease.group,
          lockedBy: undefined,
          requestedBy: [],
        });
        if (lease.state === 'granted') {
          row.lockedBy = label;
          row.externalRequester = lease.requester;
        } else {
          row.requestedBy.push(label);
        }
      }

      // Filter intermediate mutex groups which are not locked, but just
      // requested by robots
      for (const mutexGroupName of Object.keys(updatedMutexGroups)) {
        if (!updatedMutexGroups[mutexGroupName].lockedBy) {
          delete updatedMutexGroups[mutexGroupName];
        }
      }

      setMutexGroups(updatedMutexGroups);
    };

    // Initialize table
    (async () => {
      await refreshMutexGroupTable();
    })();

    // Set up regular interval to refresh table
    const refreshInterval = window.setInterval(
      refreshMutexGroupTable,
      RefreshMutexGroupTableInterval
    );
    return () => {
      clearInterval(refreshInterval);
    };
  }, [rmfApi]);

  const handleUnlockMutexGroup = React.useCallback<React.MouseEventHandler>(async () => {
    if (!selectedMutexGroup || !selectedMutexGroup.lockedBy) {
      return;
    }

    if (selectedMutexGroup.externalRequester) {
      const requester = selectedMutexGroup.externalRequester;
      try {
        await rmfApi.mutexGroupsApi.forceReleaseGroupMutexGroupsGroupsGroupForceReleasePost(
          selectedMutexGroup.name
        );
        appController.showAlert(
          'success',
          `Released mutex group ${selectedMutexGroup.name} from ${requester}`
        );
      } catch (e) {
        appController.showAlert(
          'error',
          `Failed to release mutex group ${selectedMutexGroup.name} from ${requester}: ${
            (e as Error).message
          }`
        );
      }
      setSelectedMutexGroup(null);
      return;
    }

    const fleet = getFleetFromRobotIdentifier(selectedMutexGroup.lockedBy);
    const robot = getRobotFromRobotIdentifier(selectedMutexGroup.lockedBy);
    if (!fleet || !robot) {
      return;
    }

    try {
      await rmfApi.fleetsApi?.unlockMutexGroupFleetsNameUnlockMutexGroupPost(
        fleet,
        robot,
        selectedMutexGroup.name
      );
      appController.showAlert(
        'success',
        `Requested to unlock mutex group ${selectedMutexGroup.name} for ${fleet}:${robot}`
      );
    } catch (e) {
      appController.showAlert(
        'error',
        `Failed to unlock mutex group ${selectedMutexGroup.name} for ${fleet}:${robot}: ${
          (e as Error).message
        }`
      );
    }
    setSelectedMutexGroup(null);
  }, [selectedMutexGroup, rmfApi, appController]);

  return (
    <TableContainer sx={{ height: '100%' }}>
      <MutexGroupTable
        mutexGroups={Object.values(mutexGroups)}
        onMutexGroupClick={(_ev, mutexGroup) => {
          setSelectedMutexGroup(mutexGroups[mutexGroup.name] ?? null);
        }}
      />
      <ConfirmationDialog
        confirmText="Confirm unlock"
        cancelText="Cancel"
        open={selectedMutexGroup !== null && selectedMutexGroup.lockedBy !== undefined}
        title={'Mutex group manual unlock'}
        submitting={undefined}
        onClose={() => setSelectedMutexGroup(null)}
        onSubmit={handleUnlockMutexGroup}
      >
        {selectedMutexGroup && selectedMutexGroup.externalRequester ? (
          <Typography>
            Confirm unlock mutex group [{selectedMutexGroup.name}] held by [
            {selectedMutexGroup.externalRequester}]? That system is outside RMF, so RMF does not
            know where its robot is and nothing else is keeping it apart from RMF robots. Check that
            it has left the area first.
          </Typography>
        ) : selectedMutexGroup && selectedMutexGroup.lockedBy ? (
          <Typography>
            Confirm unlock mutex group [{selectedMutexGroup.name}] for [
            {selectedMutexGroup.lockedBy}]?
          </Typography>
        ) : (
          <Typography>Confirm unlock mutex group?</Typography>
        )}
      </ConfirmationDialog>
    </TableContainer>
  );
};

export default RobotMutexGroupsTable;
