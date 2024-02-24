// @mui
import { enUS, zhCN, viVN } from '@mui/material/locale';

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'English',
    value: 'en',
    systemValue: enUS,
  },
  {
    label: 'Chinese',
    value: 'cn',
    systemValue: zhCN,
  },
  {
    label: 'Vietnamese',
    value: 'vn',
    systemValue: viVN,
  },
];

export const defaultLang = allLangs[0]; // English
