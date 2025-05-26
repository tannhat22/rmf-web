import {
  StationRequest as RmfStationRequest,
  StationState as RmfStationState,
} from 'rmf-models/ros/machine_fleet_msgs/msg';

export function stationTypeToString(stationType?: number): string {
  if (stationType === undefined) {
    return `Unknown (${stationType})`;
  }
  switch (stationType) {
    case RmfStationRequest.TYPE_PICKUP:
      return 'Dispenser';
    case RmfStationRequest.TYPE_DROPOFF:
      return 'Ingestor';
    default:
      return `Unknown (${stationType})`;
  }
}

export function stationModeToString(stationMode?: number): string {
  if (stationMode === undefined) {
    return `Unknown (${stationMode})`;
  }
  switch (stationMode) {
    case RmfStationState.MODE_EMPTY:
      return 'Empty';
    case RmfStationState.MODE_FILLED:
      return 'Filled';
    default:
      return `Unknown (${stationMode})`;
  }
}

export const requestStationModes = [RmfStationRequest.MODE_EMPTY, RmfStationRequest.MODE_FILLED];

export const requestStationModeStrings: Record<number, string> = {
  [RmfStationRequest.MODE_EMPTY]: 'Empty',
  [RmfStationRequest.MODE_FILLED]: 'Filled',
};

export function requestStationModeToString(requestMode: number): string {
  return requestStationModeStrings[requestMode] || `Unknown (${requestMode})`;
}
