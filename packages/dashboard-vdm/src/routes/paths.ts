// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}/${sublink}`;
}

const ROOTS_DASHBOARD = '/dashboard';
const ROOTS_MAINTENANCE = '/maintenance';

// ----------------------------------------------------------------------

export const PATH_ROOT = '/';

export const PATH_AUTH = {
  login: path(PATH_ROOT, 'login'),
  register: path(PATH_ROOT, 'register'),
  forgotPassword: path(PATH_ROOT, 'forgot-password'),
  checkMail: path(PATH_ROOT, 'check-mail'),
  resetPassword: path(PATH_ROOT, 'reset-password'),
  codeVerification: path(PATH_ROOT, 'code-verification'),
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  map: path(ROOTS_DASHBOARD, 'map'),
  systemOverView: path(ROOTS_DASHBOARD, 'system-overview'),
  tasks: path(ROOTS_DASHBOARD, 'tasks'),
};

export const PATH_SYSTEMOVERVIEW = {
  robots: path(PATH_DASHBOARD.systemOverView, 'robots'),
  doors: path(PATH_DASHBOARD.systemOverView, 'doors'),
  lifts: path(PATH_DASHBOARD.systemOverView, 'lifts'),
};

export const PATH_MAINTENANCE = {
  root: ROOTS_MAINTENANCE,
  error: path(ROOTS_MAINTENANCE, '404'),
  error500: path(ROOTS_MAINTENANCE, '500'),
  comingSoon: path(ROOTS_MAINTENANCE, 'coming-soon'),
  underConstruction: path(ROOTS_MAINTENANCE, 'under-construction'),
};
