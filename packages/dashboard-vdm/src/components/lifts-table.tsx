import { TableContainer } from '@mui/material';
import { BuildingMap, Lift } from 'api-client';
import React from 'react';
import { LiftDataGridTable, LiftTableData } from 'react-components';
import { throttleTime } from 'rxjs';

import { useRmfApi } from '../hooks/use-rmf-api';
import { getApiErrorMessage } from '../utils/api';
import { submitLiftRequest } from '../utils/lifts';
import { AppEvents } from './app-events';
import { LiftSummary } from './lift-summary';

export const LiftsTable = () => {
  const rmfApi = useRmfApi();
  const [buildingMap, setBuildingMap] = React.useState<BuildingMap | null>(null);
  const [liftTableData, setLiftTableData] = React.useState<Record<string, LiftTableData[]>>({});
  const [openLiftSummary, setOpenLiftSummary] = React.useState(false);
  const [selectedLift, setSelectedLift] = React.useState<Lift | null>(null);

  React.useEffect(() => {
    const sub = rmfApi.buildingMapObs.subscribe((newMap) => {
      setBuildingMap(newMap);
    });
    return () => sub.unsubscribe();
  }, [rmfApi]);

  React.useEffect(() => {
    buildingMap?.lifts.map(async (lift, i) => {
      try {
        const sub = rmfApi
          .getLiftStateObs(lift.name)
          .pipe(throttleTime(3000, undefined, { leading: true, trailing: true }))
          .subscribe((liftState) => {
            setLiftTableData((prev) => {
              return {
                ...prev,
                [lift.name]: [
                  {
                    index: i,
                    name: lift.name,
                    mode: liftState.current_mode,
                    currentFloor: liftState.current_floor,
                    destinationFloor: liftState.destination_floor,
                    doorState: liftState.door_state,
                    motionState: liftState.motion_state,
                    sessionId: liftState.session_id,
                    lift: lift,
                    liftState: liftState,
                    onRequestSubmit: async (_ev, doorState, requestType, destination) =>
                      submitLiftRequest(rmfApi, lift.name, doorState, requestType, destination),
                  },
                ],
              };
            });
          });
        return () => sub.unsubscribe();
      } catch (error) {
        console.error(`Failed to get lift state: ${getApiErrorMessage(error)}`);
      }
    });
  }, [rmfApi, buildingMap]);

  return (
    <TableContainer sx={{ height: '100%' }}>
      <LiftDataGridTable
        lifts={Object.values(liftTableData).flatMap((l) => l)}
        onLiftClick={(_ev, liftData) => {
          if (!buildingMap) {
            AppEvents.liftSelect.next(null);
            return;
          }

          for (const lift of buildingMap.lifts) {
            if (lift.name === liftData.name) {
              AppEvents.liftSelect.next(lift);
              setSelectedLift(lift);
              setOpenLiftSummary(true);
              return;
            }
          }
        }}
      />
      {openLiftSummary && selectedLift && (
        <LiftSummary lift={selectedLift} onClose={() => setOpenLiftSummary(false)} />
      )}
    </TableContainer>
  );
};

export default LiftsTable;
