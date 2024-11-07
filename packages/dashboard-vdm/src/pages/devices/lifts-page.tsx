import { InitialWindow, Workspace } from 'components';
import liftsApp from 'micro-apps/lifts-app';

const LiftsPage = () => {
  const hCustom = (window.innerHeight - 178 + 8) / 158;

  const liftsWorkspace: InitialWindow[] = [
    { layout: { x: 0, y: 0, w: 12, h: hCustom }, microApp: liftsApp },
  ];

  return <Workspace initialWindows={liftsWorkspace} />;
};

export default LiftsPage;
