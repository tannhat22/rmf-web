import { InitialWindow, Workspace } from 'components';
import tasksApp from 'micro-apps/tasks-app';

const tasksWorkspace: InitialWindow[] = [
  { layout: { x: 0, y: 0, w: 12, h: 5 }, microApp: tasksApp },
];

const TaskPage = () => {
  return <Workspace initialWindows={tasksWorkspace} />;
};

export default TaskPage;
