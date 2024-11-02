import { Box } from '@mui/material';
import DoorsTable from 'components/doors-table';

const DoorsPage = () => {
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
      <DoorsTable />
    </Box>
  );
};

export default DoorsPage;
