import { appConfig } from 'app-config';
import { InitialWindow, Workspace } from 'components';
import createMapApp from 'micro-apps/map-app';
import doorsApp from 'micro-apps/doors-app';
import liftsApp from 'micro-apps/lifts-app';
import robotMutexGroupsApp from 'micro-apps/robot-mutex-groups-app';
import robotsApp from 'micro-apps/robots-app';
// import tasksApp from 'micro-apps/tasks-app';

const mapApp = createMapApp({
  attributionPrefix: appConfig.attributionPrefix,
  defaultMapLevel: appConfig.defaultMapLevel,
  defaultRobotZoom: appConfig.defaultRobotZoom,
  defaultZoom: appConfig.defaultZoom,
});

const robotsWorkspace: InitialWindow[] = [
  {
    layout: { x: 0, y: 0, w: 7, h: 4 },
    microApp: robotsApp,
  },
  { layout: { x: 8, y: 0, w: 5, h: 8 }, microApp: mapApp },
  { layout: { x: 0, y: 0, w: 7, h: 4 }, microApp: doorsApp },
  { layout: { x: 0, y: 0, w: 7, h: 4 }, microApp: liftsApp },
  { layout: { x: 8, y: 0, w: 5, h: 4 }, microApp: robotMutexGroupsApp },
];

const SystemOverview = () => {
  return <Workspace initialWindows={robotsWorkspace} />;
};

export default SystemOverview;
