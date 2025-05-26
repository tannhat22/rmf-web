// assets
import {
  ChromeOutlined,
  QuestionOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  HomeOutlined,
} from '@ant-design/icons';

import {
  MapOutlined,
  SmartToyOutlined,
  AssignmentTurnedInOutlined,
  DoorSlidingOutlined,
  ElevatorOutlined,
  ShoppingCartOutlined,
} from '@mui/icons-material';

// type
import { NavItemType } from 'types/menu';

// paths
import { PATH_DASHBOARD, PATH_DEVICE } from 'routes/paths';

// icons
const icons = {
  HomeOutlined,
  ChromeOutlined,
  QuestionOutlined,
  DeploymentUnitOutlined,
  DashboardOutlined,
  MapOutlined,
  SmartToyOutlined,
  AssignmentTurnedInOutlined,
  DoorSlidingOutlined,
  ElevatorOutlined,
  ShoppingCartOutlined,
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const dashboard: NavItemType = {
  id: 'dashboard',
  title: 'Dashboards',
  type: 'group',
  children: [
    {
      id: 'system-overview',
      title: 'System overview',
      type: 'item',
      url: PATH_DASHBOARD.root,
      icon: icons.HomeOutlined,
      breadcrumbs: true,
    },
    {
      id: 'map',
      title: 'Map',
      type: 'item',
      url: PATH_DASHBOARD.map,
      icon: icons.MapOutlined,
      breadcrumbs: true,
    },
    {
      id: 'devices',
      title: 'Devices',
      type: 'collapse',
      icon: icons.DashboardOutlined,
      children: [
        {
          id: 'robots',
          title: 'Robots',
          type: 'item',
          url: PATH_DEVICE.robots,
          icon: icons.SmartToyOutlined,
          breadcrumbs: true,
        },
        {
          id: 'doors',
          title: 'Doors',
          type: 'item',
          url: PATH_DEVICE.doors,
          icon: icons.DoorSlidingOutlined,
          breadcrumbs: true,
        },
        {
          id: 'lifts',
          title: 'Lifts',
          type: 'item',
          url: PATH_DEVICE.lifts,
          icon: icons.ElevatorOutlined,
          breadcrumbs: true,
        },
        {
          id: 'stations',
          title: 'Stations',
          type: 'item',
          url: PATH_DEVICE.stations,
          icon: icons.ShoppingCartOutlined,
          breadcrumbs: true,
        },
      ],
    },
    {
      id: 'tasks',
      title: 'Tasks',
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
