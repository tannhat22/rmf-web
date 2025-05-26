import { InitialWindow, Workspace } from 'components';
import stationsApp from 'micro-apps/stations-app';

const StationsPage = () => {
  const hCustom = (window.innerHeight - 134 + 8) / 158;

  const stationsWorkspace: InitialWindow[] = [
    { layout: { x: 0, y: 0, w: 12, h: hCustom }, microApp: stationsApp },
  ];

  return <Workspace initialWindows={stationsWorkspace} />;
};

export default StationsPage;
