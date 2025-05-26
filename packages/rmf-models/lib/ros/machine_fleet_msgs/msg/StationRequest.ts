/* This is a generated file, do not edit */

import * as builtin_interfaces from '../../builtin_interfaces';

export class StationRequest {
  static readonly FullTypeName = '';

  static readonly TYPE_PICKUP = 0;
  static readonly TYPE_DROPOFF = 1;
  static readonly MODE_EMPTY = 0;
  static readonly MODE_FILLED = 1;

  time: builtin_interfaces.msg.Time;
  machine_name: string;
  station_name: string;
  station_type: number;
  mode: number;

  constructor(fields: Partial<StationRequest> = {}) {
    this.time = fields.time || new builtin_interfaces.msg.Time();
    this.machine_name = fields.machine_name || '';
    this.station_name = fields.station_name || '';
    this.station_type = fields.station_type || 0;
    this.mode = fields.mode || 0;
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
    if (typeof obj['station_name'] !== 'string') {
      throw new Error('expected "station_name" to be "string"');
    }
    if (typeof obj['station_type'] !== 'number') {
      throw new Error('expected "station_type" to be "number"');
    }
    if (typeof obj['mode'] !== 'number') {
      throw new Error('expected "mode" to be "number"');
    }
  }
}

export default StationRequest;
