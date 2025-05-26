/* This is a generated file, do not edit */

import * as builtin_interfaces from '../../builtin_interfaces';
import * as machine_fleet_msgs from '../../machine_fleet_msgs';

export class MachineState {
  static readonly FullTypeName = '';

  static readonly MODE_UNKNOWN = 0;
  static readonly MODE_HUMAN = 1;
  static readonly MODE_AGV = 2;
  static readonly MODE_ERROR = 3;
  static readonly MODE_EMERGENCY = 4;

  machine_time: builtin_interfaces.msg.Time;
  machine_name: string;
  machine_mode: number;
  request_pickup: boolean;
  dispenser_mode: machine_fleet_msgs.msg.DeviceMode;
  dispenser_request_id: string;
  request_dropoff: boolean;
  ingestor_mode: machine_fleet_msgs.msg.DeviceMode;
  ingestor_request_id: string;
  station_states: Array<machine_fleet_msgs.msg.StationState>;

  constructor(fields: Partial<MachineState> = {}) {
    this.machine_time = fields.machine_time || new builtin_interfaces.msg.Time();
    this.machine_name = fields.machine_name || '';
    this.machine_mode = fields.machine_mode || 0;
    this.request_pickup = fields.request_pickup || false;
    this.dispenser_mode = fields.dispenser_mode || new machine_fleet_msgs.msg.DeviceMode();
    this.dispenser_request_id = fields.dispenser_request_id || '';
    this.request_dropoff = fields.request_dropoff || false;
    this.ingestor_mode = fields.ingestor_mode || new machine_fleet_msgs.msg.DeviceMode();
    this.ingestor_request_id = fields.ingestor_request_id || '';
    this.station_states = fields.station_states || [];
  }

  static validate(obj: Record<string, unknown>): void {
    try {
      builtin_interfaces.msg.Time.validate(obj['machine_time'] as Record<string, unknown>);
    } catch (e) {
      throw new Error('in "machine_time":\n  ' + (e as Error).message);
    }
    if (typeof obj['machine_name'] !== 'string') {
      throw new Error('expected "machine_name" to be "string"');
    }
    if (typeof obj['machine_mode'] !== 'number') {
      throw new Error('expected "machine_mode" to be "number"');
    }
    if (typeof obj['request_pickup'] !== 'boolean') {
      throw new Error('expected "request_pickup" to be "boolean"');
    }
    try {
      machine_fleet_msgs.msg.DeviceMode.validate(obj['dispenser_mode'] as Record<string, unknown>);
    } catch (e) {
      throw new Error('in "dispenser_mode":\n  ' + (e as Error).message);
    }
    if (typeof obj['dispenser_request_id'] !== 'string') {
      throw new Error('expected "dispenser_request_id" to be "string"');
    }
    if (typeof obj['request_dropoff'] !== 'boolean') {
      throw new Error('expected "request_dropoff" to be "boolean"');
    }
    try {
      machine_fleet_msgs.msg.DeviceMode.validate(obj['ingestor_mode'] as Record<string, unknown>);
    } catch (e) {
      throw new Error('in "ingestor_mode":\n  ' + (e as Error).message);
    }
    if (typeof obj['ingestor_request_id'] !== 'string') {
      throw new Error('expected "ingestor_request_id" to be "string"');
    }
    if (!Array.isArray(obj['station_states'])) {
      throw new Error('expected "station_states" to be an array');
    }
    for (const [i, v] of obj['station_states'].entries()) {
      try {
        machine_fleet_msgs.msg.StationState.validate(v);
      } catch (e) {
        throw new Error(`in index ${i} of "station_states":\n  ` + (e as Error).message);
      }
    }
  }
}

export default MachineState;
