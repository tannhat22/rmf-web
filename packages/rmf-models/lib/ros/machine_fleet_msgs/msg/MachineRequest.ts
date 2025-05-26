/* This is a generated file, do not edit */

import * as builtin_interfaces from '../../builtin_interfaces';
import * as machine_fleet_msgs from '../../machine_fleet_msgs';

export class MachineRequest {
  static readonly FullTypeName = '';

  static readonly REQUEST_DISPENSER = 0;
  static readonly REQUEST_INGESTOR = 1;

  time: builtin_interfaces.msg.Time;
  machine_name: string;
  request_type: number;
  request_mode: machine_fleet_msgs.msg.DeviceMode;
  request_id: string;

  constructor(fields: Partial<MachineRequest> = {}) {
    this.time = fields.time || new builtin_interfaces.msg.Time();
    this.machine_name = fields.machine_name || '';
    this.request_type = fields.request_type || 0;
    this.request_mode = fields.request_mode || new machine_fleet_msgs.msg.DeviceMode();
    this.request_id = fields.request_id || '';
  }

  static validate(obj: Record<string, unknown>): void {
    try {
      builtin_interfaces.msg.Time.validate(obj['time'] as Record<string, unknown>);
    } catch (e) {
      throw new Error('in "time":\n  ' + (e as Error).message);
    }
    if (typeof obj['machine_name'] !== 'string') {
      throw new Error('expected "machine_name" to be "string"');
    }
    if (typeof obj['request_type'] !== 'number') {
      throw new Error('expected "request_type" to be "number"');
    }
    try {
      machine_fleet_msgs.msg.DeviceMode.validate(obj['request_mode'] as Record<string, unknown>);
    } catch (e) {
      throw new Error('in "request_mode":\n  ' + (e as Error).message);
    }
    if (typeof obj['request_id'] !== 'string') {
      throw new Error('expected "request_id" to be "string"');
    }
  }
}

export default MachineRequest;
