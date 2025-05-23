import { Button, ButtonProps, Tooltip, Typography } from '@mui/material';
import { TaskStateOutput as TaskState } from 'api-client';
import React from 'react';
import { ConfirmationDialog } from 'react-components';

import { useAppController } from '../../hooks/use-app-controller';
import { useRmfApi } from '../../hooks/use-rmf-api';
import { useUserProfile } from '../../hooks/use-user-profile';
import { Enforcer } from '../../services/permissions';
import { AppEvents } from '../app-events';

export interface TaskPhaseSkipButtonProp extends ButtonProps {
  taskId: string | null;
  buttonText?: string;
}

export function TaskPhaseSkipButton({
  taskId,
  buttonText,
  ...otherProps
}: TaskPhaseSkipButtonProp): JSX.Element {
  const rmfApi = useRmfApi();
  const appController = useAppController();
  const profile = useUserProfile();

  const [taskState, setTaskState] = React.useState<TaskState | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);

  React.useEffect(() => {
    if (!taskId) {
      return;
    }
    const sub = rmfApi.getTaskStateObs(taskId).subscribe((state) => {
      setTaskState(state);
    });
    return () => sub.unsubscribe();
  }, [rmfApi, taskId]);

  const isTaskPhaseSkippable = (state: TaskState | null) => {
    return (
      state &&
      state.status &&
      !['canceled', 'queued', 'killed', 'completed', 'failed'].includes(state.status)
    );
  };

  const userCanSkipPhase = profile && Enforcer.canCancelTask(profile);

  function capitalizeFirstLetter(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  const handleSkipPhaseClick = React.useCallback<React.MouseEventHandler>(async () => {
    if (!taskState) {
      return;
    }
    try {
      if (taskState.active === undefined) {
        appController.showAlert('error', 'Failed to skip task phase: No task phase active now');
      } else {
        await rmfApi.tasksApi?.postSkipPhaseTasksSkipPhasePost({
          type: 'skip_phase_request',
          task_id: taskState.booking.id,
          phase_id: taskState.active,
          labels: profile ? [profile.user.username] : undefined,
        });
        appController.showAlert('success', 'Task phase skippation requested');
        AppEvents.taskSelect.next(null);
        AppEvents.refreshTaskApp.next();
      }
    } catch (e) {
      appController.showAlert('error', `Failed to skip task phase: ${(e as Error).message}`);
    }
    setOpenConfirmDialog(false);
  }, [appController, taskState, rmfApi, profile]);

  return (
    <>
      {isTaskPhaseSkippable(taskState) && userCanSkipPhase ? (
        <Button onClick={() => setOpenConfirmDialog(true)} autoFocus {...otherProps}>
          {buttonText ?? 'Skip Current Phase'}
        </Button>
      ) : isTaskPhaseSkippable(taskState) && !userCanSkipPhase ? (
        <Tooltip title="You don't have permission to skip task phases.">
          <Button
            disabled
            sx={{
              '&.Mui-disabled': {
                pointerEvents: 'auto',
              },
            }}
            {...otherProps}
          >
            {buttonText ?? 'Skip Current Phase'}
          </Button>
        </Tooltip>
      ) : (
        <Tooltip
          title={
            taskState && taskState.status
              ? `${capitalizeFirstLetter(taskState.status)} task cannot be skipped phase.`
              : `Task cannot be skipped phase.`
          }
        >
          <Button
            disabled
            sx={{
              '&.Mui-disabled': {
                pointerEvents: 'auto',
              },
            }}
            {...otherProps}
          >
            {buttonText ?? 'Skip Current Phase'}
          </Button>
        </Tooltip>
      )}
      {openConfirmDialog && (
        <ConfirmationDialog
          confirmText="Confirm"
          cancelText="Cancel"
          open={openConfirmDialog}
          title={`Skip Current Phase [${taskState?.booking.id || 'n/a'}]`}
          submitting={undefined}
          onClose={() => {
            setOpenConfirmDialog(false);
          }}
          onSubmit={handleSkipPhaseClick}
        >
          <Typography>Are you sure you would like to skip current task phase?</Typography>
        </ConfirmationDialog>
      )}
    </>
  );
}
