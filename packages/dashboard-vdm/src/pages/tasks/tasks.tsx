import { InitialWindow, Workspace } from 'components';
import tasksApp from 'micro-apps/tasks-app';

const TaskPage = () => {
  const hCustom = (window.innerHeight - 178 + 8) / 158;

  const tasksWorkspace: InitialWindow[] = [
    { layout: { x: 0, y: 0, w: 12, h: hCustom }, microApp: tasksApp },
  ];

  return <Workspace initialWindows={tasksWorkspace} />;
};

export default TaskPage;
