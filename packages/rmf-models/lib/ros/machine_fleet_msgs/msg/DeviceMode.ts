/* This is a generated file, do not edit */

export class DeviceMode {
  static readonly FullTypeName = '';

  static readonly MODE_IDLE = 0;
  static readonly MODE_ACCEPT_DOCKIN = 1;
  static readonly MODE_ROBOT_DOCKED_IN = 2;
  static readonly MODE_ACCEPT_DOCKOUT = 3;
  static readonly MODE_CANCEL = 4;
  static readonly MODE_ROBOT_ERROR = 5;

  mode: number;

  constructor(fields: Partial<DeviceMode> = {}) {
    this.mode = fields.mode || 0;
  }

  static validate(obj: Record<string, unknown>): void {
    if (typeof obj['mode'] !== 'number') {
      throw new Error('expected "mode" to be "number"');
    }
  }
}

export default DeviceMode;
