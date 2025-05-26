/* This is a generated file, do not edit */

export class StationState {
  static readonly FullTypeName = '';

  static readonly MODE_EMPTY = 0;
  static readonly MODE_FILLED = 1;

  station_name: string;
  mode: number;

  constructor(fields: Partial<StationState> = {}) {
    this.station_name = fields.station_name || '';
    this.mode = fields.mode || 0;
  }

  static validate(obj: Record<string, unknown>): void {
    if (typeof obj['station_name'] !== 'string') {
      throw new Error('expected "station_name" to be "string"');
    }
    if (typeof obj['mode'] !== 'number') {
      throw new Error('expected "mode" to be "number"');
    }
  }
}

export default StationState;
