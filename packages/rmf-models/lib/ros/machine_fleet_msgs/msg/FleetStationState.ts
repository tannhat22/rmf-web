/* This is a generated file, do not edit */

import * as builtin_interfaces from '../../builtin_interfaces';
import * as machine_fleet_msgs from '../../machine_fleet_msgs';

export class FleetStationState {
  static readonly FullTypeName = '';

  time: builtin_interfaces.msg.Time;
  pickup_stations: Array<machine_fleet_msgs.msg.StationState>;
  dropoff_stations: Array<machine_fleet_msgs.msg.StationState>;

  constructor(fields: Partial<FleetStationState> = {}) {
    this.time = fields.time || new builtin_interfaces.msg.Time();
    this.pickup_stations = fields.pickup_stations || [];
    this.dropoff_stations = fields.dropoff_stations || [];
  }

  static validate(obj: Record<string, unknown>): void {
    try {
      builtin_interfaces.msg.Time.validate(obj['time'] as Record<string, unknown>);
    } catch (e) {
      throw new Error('in "time":\n  ' + (e as Error).message);
    }
    if (!Array.isArray(obj['pickup_stations'])) {
      throw new Error('expected "pickup_stations" to be an array');
    }
    for (const [i, v] of obj['pickup_stations'].entries()) {
      try {
        machine_fleet_msgs.msg.StationState.validate(v);
      } catch (e) {
        throw new Error(`in index ${i} of "pickup_stations":\n  ` + (e as Error).message);
      }
    }
    if (!Array.isArray(obj['dropoff_stations'])) {
      throw new Error('expected "dropoff_stations" to be an array');
    }
    for (const [i, v] of obj['dropoff_stations'].entries()) {
      try {
        machine_fleet_msgs.msg.StationState.validate(v);
      } catch (e) {
        throw new Error(`in index ${i} of "dropoff_stations":\n  ` + (e as Error).message);
      }
    }
  }
}

export default FleetStationState;
