import { ThreeEvent } from '@react-three/fiber';
import { StationState } from 'api-client';
import React from 'react';
import { Place, StationThreeMaker } from 'react-components';
import { StationState as RmfStationState } from 'rmf-models/ros/machine_fleet_msgs/msg';
import { throttleTime } from 'rxjs';

import { useRmfApi } from '../../hooks/use-rmf-api';

interface StationsProps {
  station?: Place;
  onStationClick?: (ev: ThreeEvent<MouseEvent>, station: Place) => void;
}

export const Stations = React.memo(({ station, onStationClick }: StationsProps): JSX.Element => {
  const rmfApi = useRmfApi();
  const [stationState, setStationState] = React.useState<StationState | undefined>(undefined);
  const [color, setColor] = React.useState<string>('yellow');

  React.useEffect(() => {
    if (!station) {
      return;
    }

    const sub = rmfApi
      .getStationStateObs(station.vertex.name)
      .pipe(throttleTime(3000, undefined, { leading: true, trailing: true }))
      .subscribe(setStationState);
    return () => sub.unsubscribe();
  }, [rmfApi, station]);

  React.useEffect(() => {
    const stationMode = stationState?.mode;

    switch (stationMode) {
      case RmfStationState.MODE_EMPTY:
        setColor('yellow');
        return;
      case RmfStationState.MODE_FILLED:
        setColor('red');
        return;
      default:
        setColor('green');
        return;
    }
  }, [stationState?.mode]);

  return (
    <>
      {station && stationState && (
        <StationThreeMaker
          position={[station.vertex.x, station.vertex.y, 0]}
          color={color}
          text={station.vertex.name}
          circleShape={false}
          onStationClick={(ev: ThreeEvent<MouseEvent>) =>
            onStationClick && onStationClick(ev, station)
          }
        />
      )}
    </>
  );
});
