import { Box } from '@mui/material';
import LiftsTable from 'components/lifts-table';

const LiftsPage = () => {
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
      <LiftsTable />
    </Box>
  );
};

export default LiftsPage;
