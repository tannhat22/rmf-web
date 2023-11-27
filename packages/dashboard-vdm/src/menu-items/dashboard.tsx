// assets
import {
  ChromeOutlined,
  QuestionOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons';

import {
  MapOutlined,
  SmartToyOutlined,
  AssignmentTurnedInOutlined,
  DoorSlidingOutlined,
  ElevatorOutlined,
} from '@mui/icons-material';

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
  DoorSlidingOutlined,
  ElevatorOutlined,
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const dashboard: NavItemType = {
  id: 'dashboard',
  title: 'Dashboards',
  type: 'group',
  children: [
    {
      id: 'system-overview-page',
      title: 'System Overview',
      type: 'collapse',
      // url: PATH_DASHBOARD.root,
      icon: icons.DashboardOutlined,
      // breadcrumbs: true,
      children: [
        {
          id: 'robots',
          title: 'Robots',
          type: 'item',
          url: PATH_DASHBOARD.robots,
          icon: icons.SmartToyOutlined,
        },
        {
          id: 'doors',
          title: 'Doors',
          type: 'item',
          url: PATH_DASHBOARD.doors,
          icon: icons.DoorSlidingOutlined,
        },
        {
          id: 'lifts',
          title: 'Lifts',
          type: 'item',
          url: PATH_DASHBOARD.lifts,
          icon: icons.ElevatorOutlined,
        },
      ],
    },
    {
      id: 'map-page',
      title: 'Map',
      type: 'item',
      url: PATH_DASHBOARD.map,
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
