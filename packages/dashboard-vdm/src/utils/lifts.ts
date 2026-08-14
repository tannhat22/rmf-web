import { LiftRequest as RmfLiftRequest } from 'rmf-models/ros/rmf_lift_msgs/msg';

import { RmfApi } from '../services/rmf-api';

/**
 * Sends a lift request. Ending a session needs the session id of every robot,
 * so they are collected from the fleets first.
 */
export async function submitLiftRequest(
  rmfApi: RmfApi,
  liftName: string,
  doorState: number,
  requestType: number,
  destination: string
) {
  const fleet_session_ids: string[] = [];
  if (requestType === RmfLiftRequest.REQUEST_END_SESSION) {
    const fleets = (await rmfApi.fleetsApi.getFleetsFleetsGet()).data;
    for (const fleet of fleets) {
      if (!fleet.robots) {
        continue;
      }
      for (const robotName of Object.keys(fleet.robots)) {
        fleet_session_ids.push(`${fleet.name}/${robotName}`);
      }
    }
  }

  return rmfApi.liftsApi.postLiftRequestLiftsLiftNameRequestPost(liftName, {
    destination,
    door_mode: doorState,
    request_type: requestType,
    additional_session_ids: fleet_session_ids,
  });
}
