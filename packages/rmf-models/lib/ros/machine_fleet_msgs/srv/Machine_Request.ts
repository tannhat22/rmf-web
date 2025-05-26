/* This is a generated file, do not edit */

import * as machine_fleet_msgs from '../../machine_fleet_msgs';

export class Machine_Request {
  static readonly FullTypeName = '';

  static readonly REQUEST_DISPENSER = 0;
  static readonly REQUEST_INGESTOR = 1;

  request_type: number;
  request_mode: machine_fleet_msgs.msg.DeviceMode;

  constructor(fields: Partial<Machine_Request> = {}) {
    this.request_type = fields.request_type || 0;
    this.request_mode = fields.request_mode || new machine_fleet_msgs.msg.DeviceMode();
  }

  static validate(obj: Record<string, unknown>): void {
    if (typeof obj['request_type'] !== 'number') {
      throw new Error('expected "request_type" to be "number"');
    }
    try {
      machine_fleet_msgs.msg.DeviceMode.validate(obj['request_mode'] as Record<string, unknown>);
    } catch (e) {
      throw new Error('in "request_mode":\n  ' + (e as Error).message);
    }
  }
}

export default Machine_Request;
