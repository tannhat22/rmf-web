import { Box, SxProps, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridEventListener,
  GridRowParams,
  GridValueGetterParams,
  MuiEvent,
} from '@mui/x-data-grid';
import { StationState } from 'api-client';
import React from 'react';
import { StationState as RmfStationState } from 'rmf-models/ros/machine_fleet_msgs/msg';

import { StationControls } from './station-controls';
import { stationTypeToString, stationModeToString } from './station-utils';

export interface StationTableData {
  index: number;
  name: string;
  levelName: string;
  stationType: number;
  currentMode?: number;
  stationState?: StationState;
  onRequestSubmit?(event: React.FormEvent, stationType: number, stationMode: number): void;
}

export interface StationDataGridTableProps {
  stations: StationTableData[];
  onStationClick?(ev: MuiEvent<React.MouseEvent<HTMLElement>>, stationData: StationTableData): void;
}

export function StationDataGridTable({
  stations,
  onStationClick,
}: StationDataGridTableProps): JSX.Element {
  const theme = useTheme();
  const isScreenHeightLessThan800 = useMediaQuery('(max-height:800px)');

  const handleEvent: GridEventListener<'rowClick'> = (
    params: GridRowParams,
    event: MuiEvent<React.MouseEvent<HTMLElement>>,
  ) => {
    if (onStationClick) {
      onStationClick(event, params.row);
    }
  };

  const StationState = (params: GridCellParams): React.ReactNode => {
    const modeStateLabelStyle: SxProps = (() => {
      const unknown = {
        color: theme.palette.error.main,
      };
      const empty = {
        color: theme.palette.action.disabledBackground,
      };
      const filled = {
        color: theme.palette.warning.main,
      };

      if (!params.row.stationState) {
        return unknown;
      }

      switch (params.row.stationState.mode) {
        case RmfStationState.MODE_EMPTY:
          return empty;
        case RmfStationState.MODE_FILLED:
          return filled;
        default:
          return unknown;
      }
    })();

    return (
      <Box component="div" sx={modeStateLabelStyle}>
        <Typography
          data-testid="mode-state"
          component="p"
          sx={{
            fontWeight: 'bold',
            fontSize: isScreenHeightLessThan800 ? 10 : 16,
          }}
        >
          {stationModeToString(params.row.stationState?.mode).toUpperCase()}
        </Typography>
      </Box>
    );
  };

  const StationControl = (params: GridCellParams): React.ReactNode => {
    return (
      <StationControls
        stationType={params.row?.stationType}
        currentMode={params.row?.currentMode}
        onRequestSubmit={params.row?.onRequestSubmit}
      />
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 90,
      valueGetter: (params: GridValueGetterParams) => params.row.name,
      flex: 1,
      filterable: true,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 90,
      valueGetter: (params: GridValueGetterParams) => stationTypeToString(params.row.stationType),
      flex: 1,
      filterable: true,
    },
    {
      field: 'levelName',
      headerName: 'Current Floor',
      width: 150,
      editable: false,
      valueGetter: (params: GridValueGetterParams) => params.row.levelName,
      flex: 1,
      filterable: true,
      sortable: false,
    },
    {
      field: 'stationState',
      headerName: 'State',
      width: 150,
      editable: false,
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => params.row.stationState.mode,
      renderCell: StationState,
      filterable: true,
    },
    {
      field: '-',
      headerName: '',
      width: 150,
      editable: false,
      flex: 1,
      renderCell: StationControl,
      filterable: true,
      sortable: false,
    },
  ];

  return (
    <DataGrid
      getRowId={(l) => l.index}
      rows={stations}
      pageSize={20}
      rowHeight={38}
      columns={columns}
      rowsPerPageOptions={[10, 20]}
      sx={{
        fontSize: isScreenHeightLessThan800 ? '0.7rem' : 'inherit',
      }}
      autoPageSize={isScreenHeightLessThan800}
      density={isScreenHeightLessThan800 ? 'compact' : 'standard'}
      localeText={{
        noRowsLabel: 'No stations available.',
      }}
      onRowClick={handleEvent}
      initialState={{
        sorting: {
          sortModel: [{ field: 'type', sort: 'asc' }],
        },
      }}
      disableVirtualization={true}
    />
  );
}
