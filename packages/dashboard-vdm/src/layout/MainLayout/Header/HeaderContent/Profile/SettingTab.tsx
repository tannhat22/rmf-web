import { useState } from 'react';

// material-ui
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

// assets
import {
  CommentOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  LockOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useLocales } from 'locales';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

const SettingTab = () => {
  const { translate } = useLocales();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullScreen, setFullScreen] = useState(!!document.fullscreenElement);
  const handleListItemClick = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    setSelectedIndex(index);
  };

  const handleSizeScreen = (event: React.MouseEvent<HTMLDivElement>) => {
    const elem = document.documentElement;
    if (!fullScreen) {
      elem.requestFullscreen();
      setFullScreen(true);
    } else {
      document.exitFullscreen();
      setFullScreen(false);
    }
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton
        selected={selectedIndex === 0}
        onClick={(event: React.MouseEvent<HTMLDivElement>) => handleListItemClick(event, 0)}
      >
        <ListItemIcon>
          <QuestionCircleOutlined />
        </ListItemIcon>
        <ListItemText primary={translate('Support')} />
      </ListItemButton>
      <ListItemButton
        selected={selectedIndex === 1}
        onClick={(event: React.MouseEvent<HTMLDivElement>) => handleListItemClick(event, 1)}
      >
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary={translate('Account Settings')} />
      </ListItemButton>
      <ListItemButton
        selected={selectedIndex === 2}
        onClick={(event: React.MouseEvent<HTMLDivElement>) => handleListItemClick(event, 2)}
      >
        <ListItemIcon>
          <CommentOutlined />
        </ListItemIcon>
        <ListItemText primary={translate('Feedback')} />
      </ListItemButton>
      <ListItemButton
        // selected={selectedIndex === 3}
        onClick={(event: React.MouseEvent<HTMLDivElement>) => handleSizeScreen(event)}
      >
        <ListItemIcon>
          {fullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </ListItemIcon>
        <ListItemText
          primary={fullScreen ? translate('Exit fullscreen') : translate('Fullscreen')}
        />
      </ListItemButton>
    </List>
  );
};

export default SettingTab;
