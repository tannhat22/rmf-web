import { Autocomplete, Grid, TextField, useTheme } from '@mui/material';
import React from 'react';

import { PositiveIntField } from '../../form-inputs';
import { TaskBookingLabels } from '../booking-label';
import { TaskDefinition } from '../task-form';
import { isNonEmptyString, isPositiveNumber } from './utils';

export const DeliveryMultipleTaskDefinition: TaskDefinition = {
  taskDefinitionId: 'delivery_multiple',
  taskDisplayName: 'Delivery - Multiple',
  requestCategory: 'compose',
  scheduleEventColor: undefined,
};

interface TaskPlace {
  place: string;
  handler: string;
  payload: {
    sku: string;
    quantity: number;
  };
}

interface TaskActivity {
  category: string;
  description: TaskPlace;
}

interface DeliveryMultiplePhase {
  activity: {
    category: string;
    description: {
      activities: [
        go_to_pickup_first: TaskActivity,
        go_to_dropoff_first: TaskActivity,
        go_to_pickup_second: TaskActivity,
        go_to_dropoff_second: TaskActivity,
      ];
    };
  };
}

export interface DeliveryMultipleTaskDescription {
  category: string;
  phases: [delivery_multiple_phase: DeliveryMultiplePhase];
}

export function makeDeliveryMultipleTaskBookingLabel(
  task_description: DeliveryMultipleTaskDescription,
): TaskBookingLabels {
  const pickupDescription =
    task_description.phases[0].activity.description.activities[0].description;
  return {
    task_definition_id: DeliveryMultipleTaskDefinition.taskDefinitionId,
    pickup: pickupDescription.place,
    destination: task_description.phases[0].activity.description.activities[3].description.place,
    cart_id: pickupDescription.payload.sku,
  };
}

function isTaskPlaceValid(place: TaskPlace): boolean {
  return (
    isNonEmptyString(place.place) &&
    isNonEmptyString(place.handler) &&
    isNonEmptyString(place.payload.sku) &&
    isPositiveNumber(place.payload.quantity)
  );
}

function isDeliveryTaskDescriptionValid(taskDescription: DeliveryMultipleTaskDescription): boolean {
  return taskDescription.phases[0].activity.description.activities.every((activity) =>
    isTaskPlaceValid(activity.description),
  );
}

export function deliveryInsertPlace(
  taskDescription: DeliveryMultipleTaskDescription,
  numberOrder: number,
  pickupPlace: string,
  pickupHandler: string,
): DeliveryMultipleTaskDescription {
  taskDescription.phases[0].activity.description.activities[numberOrder].description.place =
    pickupPlace;
  taskDescription.phases[0].activity.description.activities[numberOrder].description.handler =
    pickupHandler;
  return taskDescription;
}

export function deliveryInsertSku(
  taskDescription: DeliveryMultipleTaskDescription,
  numberOrder: number,
  sku: string,
): DeliveryMultipleTaskDescription {
  taskDescription.phases[0].activity.description.activities[numberOrder].description.payload.sku =
    sku;
  return taskDescription;
}

export function deliveryInsertQuantity(
  taskDescription: DeliveryMultipleTaskDescription,
  numberOrder: number,
  quantity: number,
): DeliveryMultipleTaskDescription {
  taskDescription.phases[0].activity.description.activities[
    numberOrder
  ].description.payload.quantity = quantity;
  return taskDescription;
}

export function makeDefaultDeliveryMultipleTaskDescription(): DeliveryMultipleTaskDescription {
  return {
    category: 'multi_delivery',
    phases: [
      {
        activity: {
          category: 'sequence',
          description: {
            activities: [
              {
                category: 'pickup',
                description: {
                  place: '',
                  handler: '',
                  payload: {
                    sku: '',
                    quantity: 1,
                  },
                },
              },
              {
                category: 'dropoff',
                description: {
                  place: '',
                  handler: '',
                  payload: {
                    sku: '',
                    quantity: 1,
                  },
                },
              },
              {
                category: 'pickup',
                description: {
                  place: '',
                  handler: '',
                  payload: {
                    sku: '',
                    quantity: 1,
                  },
                },
              },
              {
                category: 'dropoff',
                description: {
                  place: '',
                  handler: '',
                  payload: {
                    sku: '',
                    quantity: 1,
                  },
                },
              },
            ],
          },
        },
      },
    ],
  };
}

