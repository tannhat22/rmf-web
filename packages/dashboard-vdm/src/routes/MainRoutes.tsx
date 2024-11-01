import { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'auth/AuthGuard';
import { PATH_ROOT, PATH_DASHBOARD, PATH_MAINTENANCE } from './paths';

// pages routing
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(
  lazy(() => import('pages/maintenance/under-construction'))
);
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: PATH_ROOT,
  children: [
    {
      path: PATH_ROOT,
      element: (
        // <AuthGuard>
        <MainLayout />
        // </AuthGuard>
      ),
      children: [
        {
          path: PATH_DASHBOARD.root,
          element: <SamplePage />,
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
