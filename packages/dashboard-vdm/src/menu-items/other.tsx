// assets
import {
  ChromeOutlined,
  QuestionOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons';

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
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const other: NavItemType = {
  id: 'other',
  title: 'others',
  type: 'group',
  children: [
    {
      id: 'sample-page',
      title: 'Sample Page',
      type: 'collapse',
      url: PATH_DASHBOARD.root,
      icon: icons.ChromeOutlined,
      // breadcrumbs: true,
      children: [
        {
          id: 'dashboard',
          title: 'dashboard',
          type: 'collapse',
          url: PATH_DASHBOARD.root,
          icon: icons.DashboardOutlined,
        },
        {
          id: 'documentation',
          title: 'documentation',
          type: 'item',
          url: 'https://codedthemes.gitbook.io/mantis/',
          icon: icons.QuestionOutlined,
          external: true,
          target: true,
          chip: {
            label: 'gitbook',
            color: 'secondary',
            size: 'small',
          },
        },
      ],
    },
    {
      id: 'documentation',
      title: 'documentation',
      type: 'item',
      url: 'https://codedthemes.gitbook.io/mantis/',
      icon: icons.QuestionOutlined,
      external: true,
      target: true,
      chip: {
        label: 'gitbook',
        color: 'secondary',
        size: 'small',
      },
    },
    {
      id: 'roadmap',
      title: 'roadmap',
      type: 'item',
      url: 'https://codedthemes.gitbook.io/mantis/roadmap',
      icon: icons.DeploymentUnitOutlined,
      external: true,
      target: true,
    },
  ],
};

export default other;