export function makeDeliveryMultipleTaskShortDescription(
  desc: DeliveryMultipleTaskDescription,
  displayName?: string,
): string {
  const goToPickupFirst: TaskActivity = desc.phases[0].activity.description.activities[0];
  const goToDropoffFirst: TaskActivity = desc.phases[0].activity.description.activities[1];
  const goToPickupSecond: TaskActivity = desc.phases[0].activity.description.activities[2];
  const goToDropoffSecond: TaskActivity = desc.phases[0].activity.description.activities[3];

  return `[${displayName ?? DeliveryMultipleTaskDefinition.taskDisplayName}] Pickup1 
  [${goToPickupFirst.description.payload.sku}] from [${goToPickupFirst.description.place}], 
  dropoff1 [${goToDropoffFirst.description.payload.sku}] at [${goToDropoffFirst.description.place}] then 
  Pickup2 [${goToPickupSecond.description.payload.sku}] from [${goToPickupSecond.description.place}], 
  dropoff2 [${goToDropoffSecond.description.payload.sku}] at [${goToDropoffSecond.description.place}]`;
}

export interface DeliveryMultipleTaskFormProps {
  taskDesc: DeliveryMultipleTaskDescription;
  pickupFirstPoints: Record<string, string>;
  dropoffFirstPoints: Record<string, string>;
  pickupSecondPoints: Record<string, string>;
  dropoffSecondPoints: Record<string, string>;
  onChange(taskDesc: DeliveryMultipleTaskDescription): void;
  onValidate(valid: boolean): void;
  translate?(text: any, options?: any): string;
}

