import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React from 'react';
import {
  base,
  Place,
  stationTypeToString,
  stationModeToString,
  StationTableData,
} from 'react-components';

import { StationRequest as RmfStationRequest } from 'rmf-models/ros/machine_fleet_msgs/msg';
import { useRmfApi } from '../hooks/use-rmf-api';
import { getApiErrorMessage } from '../utils/api';

interface StationSummaryProps {
  onClose: () => void;
  station: Place;
}

export const StationSummary = ({ onClose, station }: StationSummaryProps): JSX.Element => {
  const isScreenHeightLessThan800 = useMediaQuery('(max-height:800px)');
  const rmfApi = useRmfApi();
  const [stationData, setStationData] = React.useState<StationTableData>({
    index: 0,
    name: '',
    levelName: '',
    stationType: 0,
    currentMode: 0,
    stationState: undefined,
  });

  React.useEffect(() => {
    const fetchDataForStation = async () => {
      try {
        const sub = rmfApi.getStationStateObs(station.vertex.name).subscribe((stationState) => {
          setStationData({
            index: -1,
            name: station.vertex.name,
            levelName: station.level,
            stationType:
              station.pickupHandler !== undefined
                ? RmfStationRequest.TYPE_PICKUP
                : RmfStationRequest.TYPE_DROPOFF,
            currentMode: stationState.mode,
          });
        });
        return () => sub.unsubscribe();
      } catch (error) {
        console.error(`Failed to get station health: ${getApiErrorMessage(error)}`);
      }
    };

    fetchDataForStation();
  }, [rmfApi, station]);

  const [isOpen, setIsOpen] = React.useState(true);

  const theme = useTheme();

  return (
    <Dialog
      PaperProps={{
        style: {
          boxShadow: 'none',
          background: base.palette.info.main,
        },
      }}
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
        onClose();
      }}
      fullWidth
      maxWidth={isScreenHeightLessThan800 ? 'xs' : 'sm'}
    >
      <DialogTitle
        align="center"
        sx={{ fontSize: isScreenHeightLessThan800 ? '1.2rem' : '1.5rem' }}
      >
        Station summary
      </DialogTitle>
      <Divider />
      <DialogContent>
        {Object.entries(stationData).map(([key, value]) => {
          if (key === 'index') {
            return <></>;
          }
          let displayValue = value;
          let displayLabel = key;
          switch (key) {
            case 'name':
              displayLabel = 'Name';
              break;
            case 'levelName':
              displayLabel = 'Current Floor';
              break;
            case 'stationType':
              displayValue = stationTypeToString(value);
              displayLabel = 'Station Type';
              break;

            case 'currentMode':
              displayValue = stationModeToString(value);
              displayLabel = 'Mode';
              break;
            default:
              break;
          }
          return (
            <div key={stationData.name + key}>
              <TextField
                label={displayLabel}
                id="standard-size-small"
                size="small"
                variant="filled"
                InputProps={{ readOnly: true }}
                fullWidth={true}
                multiline
                maxRows={4}
                margin="dense"
                value={displayValue}
                sx={{
                  '& .MuiFilledInput-root': {
                    fontSize: isScreenHeightLessThan800 ? '0.8rem' : '1.15',
                  },
                  background: theme.palette.background.default,
                  '&:hover': {
                    backgroundColor: theme.palette.background.default,
                  },
                }}
              />
            </div>
          );
        })}
      </DialogContent>
    </Dialog>
  );
};
