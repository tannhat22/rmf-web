// material-ui
// import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoIconDark from 'assets/images/logo-icon-dark.svg';
 * import logoIcon from 'assets/images/logo-icon.svg';
 * import { ThemeMode } from 'types/config';
 *
 */
import logoImage from 'assets/images/logo/mabuchi_motor_only_logo.jpeg';
// ==============================|| LOGO ICON SVG ||============================== //

const LogoIcon = () => {
  // const theme = useTheme();

  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={theme.palette.mode === ThemeMode.DARK ? logoIconDark : logoIcon} alt="Mantis" width="100" />
     *
     */
    <div style={{ width: '42px', height: '42px' }}>
      <img
        alt="Logo"
        src={logoImage}
        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LogoIcon;
