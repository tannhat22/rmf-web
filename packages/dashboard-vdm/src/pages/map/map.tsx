import { Box } from '@mui/material';

import { appConfig } from 'app-config';
import Map from 'components/map';

const MapPage = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 108px)',
        border: '1px solid #ccc',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <Map
        attributionPrefix={appConfig.attributionPrefix}
        defaultMapLevel={appConfig.defaultMapLevel}
        defaultRobotZoom={appConfig.defaultRobotZoom}
        defaultZoom={appConfig.defaultZoom}
      />
    </Box>
  );
};

export default MapPage;
