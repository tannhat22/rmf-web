/* This is a generated file, do not edit */

export class DeliveryItem {
  static readonly FullTypeName = '';

  sku: string;
  quantity: number;

  constructor(fields: Partial<DeliveryItem> = {}) {
    this.sku = fields.sku || '';
    this.quantity = fields.quantity || 0;
  }

  static validate(obj: Record<string, unknown>): void {
    if (typeof obj['sku'] !== 'string') {
      throw new Error('expected "sku" to be "string"');
    }
    if (typeof obj['quantity'] !== 'number') {
      throw new Error('expected "quantity" to be "number"');
    }
  }
}

export default DeliveryItem;
