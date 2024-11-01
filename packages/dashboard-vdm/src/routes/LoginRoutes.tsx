import { lazy } from 'react';

// project import
import GuestGuard from 'auth/GuestGuard';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import { PATH_ROOT } from './paths';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/auth/login')));
const AuthRegister = Loadable(lazy(() => import('pages/auth/register')));
const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/forgot-password')));
const AuthCheckMail = Loadable(lazy(() => import('pages/auth/check-mail')));
const AuthResetPassword = Loadable(lazy(() => import('pages/auth/reset-password')));
const AuthCodeVerification = Loadable(lazy(() => import('pages/auth/code-verification')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: PATH_ROOT,
  children: [
    {
      path: PATH_ROOT,
      element: (
        <GuestGuard>
          <CommonLayout />
        </GuestGuard>
      ),
      children: [
        {
          path: PATH_ROOT,
          element: <AuthLogin />,
        },
        {
          path: 'login',
          element: <AuthLogin />,
        },
        {
          path: 'register',
          element: <AuthRegister />,
        },
        {
          path: 'forgot-password',
          element: <AuthForgotPassword />,
        },
        {
          path: 'check-mail',
          element: <AuthCheckMail />,
        },
        {
          path: 'reset-password',
          element: <AuthResetPassword />,
        },
        {
          path: 'code-verification',
          element: <AuthCodeVerification />,
        },
      ],
    },
  ],
};

export default LoginRoutes;
