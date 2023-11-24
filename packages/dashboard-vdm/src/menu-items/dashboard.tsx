// assets
import {
  ChromeOutlined,
  QuestionOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons';

import { MapOutlined, SmartToyOutlined, AssignmentTurnedInOutlined } from '@mui/icons-material';

// type
import { NavItemType } from 'types/menu';

// paths
import { PATH_DASHBOARD } from 'routes/paths';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined,
  DeploymentUnitOutlined,
  DashboardOutlined,
  MapOutlined,
  SmartToyOutlined,
  AssignmentTurnedInOutlined,
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const dashboard: NavItemType = {
  id: 'dashboard',
  title: 'dashboards',
  type: 'group',
  children: [
    {
      id: 'map-page',
      title: 'Map',
      type: 'item',
      url: PATH_DASHBOARD.root,
      icon: icons.MapOutlined,
      breadcrumbs: true,
      // children: [
      //   {
      //     id: 'dashboard',
      //     title: 'dashboard',
      //     type: 'collapse',
      //     url: PATH_DASHBOARD.root,
      //     icon: icons.DashboardOutlined,
      //   },
      //   {
      //     id: 'documentation',
      //     title: 'documentation',
      //     type: 'item',
      //     url: 'https://codedthemes.gitbook.io/mantis/',
      //     icon: icons.QuestionOutlined,
      //     external: true,
      //     target: true,
      //     chip: {
      //       label: 'gitbook',
      //       color: 'secondary',
      //       size: 'small',
      //     },
      //   },
      // ],
    },
    {
      id: 'robot-page',
      title: 'Robot',
      type: 'item',
      url: PATH_DASHBOARD.robots,
      icon: icons.SmartToyOutlined,
      breadcrumbs: true,
    },
    {
      id: 'task-page',
      title: 'Task',
      type: 'item',
      url: PATH_DASHBOARD.tasks,
      icon: icons.AssignmentTurnedInOutlined,
      breadcrumbs: true,
    },
    // {
    //   id: 'documentation',
    //   title: 'documentation',
    //   type: 'item',
    //   url: 'https://codedthemes.gitbook.io/mantis/',
    //   icon: icons.QuestionOutlined,
    //   external: true,
    //   target: true,
    //   chip: {
    //     label: 'gitbook',
    //     color: 'secondary',
    //     size: 'small',
    //   },
    // },
  ],
};

export default dashboard;
