import { Box } from '@mui/material';
import RobotsTable from 'components/robots/robots-table';

const RobotsPage = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 108px)',
        border: '1px solid #ccc',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <RobotsTable />
    </Box>
  );
};

export default RobotsPage;
