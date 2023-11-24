import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Container, Toolbar } from '@mui/material';

// project import
import Drawer from './Drawer';
import Header from './Header';
import Footer from './Footer';
import HorizontalBar from './Drawer/HorizontalBar';
import Breadcrumbs from 'components/Breadcrumbs';

import navigation from 'menu-items';
import useConfig from 'hooks/useConfig';
import { dispatch } from 'store';
import { openDrawer } from 'store/reducers/menu';

// types
import { MenuOrientation } from 'types/config';

// RMF-app
import appConfig from 'app-config';
import ResourceManager from 'managers/resource-manager';
import { ResourcesContext } from 'contexts/app-contexts';
import { RmfApp } from 'components/app-rmf/rmf-app';

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const matchDownXL = useMediaQuery(theme.breakpoints.down('xl'));
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { container, miniDrawer, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const resourceManager = useRef<ResourceManager | undefined>(undefined);
  const [appReady, setAppReady] = useState(false);

  /**
   * TODO: If resource loading gets too long we should add a loading screen.
   */
  useEffect(() => {
    (async () => {
      const appResources = await appConfig.appResourcesFactory();
      if (!appResources) {
        setAppReady(true);
      } else {
        resourceManager.current = appResources;
        setAppReady(true);
      }
    })();
  }, []);

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      dispatch(openDrawer(!matchDownXL));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchDownXL]);

  return appReady ? (
    <ResourcesContext.Provider value={resourceManager.current}>
      <RmfApp>
        <Box component="div" sx={{ display: 'flex', width: '100%' }}>
          <Header />
          {!isHorizontal ? <Drawer /> : <HorizontalBar />}

          <Box
            component="main"
            sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}
          >
            <Toolbar sx={{ mt: isHorizontal ? 8 : 'inherit' }} />
            <Container
              maxWidth={container ? 'xl' : false}
              sx={{
                ...(container && { px: { xs: 0, sm: 2 } }),
                position: 'relative',
                minHeight: 'calc(100vh - 110px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Breadcrumbs navigation={navigation} title icons card={false} divider={false} />
              <Outlet />
              <Footer />
            </Container>
          </Box>
        </Box>
      </RmfApp>
    </ResourcesContext.Provider>
  ) : null;
};

export default MainLayout;
