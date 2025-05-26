import { Autocomplete, styled } from '@mui/material';
import TextField from '@mui/material/TextField';
import React from 'react';
// import { StationRequest as RmfStationRequest } from 'rmf-models/ros/machine_fleet_msgs/msg';

import { ConfirmationDialog, ConfirmationDialogProps } from '../confirmation-dialog';
import { requestStationModeToString } from './station-utils';

const classes = {
  closeButton: 'station-request-close-button',
  form: 'station-request-form',
  divForm: 'station-request-divform',
  error: 'station-request-error',
  input: 'station-request-input',
  button: 'station-request-button',
  buttonContainer: 'station-request-button-container',
  dialogContent: 'station-request-dialog-content',
};
const StyledConfirmationDialog = styled((props: ConfirmationDialogProps) => (
  <ConfirmationDialog {...props} />
))(({ theme }) => ({
  [`& .${classes.closeButton}`]: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.error.main,
  },
  [`& .${classes.form}`]: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    padding: '0.5rem',
  },
  [`& .${classes.divForm}`]: {
    padding: '0.5rem',
    width: '100%',
  },
  [`& .${classes.error}`]: {
    color: theme.palette.error.main,
  },
  [`& .${classes.input}`]: {
    width: '100%',
  },
  [`& .${classes.button}`]: {
    width: '100%',
  },
  [`& .${classes.buttonContainer}`]: {
    paddingTop: '0.5rem',
    width: '100%',
  },
  [`& .${classes.dialogContent}`]: {
    padding: theme.spacing(5),
  },
}));

export interface StationRequestDialogProps {
  stationType: number;
  currentMode: number;
  availableModes: number[];
  showFormDialog: boolean;
  onRequestSubmit?(event: React.FormEvent, stationType: number, stationMode: number): void;
  onClose: () => void;
}

export const StationRequestDialog = ({
  stationType,
  currentMode,
  availableModes,
  showFormDialog,
  onRequestSubmit,
  onClose,
}: StationRequestDialogProps): JSX.Element => {
  const [stationMode, setStationMode] = React.useState(currentMode);

  // Error states
  const [stationModeError, setStationModeError] = React.useState('');

  const cleanUpError = () => {
    setStationModeError('');
  };

  const isFormValid = () => {
    let isValid = true;
    cleanUpError();
    if (stationMode == null || stationMode === undefined) {
      setStationModeError('Mode cannot be empty');
      isValid = false;
    }

    return isValid;
  };

  const handleStationRequest = (event: React.FormEvent) => {
    event.preventDefault();
    if (isFormValid()) {
      onRequestSubmit && onRequestSubmit(event, stationType, stationMode);
      onClose();
    }
  };

  return (
    <StyledConfirmationDialog
      open={showFormDialog}
      onClose={() => onClose()}
      fullWidth={true}
      maxWidth={'md'}
      onSubmit={handleStationRequest}
      title={'Station Request Form'}
      confirmText={'Request'}
      cancelText={'Close'}
    >
      <div className={classes.divForm}>
        <Autocomplete
          getOptionLabel={(option) => requestStationModeToString(option)}
          onChange={(_, value) => setStationMode(value as number)}
          options={availableModes}
          // disabled={requestType === RmfStationRequest.REQUEST_END_SESSION}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Pick a Station Mode"
              placeholder="Pick a Station Mode"
              variant="outlined"
              error={!!stationModeError}
              helperText={stationModeError}
            />
          )}
          value={stationMode}
        />
      </div>
    </StyledConfirmationDialog>
  );
};

export default StationRequestDialog;
