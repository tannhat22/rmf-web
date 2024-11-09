import { Link, useLocation } from 'react-router-dom';
import { To } from 'history';

// material-ui
import { ButtonBase } from '@mui/material';
import { SxProps } from '@mui/system';

// project import
import Logo from './LogoMain';
import LogoIcon from './LogoIcon';
import { APP_DEFAULT_PATH } from 'config';

// ==============================|| MAIN LOGO ||============================== //

interface Props {
  reverse?: boolean;
  isIcon?: boolean;
  sx?: SxProps;
  to?: To;
}

const LogoSection = ({ reverse, isIcon, sx, to }: Props) => {
  const { pathname } = useLocation();
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (pathname === (!to ? APP_DEFAULT_PATH : to)) {
      e.preventDefault();
    }
  };

  return (
    <ButtonBase
      disableRipple
      component={Link}
      to={!to ? APP_DEFAULT_PATH : to}
      sx={sx}
      onClick={handleClick}
    >
      {isIcon ? <LogoIcon /> : <Logo reverse={reverse} />}
    </ButtonBase>
  );
};

export default LogoSection;
