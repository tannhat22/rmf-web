import { TableContainer } from '@mui/material';
import { BuildingMap } from 'api-client';
import React from 'react';
import { getPlaces, Place, StationDataGridTable, StationTableData } from 'react-components';
import { StationRequest as RmfStationRequest } from 'rmf-models/ros/machine_fleet_msgs/msg';
import { throttleTime } from 'rxjs';

import { useRmfApi } from '../hooks/use-rmf-api';
import { getApiErrorMessage } from '../utils/api';
// import { AppEvents } from './app-events';
import { StationSummary } from './station-summary';

export const StationsTable = () => {
  const rmfApi = useRmfApi();
  const [buildingMap, setBuildingMap] = React.useState<BuildingMap | null>(null);
  const [stations, setStations] = React.useState<Place[]>([]);
  const [stationTableData, setStationTableData] = React.useState<Record<string, StationTableData>>(
    {}
  );
  const [openStationSummary, setOpenStationSummary] = React.useState(false);
  const [selectedStation, setSelectedStation] = React.useState<Place | null>(null);

  React.useEffect(() => {
    const handleBuildingMap = (newMap: BuildingMap) => {
      setBuildingMap(newMap);
      setStations(
        getPlaces(newMap).filter(
          (p) =>
            p.vertex.name.length > 0 &&
            (p.pickupHandler !== undefined || p.dropoffHandler !== undefined)
        )
      );
    };

    const sub = rmfApi.buildingMapObs.subscribe((newMap) => handleBuildingMap(newMap));

    return () => sub.unsubscribe();
  }, [rmfApi]);

  React.useEffect(() => {
    stations.map(async (station, i) => {
      try {
        const sub = rmfApi
          .getStationStateObs(station.vertex.name)
          .pipe(throttleTime(3000, undefined, { leading: true, trailing: true }))
          .subscribe((stationState) => {
            setStationTableData((prev) => {
              return {
                ...prev,
                [station.vertex.name]: {
                  index: i,
                  name: station.vertex.name,
                  levelName: station.level,
                  stationType:
                    station.pickupHandler !== undefined
                      ? RmfStationRequest.TYPE_PICKUP
                      : RmfStationRequest.TYPE_DROPOFF,
                  currentMode: stationState.mode,
                  stationState: stationState,
                  onRequestSubmit: async (_ev, stationType, stationMode) => {
                    return rmfApi?.stationsApi.postStationRequestStationsStationNameRequestPost(
                      station.vertex.name,
                      {
                        station_type: stationType,
                        station_mode: stationMode,
                      }
                    );
                  },
                },
              };
            });
          });
        return () => sub.unsubscribe();
      } catch (error) {
        console.error(`Failed to get station state: ${getApiErrorMessage(error)}`);
      }
    });
  }, [rmfApi, buildingMap, stations]);

  return (
    <TableContainer sx={{ height: '100%' }}>
      <StationDataGridTable
        stations={Object.values(stationTableData).flatMap((s) => s)}
        onStationClick={(_ev, stationData) => {
          if (!buildingMap) {
            // AppEvents.stationSelect.next(null);
            return;
          }

          for (const station of stations) {
            if (station.vertex.name === stationData.name) {
              // AppEvents.stationSelect.next(station);
              setSelectedStation(station);
              setOpenStationSummary(true);
              return;
            }
          }
        }}
      />
      {openStationSummary && selectedStation && (
        <StationSummary station={selectedStation} onClose={() => setOpenStationSummary(false)} />
      )}
    </TableContainer>
  );
};

export default StationsTable;
