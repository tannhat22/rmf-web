import { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'auth/AuthGuard';
import { PATH_ROOT, PATH_DASHBOARD, PATH_MAINTENANCE, PATH_DEVICE } from './paths';

// rmf-web
import { appConfig, authenticator } from 'app-config';

// pages routing
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(
  lazy(() => import('pages/maintenance/under-construction'))
);
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));

// render - sample page
// const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const SystemOverviewPage = Loadable(lazy(() => import('pages/system-overview/system-overview')));
const MapPage = Loadable(lazy(() => import('pages/map/map')));
const RobotsPage = Loadable(lazy(() => import('pages/devices/robots-page')));
const DoorsPage = Loadable(lazy(() => import('pages/devices/doors-page')));
const LiftsPage = Loadable(lazy(() => import('pages/devices/lifts-page')));
const TasksPage = Loadable(lazy(() => import('pages/tasks/tasks')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: PATH_ROOT,
  children: [
    {
      path: PATH_ROOT,
      element: (
        <AuthGuard>
          <MainLayout
            apiServerUrl={appConfig.rmfServerUrl}
            trajectoryServerUrl={appConfig.trajectoryServerUrl}
            authenticator={authenticator}
            resources={appConfig.resources.default}
            tasks={{
              allowedTasks: appConfig.allowedTasks,
              pickupZones: appConfig.pickupZones,
              cartIds: appConfig.cartIds,
            }}
          />
        </AuthGuard>
      ),
      children: [
        {
          path: PATH_DASHBOARD.root,
          element: <SystemOverviewPage />,
        },
        {
          path: PATH_DASHBOARD.map,
          element: <MapPage />,
        },
        {
          path: PATH_DEVICE.robots,
          element: <RobotsPage />,
        },
        {
          path: PATH_DEVICE.doors,
          element: <DoorsPage />,
        },
        {
          path: PATH_DEVICE.lifts,
          element: <LiftsPage />,
        },
        {
          path: PATH_DASHBOARD.tasks,
          element: <TasksPage />,
        },
      ],
    },
    {
      path: PATH_MAINTENANCE.root,
      element: <CommonLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />,
        },
        {
          path: '500',
          element: <MaintenanceError500 />,
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />,
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />,
        },
      ],
    },
    {
      path: '*',
      element: <CommonLayout />,
      children: [
        {
          path: '*',
          element: <MaintenanceError />,
        },
      ],
    },
  ],
};

export default MainRoutes;
