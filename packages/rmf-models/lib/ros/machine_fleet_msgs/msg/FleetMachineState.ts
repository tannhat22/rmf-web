/* This is a generated file, do not edit */

import * as machine_fleet_msgs from '../../machine_fleet_msgs';

export class FleetMachineState {
  static readonly FullTypeName = '';

  machines: Array<machine_fleet_msgs.msg.MachineState>;

  constructor(fields: Partial<FleetMachineState> = {}) {
    this.machines = fields.machines || [];
  }

  static validate(obj: Record<string, unknown>): void {
    if (!Array.isArray(obj['machines'])) {
      throw new Error('expected "machines" to be an array');
    }
    for (const [i, v] of obj['machines'].entries()) {
      try {
        machine_fleet_msgs.msg.MachineState.validate(v);
      } catch (e) {
        throw new Error(`in index ${i} of "machines":\n  ` + (e as Error).message);
      }
    }
  }
}

export default FleetMachineState;