export function DeliveryMultipleTaskForm({
  taskDesc,
  pickupFirstPoints = {},
  dropoffFirstPoints = {},
  pickupSecondPoints = {},
  dropoffSecondPoints = {},
  onChange,
  onValidate,
  translate,
}: DeliveryMultipleTaskFormProps): React.JSX.Element {
  const theme = useTheme();
  const onInputChange = (desc: DeliveryMultipleTaskDescription) => {
    onValidate(isDeliveryTaskDescriptionValid(desc));
    onChange(desc);
  };

  return (
    <Grid item container spacing={theme.spacing(2)} justifyContent="center" alignItems="center">
      {/* First delivery */}
      <Grid item xs={6}>
        <Autocomplete
          id="pickupFirst-location"
          freeSolo
          fullWidth
          options={Object.keys(pickupFirstPoints)}
          value={taskDesc.phases[0].activity.description.activities[0].description.place}
          onChange={(_ev, newValue) => {
            const place = newValue ?? '';
            const handler =
              newValue !== null && pickupFirstPoints[newValue] ? pickupFirstPoints[newValue] : '';
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertPlace(newTaskDesc, 0, place, handler);
            onInputChange(newTaskDesc);
          }}
          onBlur={(ev) => {
            if (pickupFirstPoints[(ev.target as HTMLInputElement).value]) {
              const place = (ev.target as HTMLInputElement).value;
              const handler = pickupFirstPoints[(ev.target as HTMLInputElement).value];
              let newTaskDesc = { ...taskDesc };
              newTaskDesc = deliveryInsertPlace(newTaskDesc, 0, place, handler);
              onInputChange(newTaskDesc);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={`${translate ? translate('Pickup Location') : 'Pickup Location'} 1`}
              required={true}
            />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          id="pickupFirst_sku"
          fullWidth
          label={`${translate ? translate('Pickup SKU') : 'Pickup SKU'} 1`}
          value={taskDesc.phases[0].activity.description.activities[0].description.payload.sku}
          required
          onChange={(ev) => {
            const sku = ev.target.value;
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertSku(newTaskDesc, 0, sku);
            onInputChange(newTaskDesc);
          }}
        />
      </Grid>
      <Grid item xs={2}>
        <PositiveIntField
          id="pickupFirst_quantity"
          label={`${translate ? translate('Quantity') : 'Quantity'} 1`}
          value={taskDesc.phases[0].activity.description.activities[0].description.payload.quantity}
          onChange={(_ev, val) => {
            const quantity = val;
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertQuantity(newTaskDesc, 0, quantity);
            onInputChange(newTaskDesc);
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <Autocomplete
          id="dropoffFirst-location"
          freeSolo
          fullWidth
          options={Object.keys(dropoffFirstPoints)}
          value={taskDesc.phases[0].activity.description.activities[1].description.place}
          onChange={(_ev, newValue) => {
            const place = newValue ?? '';
            const handler =
              newValue !== null && dropoffFirstPoints[newValue] ? dropoffFirstPoints[newValue] : '';
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertPlace(newTaskDesc, 1, place, handler);
            onInputChange(newTaskDesc);
          }}
          onBlur={(ev) => {
            if (dropoffFirstPoints[(ev.target as HTMLInputElement).value]) {
              const place = (ev.target as HTMLInputElement).value;
              const handler = dropoffFirstPoints[(ev.target as HTMLInputElement).value];
              let newTaskDesc = { ...taskDesc };
              newTaskDesc = deliveryInsertPlace(newTaskDesc, 1, place, handler);
              onInputChange(newTaskDesc);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={`${translate ? translate('Dropoff Location') : 'Dropoff Location'} 1`}
              required={true}
            />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          id="dropoffFirst_sku"
          fullWidth
          label={`${translate ? translate('Dropoff SKU') : 'Dropoff SKU'} 1`}
          value={taskDesc.phases[0].activity.description.activities[1].description.payload.sku}
          required
          onChange={(ev) => {
            const sku = ev.target.value;
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertSku(newTaskDesc, 1, sku);
            onInputChange(newTaskDesc);
          }}
        />
      </Grid>
      <Grid item xs={2}>
        <PositiveIntField
          id="dropoffFirst_quantity"
          label={`${translate ? translate('Quantity') : 'Quantity'} 1`}
          value={taskDesc.phases[0].activity.description.activities[1].description.payload.quantity}
          onChange={(_ev, val) => {
            const quantity = val;
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertQuantity(newTaskDesc, 1, quantity);
            onInputChange(newTaskDesc);
          }}
        />
      </Grid>
      {/* Second delivery */}
      <Grid item xs={6}>
        <Autocomplete
          id="pickupSecond-location"
          freeSolo
          fullWidth
          options={Object.keys(pickupSecondPoints)}
          value={taskDesc.phases[0].activity.description.activities[2].description.place}
          onChange={(_ev, newValue) => {
            const place = newValue ?? '';
            const handler =
              newValue !== null && pickupSecondPoints[newValue] ? pickupSecondPoints[newValue] : '';
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertPlace(newTaskDesc, 2, place, handler);
            onInputChange(newTaskDesc);
          }}
          onBlur={(ev) => {
            if (pickupSecondPoints[(ev.target as HTMLInputElement).value]) {
              const place = (ev.target as HTMLInputElement).value;
              const handler = pickupSecondPoints[(ev.target as HTMLInputElement).value];
              let newTaskDesc = { ...taskDesc };
              newTaskDesc = deliveryInsertPlace(newTaskDesc, 2, place, handler);
              onInputChange(newTaskDesc);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={`${translate ? translate('Pickup Location') : 'Pickup Location'} 2`}
              required={true}
            />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          id="pickupSecond_sku"
          fullWidth
          label={`${translate ? translate('Pickup SKU') : 'Pickup SKU'} 2`}
          value={taskDesc.phases[0].activity.description.activities[2].description.payload.sku}
          required
          onChange={(ev) => {
            const sku = ev.target.value;
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertSku(newTaskDesc, 2, sku);
            onInputChange(newTaskDesc);
          }}
        />
      </Grid>
      <Grid item xs={2}>
        <PositiveIntField
          id="pickupSecond_quantity"
          label={`${translate ? translate('Quantity') : 'Quantity'} 2`}
          value={taskDesc.phases[0].activity.description.activities[2].description.payload.quantity}
          onChange={(_ev, val) => {
            const quantity = val;
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertQuantity(newTaskDesc, 2, quantity);
            onInputChange(newTaskDesc);
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <Autocomplete
          id="dropoffSecond-location"
          freeSolo
          fullWidth
          options={Object.keys(dropoffSecondPoints)}
          value={taskDesc.phases[0].activity.description.activities[3].description.place}
          onChange={(_ev, newValue) => {
            const place = newValue ?? '';
            const handler =
              newValue !== null && dropoffSecondPoints[newValue]
                ? dropoffSecondPoints[newValue]
                : '';
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertPlace(newTaskDesc, 3, place, handler);
            onInputChange(newTaskDesc);
          }}
          onBlur={(ev) => {
            if (dropoffSecondPoints[(ev.target as HTMLInputElement).value]) {
              const place = (ev.target as HTMLInputElement).value;
              const handler = dropoffSecondPoints[(ev.target as HTMLInputElement).value];
              let newTaskDesc = { ...taskDesc };
              newTaskDesc = deliveryInsertPlace(newTaskDesc, 3, place, handler);
              onInputChange(newTaskDesc);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={`${translate ? translate('Dropoff Location') : 'Dropoff Location'} 2`}
              required={true}
            />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          id="dropoffSecond_sku"
          fullWidth
          label={`${translate ? translate('Dropoff SKU') : 'Dropoff SKU'} 2`}
          value={taskDesc.phases[0].activity.description.activities[3].description.payload.sku}
          required
          onChange={(ev) => {
            const sku = ev.target.value;
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertSku(newTaskDesc, 3, sku);
            onInputChange(newTaskDesc);
          }}
        />
      </Grid>
      <Grid item xs={2}>
        <PositiveIntField
          id="dropoffSecond_quantity"
          label={`${translate ? translate('Quantity') : 'Quantity'} 2`}
          value={taskDesc.phases[0].activity.description.activities[3].description.payload.quantity}
          onChange={(_ev, val) => {
            const quantity = val;
            let newTaskDesc = { ...taskDesc };
            newTaskDesc = deliveryInsertQuantity(newTaskDesc, 3, quantity);
            onInputChange(newTaskDesc);
          }}
        />
      </Grid>
    </Grid>
  );
}
