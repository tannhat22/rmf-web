// material-ui
import React from 'react';
import { Box, Button } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';

import { useLocales } from 'locales';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

import { TaskFavorite } from 'api-client';
import { TaskForm, TaskFormProps } from 'react-components';

import { useTaskFormData } from 'hooks/use-create-task-form';
import { useRmfApi } from 'hooks/use-rmf-api';
import { useTaskRegistry } from 'hooks/use-task-registry';
import { useUserProfile } from 'hooks/use-user-profile';
import { AppEvents } from 'components/app-events';
import { dispatchTask, scheduleTask } from 'components/tasks/utils';

// ==============================|| HEADER CONTENT - NEW TASK ||============================== //

const NewTask = () => {
  const { translate } = useLocales();
  const rmfApi = useRmfApi();
  const taskRegistry = useTaskRegistry();
  const profile = useUserProfile();

  const [openCreateTaskForm, setOpenCreateTaskForm] = React.useState(false);
  const [favoritesTasks, setFavoritesTasks] = React.useState<TaskFavorite[]>([]);

  const showAlertSnack = (color: string, message: string) => {
    dispatch(
      openSnackbar({
        open: true,
        message: message,
        variant: 'alert',
        alert: {
          color: color,
        },
        close: false,
      })
    );
  };

  const { waypointNames, pickupPoints, dropoffPoints, cleaningZoneNames, fleets } =
    useTaskFormData(rmfApi);
  const username = profile.user.username;

  const dispatchTaskCallback = React.useCallback<Required<TaskFormProps>['onDispatchTask']>(
    async (taskRequest, robotDispatchTarget) => {
      if (!rmfApi) {
        throw new Error('tasks api not available');
      }
      await dispatchTask(rmfApi, taskRequest, robotDispatchTarget);
      AppEvents.refreshTaskApp.next();
    },
    [rmfApi]
  );

  const scheduleTaskCallback = React.useCallback<Required<TaskFormProps>['onScheduleTask']>(
    async (taskRequest, schedule) => {
      if (!rmfApi) {
        throw new Error('tasks api not available');
      }
      await scheduleTask(rmfApi, taskRequest, schedule);
      AppEvents.refreshTaskApp.next();
    },
    [rmfApi]
  );

  //#region 'Favorite Task'
  React.useEffect(() => {
    const getFavoriteTasks = async () => {
      const resp = await rmfApi.tasksApi.getFavoritesTasksFavoriteTasksGet();
      const results = resp.data as TaskFavorite[];
      setFavoritesTasks(results);
    };
    getFavoriteTasks();

    const sub = AppEvents.refreshFavoriteTasks.subscribe({ next: getFavoriteTasks });
    return () => sub.unsubscribe();
  }, [rmfApi]);

  const submitFavoriteTask = React.useCallback<Required<TaskFormProps>['submitFavoriteTask']>(
    async (taskFavoriteRequest) => {
      await rmfApi.tasksApi.postFavoriteTaskFavoriteTasksPost(taskFavoriteRequest);
      AppEvents.refreshFavoriteTasks.next();
    },
    [rmfApi]
  );

  const deleteFavoriteTask = React.useCallback<Required<TaskFormProps>['deleteFavoriteTask']>(
    async (favoriteTask) => {
      if (!favoriteTask.id) {
        throw new Error('Id is needed');
      }

      await rmfApi.tasksApi.deleteFavoriteTaskFavoriteTasksFavoriteTaskIdDelete(favoriteTask.id);
      AppEvents.refreshFavoriteTasks.next();
    },
    [rmfApi]
  );
  //#endregion 'Favorite Task'

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Button
        id="create-new-task-button"
        aria-label="new task"
        // color="secondary"
        variant="contained"
        size="small"
        onClick={() => setOpenCreateTaskForm(true)}
        sx={{ marginRight: '10px' }}
      >
        <AddOutlined />
        {translate('New Task')}
      </Button>
      {openCreateTaskForm && (
        <TaskForm
          user={username ? username : 'unknown user'}
          fleets={fleets}
          tasksToDisplay={taskRegistry.taskDefinitions}
          patrolWaypoints={waypointNames}
          cleaningZones={cleaningZoneNames}
          pickupZones={taskRegistry.pickupZones}
          cartIds={taskRegistry.cartIds}
          pickupPoints={pickupPoints}
          dropoffPoints={dropoffPoints}
          favoritesTasks={favoritesTasks}
          open={openCreateTaskForm}
          onClose={() => setOpenCreateTaskForm(false)}
          onDispatchTask={dispatchTaskCallback}
          onScheduleTask={scheduleTaskCallback}
          onEditScheduleTask={undefined}
          submitFavoriteTask={submitFavoriteTask}
          deleteFavoriteTask={deleteFavoriteTask}
          onSuccess={() => {
            console.log('Dispatch task requested');
            setOpenCreateTaskForm(false);
            showAlertSnack('success', 'Dispatch task requested');
          }}
          onFail={(e) => {
            console.error(`Failed to dispatch task: ${e.message}`);
            showAlertSnack('error', `Failed to dispatch task: ${e.message}`);
          }}
          onSuccessFavoriteTask={(message) => {
            console.log(`Created favorite task: ${message}`);
            showAlertSnack('success', message);
          }}
          onFailFavoriteTask={(e) => {
            console.error(`Failed to create favorite task: ${e.message}`);
            showAlertSnack('error', `Failed to create or delete favorite task: ${e.message}`);
          }}
          onSuccessScheduling={() => {
            console.log('Create schedule requested');
            setOpenCreateTaskForm(false);
            showAlertSnack('success', 'Create schedule requested');
          }}
          onFailScheduling={(e) => {
            console.error(`Failed to create schedule: ${e.message}`);
            showAlertSnack('error', `Failed to submit schedule: ${e.message}`);
          }}
          translate={translate}
        />
      )}
    </Box>
  );
};

export default NewTask;
