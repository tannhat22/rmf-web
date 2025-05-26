/* This is a generated file, do not edit */

import * as machine_fleet_msgs from '../../machine_fleet_msgs';

export class DeliveryParams {
  static readonly FullTypeName = '';

  pickup_place_name: string;
  pickup_dispenser: string;
  pickup_items: machine_fleet_msgs.msg.DeliveryItem;
  dropoff_place_name: string;
  dropoff_ingestor: string;
  dropoff_items: machine_fleet_msgs.msg.DeliveryItem;

  constructor(fields: Partial<DeliveryParams> = {}) {
    this.pickup_place_name = fields.pickup_place_name || '';
    this.pickup_dispenser = fields.pickup_dispenser || '';
    this.pickup_items = fields.pickup_items || new machine_fleet_msgs.msg.DeliveryItem();
    this.dropoff_place_name = fields.dropoff_place_name || '';
    this.dropoff_ingestor = fields.dropoff_ingestor || '';
    this.dropoff_items = fields.dropoff_items || new machine_fleet_msgs.msg.DeliveryItem();
  }

  static validate(obj: Record<string, unknown>): void {
    if (typeof obj['pickup_place_name'] !== 'string') {
      throw new Error('expected "pickup_place_name" to be "string"');
    }
    if (typeof obj['pickup_dispenser'] !== 'string') {
      throw new Error('expected "pickup_dispenser" to be "string"');
    }
    try {
      machine_fleet_msgs.msg.DeliveryItem.validate(obj['pickup_items'] as Record<string, unknown>);
    } catch (e) {
      throw new Error('in "pickup_items":\n  ' + (e as Error).message);
    }
    if (typeof obj['dropoff_place_name'] !== 'string') {
      throw new Error('expected "dropoff_place_name" to be "string"');
    }
    if (typeof obj['dropoff_ingestor'] !== 'string') {
      throw new Error('expected "dropoff_ingestor" to be "string"');
    }
    try {
      machine_fleet_msgs.msg.DeliveryItem.validate(obj['dropoff_items'] as Record<string, unknown>);
    } catch (e) {
      throw new Error('in "dropoff_items":\n  ' + (e as Error).message);
    }
  }
}

export default DeliveryParams;
