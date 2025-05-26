/* This is a generated file, do not edit */

import * as machine_fleet_msgs from '../../machine_fleet_msgs';

export class DeliveryRequest {
  static readonly FullTypeName = '';

  fleet_name: string;
  robot_name: string;
  start_time: number;
  requester: string;
  delivery_params: Array<machine_fleet_msgs.msg.DeliveryParams>;

  constructor(fields: Partial<DeliveryRequest> = {}) {
    this.fleet_name = fields.fleet_name || '';
    this.robot_name = fields.robot_name || '';
    this.start_time = fields.start_time || 0;
    this.requester = fields.requester || '';
    this.delivery_params = fields.delivery_params || [];
  }

  static validate(obj: Record<string, unknown>): void {
    if (typeof obj['fleet_name'] !== 'string') {
      throw new Error('expected "fleet_name" to be "string"');
    }
    if (typeof obj['robot_name'] !== 'string') {
      throw new Error('expected "robot_name" to be "string"');
    }
    if (typeof obj['start_time'] !== 'number') {
      throw new Error('expected "start_time" to be "number"');
    }
    if (typeof obj['requester'] !== 'string') {
      throw new Error('expected "requester" to be "string"');
    }
    if (!Array.isArray(obj['delivery_params'])) {
      throw new Error('expected "delivery_params" to be an array');
    }
    for (const [i, v] of obj['delivery_params'].entries()) {
      try {
        machine_fleet_msgs.msg.DeliveryParams.validate(v);
      } catch (e) {
        throw new Error(`in index ${i} of "delivery_params":\n  ` + (e as Error).message);
      }
    }
  }
}

export default DeliveryRequest;
