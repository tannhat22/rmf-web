import { InitialWindow, Workspace } from 'components';
import robotsApp from 'micro-apps/robots-app';

const robotsWorkspace: InitialWindow[] = [
  { layout: { x: 0, y: 0, w: 12, h: 5.3 }, microApp: robotsApp },
];

const RobotsPage = () => {
  return <Workspace initialWindows={robotsWorkspace} />;
};

export default RobotsPage;
