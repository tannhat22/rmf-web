import { Button, useMediaQuery } from '@mui/material';
import React from 'react';

import { StationRequestDialog, StationRequestDialogProps } from './station-request-dialog';
import { requestStationModes } from './station-utils';

export interface StationControlsProps
  extends Omit<
    StationRequestDialogProps,
    'showFormDialog' | 'currentMode' | 'availableModes' | 'onClose'
  > {
  currentMode?: number;
  onClose?: StationRequestDialogProps['onClose'];
}

export function StationControls({
  currentMode,
  onClose,
  ...otherProps
}: StationControlsProps): JSX.Element {
  const isScreenHeightLessThan800 = useMediaQuery('(max-height:800px)');
  const [showDialog, setShowDialog] = React.useState(false);
  // Doing `{showDialog && <Form .../>}` will unomunt it before the animations are done.
  // Instead we give a `key` to the form to make react spawn a new instance.
  const [resetForm, setResetForm] = React.useState(0);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setResetForm((prev) => prev + 1);
          setShowDialog(true);
        }}
        sx={{
          minWidth: 'auto',
          fontSize: isScreenHeightLessThan800 ? 10 : 16,
        }}
      >
        Request
      </Button>
      <StationRequestDialog
        key={resetForm}
        showFormDialog={showDialog}
        currentMode={currentMode ? currentMode : 0}
        availableModes={requestStationModes}
        onClose={(...args) => {
          setShowDialog(false);
          onClose && onClose(...args);
        }}
        {...otherProps}
      />
    </>
  );
}
