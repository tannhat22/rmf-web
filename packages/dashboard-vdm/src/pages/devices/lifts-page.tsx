import { InitialWindow, Workspace } from 'components';
import liftsApp from 'micro-apps/lifts-app';

const liftsWorkspace: InitialWindow[] = [
  { layout: { x: 0, y: 0, w: 12, h: 5.3 }, microApp: liftsApp },
];

const LiftsPage = () => {
  return <Workspace initialWindows={liftsWorkspace} />;
};

export default LiftsPage;
