import { InitialWindow, Workspace } from 'components';
import robotsApp from 'micro-apps/robots-app';
import robotMutexGroupsApp from 'micro-apps/robot-mutex-groups-app';

const RobotsPage = () => {
  const hCustom = (window.innerHeight - 134 + 8) / 158;

  const robotsWorkspace: InitialWindow[] = [
    { layout: { x: 0, y: 0, w: 8, h: hCustom }, microApp: robotsApp },
    { layout: { x: 8, y: 0, w: 4, h: hCustom }, microApp: robotMutexGroupsApp },
  ];

  return <Workspace initialWindows={robotsWorkspace} />;
};

export default RobotsPage;
