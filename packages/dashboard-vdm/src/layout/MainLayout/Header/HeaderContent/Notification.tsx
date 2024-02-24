import React from 'react';
import { useRef, useState, useEffect, useContext } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

import { ReportOutlined } from '@mui/icons-material';

import {
  Avatar,
  Badge,
  Box,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';

import { ApiServerModelsTortoiseModelsAlertsAlertLeaf as Alert } from 'api-client';

import { AppEvents } from 'components/app-rmf/app-events';
import { RmfAppContext } from 'components/app-rmf/rmf-app';
import { Subscription } from 'rxjs';
import { formatDistance } from 'date-fns';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

// assets
import { BellOutlined, CheckCircleOutlined } from '@ant-design/icons';

// types
import { ThemeMode } from 'types/config';

import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { useLocales } from 'locales';

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem',
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',

  transform: 'none',
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

const Notification = () => {
  const rmf = useContext(RmfAppContext);
  const theme = useTheme();
  const { translate } = useLocales();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef<any>(null);

  const [open, setOpen] = useState(false);
  // const [viewAll, setViewAll] = useState(false);
  const [unacknowledgedAlertsNum, setUnacknowledgedAlertsNum] = useState(0);
  const [unacknowledgedAlertList, setUnacknowledgedAlertList] = useState<Alert[]>([]);

  const showAlertSnack = (color: string, message: string) => {
    dispatch(
      openSnackbar({
        open: true,
        message: message,
        variant: 'alert',
        alert: {
          color: color,
        },
        close: false,
      })
    );
  };

  const handleToggle = () => {
    if (!rmf) {
      return;
    }
    (async () => {
      const { data: alerts } = await rmf.alertsApi.getAlertsAlertsGet();
      const unackList = alerts.filter(
        (alert) => !alert.acknowledged_by && !alert.unix_millis_acknowledged_time
      );
      setUnacknowledgedAlertList(unackList.reverse());
    })();
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
    // setViewAll(false);
  };

  const handleAcknowledgedAll = (alerts: Alert[]) => {
    if (!rmf) {
      return;
    }

    alerts.map((alert) => {
      (async () => {
        try {
          const ackResponse = (
            await rmf?.alertsApi.acknowledgeAlertAlertsAlertIdPost(alert.original_id)
          ).data;

          if (ackResponse.id !== ackResponse.original_id) {
            // let showAlertMessage = `Alert ${ackResponse.original_id} acknowledged`;
            // if (ackResponse.acknowledged_by) {
            //   showAlertMessage += ` by User ${ackResponse.acknowledged_by}`;
            // }
            // if (ackResponse.unix_millis_acknowledged_time) {
            //   const ackSecondsAgo =
            //     (new Date().getTime() - ackResponse.unix_millis_acknowledged_time) / 1000;
            //   showAlertMessage += ` ${Math.round(ackSecondsAgo)}s ago`;
            // }
            setUnacknowledgedAlertList([]);
            // showAlertSnack('success', showAlertMessage);
          } else {
            throw new Error(`Failed to acknowledge alert ID ${alert.original_id}`);
          }
        } catch (error) {
          showAlertSnack('error', `Failed to acknowledge alert ID ${alert.original_id}`);
          // console.log(error);
        }
      })();
    });
  };

  const iconBackColorOpen = theme.palette.mode === ThemeMode.DARK ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'grey.100';

  useEffect(() => {
    if (!rmf) {
      return;
    }

    const subs: Subscription[] = [];
    subs.push(
      AppEvents.refreshAlert.subscribe({
        next: () => {
          (async () => {
            const resp = await rmf.alertsApi.getAlertsAlertsGet();
            const alerts = resp.data as Alert[];
            setUnacknowledgedAlertsNum(
              alerts.filter(
                (alert) => !(alert.acknowledged_by && alert.unix_millis_acknowledged_time)
              ).length
            );
          })();
        },
      })
    );

    // Get the initial number of unacknowledged alerts
    (async () => {
      const resp = await rmf.alertsApi.getAlertsAlertsGet();
      const alerts = resp.data as Alert[];
      setUnacknowledgedAlertsNum(
        alerts.filter((alert) => !(alert.acknowledged_by && alert.unix_millis_acknowledged_time))
          .length
      );
    })();
    return () => subs.forEach((s) => s.unsubscribe());
  }, [rmf]);

  // const handleOpenAlertList = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   if (!rmf) {
  //     return;
  //   }
  //   (async () => {
  //     const { data: alerts } = await rmf.alertsApi.getAlertsAlertsGet();
  //     const unackList = alerts.filter(
  //       (alert) => !alert.acknowledged_by && !alert.unix_millis_acknowledged_time
  //     );
  //     setUnacknowledgedAlertList(unackList.reverse());
  //   })();
  //   // setAlertListAnchor(event.currentTarget);
  // };

  const openAlertDialog = (alert: Alert) => {
    AppEvents.alertListOpenedAlert.next(alert);
  };

  const timeDistance = (time: number) => {
    return formatDistance(new Date(), new Date(time));
  };

  return (
    <Box component="div" sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={unacknowledgedAlertsNum} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? -5 : 0, 9],
              },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position={matchesXs ? 'top' : 'top-right'}
            sx={{ overflow: 'hidden' }}
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: '100%',
                minWidth: 285,
                maxWidth: 420,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 285,
                },
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title={translate('Notification')}
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {unacknowledgedAlertsNum > 0 && (
                        <Tooltip title="Mark as all read">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleAcknowledgedAll(unacknowledgedAlertList)}
                          >
                            <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' },
                      },
                      maxHeight: '480px',
                      overflow: 'auto',
                      position: 'relative',
                    }}
                  >
                    {unacknowledgedAlertList.length === 0 ? (
                      // <ListItemButton selected={unacknowledgedAlertsNum > 0}>
                      <ListItemButton>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ textAlign: 'center' }}>
                              No unacknowledged alerts!
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ) : (
                      unacknowledgedAlertList.map((alert) => (
                        <React.Fragment key={alert.id}>
                          <Divider />
                          <ListItemButton
                            selected={unacknowledgedAlertsNum > 0}
                            onClick={() => {
                              openAlertDialog(alert);
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  color: 'primary.main',
                                  bgcolor: 'primary.lighter',
                                }}
                              >
                                <ReportOutlined />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6">
                                  {alert.category[0].toUpperCase() + alert.category.slice(1)}{' '}
                                  <Typography component="span" variant="subtitle1">
                                    {alert.original_id}
                                  </Typography>{' '}
                                  had an alert.
                                </Typography>
                              }
                              secondary={`${timeDistance(alert.unix_millis_created_time)} ago`}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" noWrap>
                                {new Date(alert.unix_millis_created_time).toLocaleTimeString()}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                        </React.Fragment>
                      ))
                    )}
                    {/* {!viewAll && unacknowledgedAlertsNum > 5 ? (
                      <ListItemButton
                        sx={{ textAlign: 'center', py: `${12}px !important` }}
                        onClick={() => setViewAll(true)}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="h6" color="primary">
                              View All
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ) : null} */}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Notification;
