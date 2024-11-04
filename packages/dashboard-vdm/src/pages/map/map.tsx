// import { Box } from '@mui/material';

import { appConfig } from 'app-config';
import { InitialWindow, Workspace } from 'components';
import createMapApp from 'micro-apps/map-app';

// import Map from 'components/map';

const mapApp = createMapApp({
  attributionPrefix: appConfig.attributionPrefix,
  defaultMapLevel: appConfig.defaultMapLevel,
  defaultRobotZoom: appConfig.defaultRobotZoom,
  defaultZoom: appConfig.defaultZoom,
});

const mapWorkspace: InitialWindow[] = [{ layout: { x: 0, y: 0, w: 12, h: 5.3 }, microApp: mapApp }];

const MapPage = () => {
  return <Workspace initialWindows={mapWorkspace} />;
  // return (
  //   <Box
  //     sx={{
  //       position: 'relative',
  //       width: '100%',
  //       height: 'calc(100vh - 246px)',
  //       border: '1px solid #ccc',
  //       borderRadius: '16px',
  //       overflow: 'hidden',
  //     }}
  //   >
  //     <Map
  //       attributionPrefix={appConfig.attributionPrefix}
  //       defaultMapLevel={appConfig.defaultMapLevel}
  //       defaultRobotZoom={appConfig.defaultRobotZoom}
  //       defaultZoom={appConfig.defaultZoom}
  //     />
  //   </Box>
  // );
};

export default MapPage;
