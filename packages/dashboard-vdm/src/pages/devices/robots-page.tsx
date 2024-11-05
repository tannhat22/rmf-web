import { InitialWindow, Workspace } from 'components';
import robotsApp from 'micro-apps/robots-app';
import robotMutexGroupsApp from 'micro-apps/robot-mutex-groups-app';

const robotsWorkspace: InitialWindow[] = [
  { layout: { x: 0, y: 0, w: 8, h: 5.3 }, microApp: robotsApp },
  { layout: { x: 8, y: 0, w: 4, h: 5.3 }, microApp: robotMutexGroupsApp },
];

const RobotsPage = () => {
  return <Workspace initialWindows={robotsWorkspace} />;
};

export default RobotsPage;
