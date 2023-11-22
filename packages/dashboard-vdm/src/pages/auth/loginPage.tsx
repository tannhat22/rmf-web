// import { Link } from 'react-router-dom';

// material-ui
// import { Grid, Stack, Typography } from '@mui/material';

// project import
import useAuthContext from 'auth/useAuthContext';
import { LoginPage } from 'rmf-auth';
import { PATH_DASHBOARD } from 'routes/paths';

// ================================|| LOGIN ||================================ //

const Login = () => {
  const { login } = useAuthContext();

  return (
    <LoginPage
      title={'Dashboard'}
      logo="assets/defaultLogo.png"
      onLoginClick={() => login(`${window.location.origin}${PATH_DASHBOARD.root}`)}
    />
  );
};

export default Login;
