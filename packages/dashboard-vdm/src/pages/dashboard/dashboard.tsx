import { WorkspaceState } from 'components/app-rmf/workspace';
import { Workspace } from 'components/app-rmf/workspace';

export const dashboardWorkspace: WorkspaceState = {
  layout: [{ i: 'map', x: 0, y: 0, w: 12, h: 12 }],
  windows: [{ key: 'map', appName: 'Map' }],
};

const MapPage = () => {
  return <Workspace state={dashboardWorkspace} />;
};

export default MapPage;
