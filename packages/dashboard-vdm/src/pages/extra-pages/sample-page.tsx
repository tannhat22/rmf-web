// material-ui
import { Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import { useLocales } from 'locales';

// ==============================|| SAMPLE PAGE ||============================== //

const SamplePage = () => {
  const { translate } = useLocales();
  return (
    <MainCard title="Sample Card">
      <Typography variant="body2">{translate('demo.introduction')}</Typography>
    </MainCard>
  );
};

export default SamplePage;
