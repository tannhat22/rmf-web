import { createMicroApp } from 'components/micro-app';

export default createMicroApp(
  'stations-table',
  'Stations',
  () => import('../components/stations-table'),
  () => ({})
);
