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

const robotsWorkspaceLg: InitialWindow[] = [
  { layout: { x: 0, y: 0, w: 7, h: 5.6 }, microApp: tasksApp },
  { layout: { x: 8, y: 0, w: 5, h: 2.8 }, microApp: mapApp },
  { layout: { x: 8, y: 2.8, w: 5, h: 2.8 }, microApp: robotsApp },
];

// const robotsWorkspaceMd: InitialWindow[] = [
//   { layout: { x: 0, y: 0, w: 12, h: 5 }, microApp: tasksApp },
//   { layout: { x: 0, y: 5, w: 12, h: 5 }, microApp: robotsApp },
//   { layout: { x: 0, y: 10, w: 12, h: 5 }, microApp: mapApp },
// ];

const SystemOverview = () => {
  // const theme = useTheme();
  // const matchUpLg = useMediaQuery(theme.breakpoints.up('lg'));

  return <Workspace initialWindows={robotsWorkspaceLg} />;
};

export default SystemOverview;
