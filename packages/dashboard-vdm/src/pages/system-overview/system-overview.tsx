// import { useMediaQuery } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
import { appConfig } from 'app-config';
import { InitialWindow, Workspace } from 'components';
import createMapApp from 'micro-apps/map-app';
import robotsApp from 'micro-apps/robots-app';
import tasksApp from 'micro-apps/tasks-app';

const mapApp = createMapApp({
  attributionPrefix: appConfig.attributionPrefix,
  defaultMapLevel: appConfig.defaultMapLevel,
  defaultRobotZoom: appConfig.defaultRobotZoom,
  defaultZoom: appConfig.defaultZoom,
});

const SystemOverview = () => {
  const hCustom = (window.innerHeight - 134 + 8) / 158;

  const robotsWorkspaceLg: InitialWindow[] = [
    { layout: { x: 0, y: 0, w: 7, h: hCustom }, microApp: tasksApp },
    { layout: { x: 8, y: 0, w: 5, h: hCustom / 2 }, microApp: mapApp },
    { layout: { x: 8, y: hCustom / 2, w: 5, h: hCustom / 2 }, microApp: robotsApp },
  ];

  return <Workspace initialWindows={robotsWorkspaceLg} />;
};

export default SystemOverview;
