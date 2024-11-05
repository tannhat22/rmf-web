import { useEffect } from 'react';
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

// rmf-web
import { Alert, AlertProps, Snackbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import { getDefaultTaskDefinition } from 'react-components';

import { AppController, AppControllerProvider } from 'hooks/use-app-controller';
import { AuthenticatorProvider } from 'hooks/use-authenticator';
import { Resources, ResourcesProvider } from 'hooks/use-resources';
import { RmfApiProvider } from 'hooks/use-rmf-api';
import { SettingsProvider } from 'hooks/use-settings';
import { TaskRegistry, TaskRegistryProvider } from 'hooks/use-task-registry';
import { UserProfileProvider } from 'hooks/use-user-profile';
import { Authenticator, UserProfile } from 'services/authenticator';
import { DefaultRmfApi } from 'services/rmf-api';
import { loadSettings, saveSettings, Settings } from 'services/settings';
import { AlertManager } from 'components/alert-manager';
import { DeliveryAlertStore } from 'components/delivery-alert-store';
import { DashboardThemes } from 'components/theme';

// ==============================|| MAIN LAYOUT ||============================== //

const DefaultAlertDuration = 2000;

export interface AllowedTask {
  /**
   * The task definition to configure.
   */
  taskDefinitionId: 'patrol' | 'delivery' | 'compose-clean' | 'custom_compose';

  /**
   * Configure the display name for the task definition.
   */
  displayName?: string;

  /**
   * The color of the event when rendered on the task scheduler in the form of a CSS color string.
   */
  scheduleEventColor?: string;
}

export interface TaskRegistryInput extends Omit<TaskRegistry, 'taskDefinitions'> {
  allowedTasks: AllowedTask[];
}

export interface MainLayoutProps {
  /**
   * Url of the RMF api server.
   */
  apiServerUrl: string;

  /**
   * Url of the RMF trajectory server.
   */
  trajectoryServerUrl: string;

  authenticator: Authenticator;

  themes?: DashboardThemes;

  /**
   * Set various resources (icons, logo etc) used. Different resource can be used based on the theme, `default` is always required.
   */
  resources: Resources;

  /**
   * List of allowed tasks that can be requested
   */
  tasks: TaskRegistryInput;

  /**
   * Url to a file to be played when an alert occurs on the dashboard.
   */
  alertAudioPath?: string;
}

// Tạo theme mặc định
const defaultTheme = createTheme();

const MainLayout = (props: MainLayoutProps) => {
  const {
    apiServerUrl,
    trajectoryServerUrl,
    authenticator,
    themes,
    resources,
    tasks,
    alertAudioPath,
  } = props;

  const themeOrin = useTheme();
  const matchDownXL = useMediaQuery(themeOrin.breakpoints.down('xl'));
  const downLG = useMediaQuery(themeOrin.breakpoints.down('lg'));

  const { container, miniDrawer, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const rmfApi = React.useMemo(
    () => new DefaultRmfApi(apiServerUrl, trajectoryServerUrl, authenticator),
    [apiServerUrl, trajectoryServerUrl, authenticator]
  );

  // FIXME(koonepng): This should be fully definition in tasks resources when the dashboard actually
  // supports configuring all the fields.
  const taskRegistry = React.useMemo<TaskRegistry>(
    () => ({
      taskDefinitions: tasks.allowedTasks.map((t) => {
        const defaultTaskDefinition = getDefaultTaskDefinition(t.taskDefinitionId);
        if (!defaultTaskDefinition) {
          throw Error(`Invalid tasks configured for dashboard: [${t.taskDefinitionId}]`);
        }
        const taskDefinition = { ...defaultTaskDefinition };
        if (t.displayName !== undefined) {
          taskDefinition.taskDisplayName = t.displayName;
        }
        if (t.scheduleEventColor !== undefined) {
          taskDefinition.scheduleEventColor = t.scheduleEventColor;
        }
        return taskDefinition;
      }),
      pickupZones: tasks.pickupZones,
      cartIds: tasks.cartIds,
    }),
    [tasks.allowedTasks, tasks.pickupZones, tasks.cartIds]
  );

  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const user = (await rmfApi.defaultApi.getUserUserGet()).data;
        const perm = (await rmfApi.defaultApi.getEffectivePermissionsPermissionsGet()).data;
        setUserProfile({ user, permissions: perm });
      } catch (e) {
        console.error(e);
        setUserProfile(null);
      }
    })();
  }, [authenticator, rmfApi]);

  const [settings, setSettings] = React.useState(() => loadSettings());
  const updateSettings = React.useCallback((newSettings: Settings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const [showAlert, setShowAlert] = React.useState(false);
  const [alertSeverity, setAlertSeverity] = React.useState<AlertProps['severity']>('error');
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertDuration, setAlertDuration] = React.useState(DefaultAlertDuration);
  const [extraAppbarItems, setExtraAppbarItems] = React.useState<React.ReactNode>(null);
  const appController = React.useMemo<AppController>(
    () => ({
      updateSettings,
      showAlert: (severity, message, autoHideDuration) => {
        setAlertSeverity(severity);
        setAlertMessage(message);
        setShowAlert(true);
        setAlertDuration(autoHideDuration || DefaultAlertDuration);
      },
      setExtraAppbarItems,
    }),
    [updateSettings]
  );

  // const theme = React.useMemo(() => {
  //   if (!themes) {
  //     return null;
  //   }
  //   return themes[settings.themeMode] || themes.default;
  // }, [themes, settings.themeMode]);

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      dispatch(openDrawer(!matchDownXL));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchDownXL]);

  const providers = userProfile && (
    <AuthenticatorProvider value={authenticator}>
      <UserProfileProvider value={userProfile}>
        <ResourcesProvider value={resources}>
          <TaskRegistryProvider value={taskRegistry}>
            <RmfApiProvider value={rmfApi}>
              <SettingsProvider value={settings}>
                <AppControllerProvider value={appController}>
                  <DeliveryAlertStore />
                  <AlertManager alertAudioPath={alertAudioPath} />
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    <Header />
                    {!isHorizontal ? <Drawer /> : <HorizontalBar />}
                    <Box
                      component="main"
                      sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 1.5, sm: 1.5 } }}
                    >
                      <Toolbar sx={{ mt: isHorizontal ? 8 : 'inherit' }} />
                      <Container
                        maxWidth={container ? 'xl' : false}
                        sx={{
                          // ...(container && { px: { xs: 0, sm: 2 } }),
                          position: 'relative',
                          minHeight: 'calc(100vh - 110px)',
                          display: 'flex',
                          flexDirection: 'column',
                          px: '0 !important',
                        }}
                      >
                        <Breadcrumbs
                          navigation={navigation}
                          title
                          icons
                          card={false}
                          divider={false}
                        />
                        <ThemeProvider theme={defaultTheme}>
                          <Outlet />
                        </ThemeProvider>
                        <Footer />
                      </Container>
                    </Box>
                  </Box>
                  <Snackbar
                    open={showAlert}
                    message={alertMessage}
                    onClose={() => setShowAlert(false)}
                    autoHideDuration={alertDuration}
                  >
                    <Alert
                      onClose={() => setShowAlert(false)}
                      severity={alertSeverity}
                      sx={{ width: '100%' }}
                    >
                      {alertMessage}
                    </Alert>
                  </Snackbar>
                </AppControllerProvider>
              </SettingsProvider>
            </RmfApiProvider>
          </TaskRegistryProvider>
        </ResourcesProvider>
      </UserProfileProvider>
    </AuthenticatorProvider>
  );

  // return theme ? <ThemeProvider theme={theme}>{providers}</ThemeProvider> : providers;
  return providers;
};

export default MainLayout;
