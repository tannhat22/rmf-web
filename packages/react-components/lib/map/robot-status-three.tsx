import { Ring } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ApiServerModelsRmfApiRobotStateStatus as Status } from 'api-client';
import React from 'react';
import { Color, MeshBasicMaterial, Vector3 } from 'three';

/**
 * Live state of a robot. Kept apart from `RobotData` because that one is built
 * once and cached per robot, so it never sees updates.
 */
export interface RobotStatusInfo {
  status?: Status;
  battery?: number | null;
  taskId?: string | null;
  issues?: string[];
  decommissioned?: boolean;
}

// Same colors the robots table gives these statuses, taken from the default mui
// palette. The canvas runs in its own reconciler and does not see the mui theme.
const IDLE_COLOR = '#ed6c02'; // warning.main
const DISABLED_COLOR = '#9e9e9e'; // action.disabled

const STATUS_COLORS: Partial<Record<Status, string>> = {
  [Status.Error]: '#d32f2f', // error.main
  [Status.Working]: '#2e7d32', // success.main
  [Status.Charging]: '#0288d1', // info.main
  [Status.Offline]: DISABLED_COLOR,
  [Status.Uninitialized]: DISABLED_COLOR,
  [Status.Shutdown]: DISABLED_COLOR,
};

export function robotStatusColor(statusInfo?: RobotStatusInfo): string {
  if (!statusInfo) {
    return IDLE_COLOR;
  }
  if (statusInfo.decommissioned) {
    return DISABLED_COLOR;
  }
  return (statusInfo.status && STATUS_COLORS[statusInfo.status]) || IDLE_COLOR;
}

interface RobotStatusRingProps {
  position: Vector3;
  statusInfo?: RobotStatusInfo;
  /** inner radius, the ring is drawn just outside the robot icon */
  radius?: number;
}

const RING_THICKNESS = 0.15;
const RING_SEGMENT = 64;
const BLINK_PERIOD_SEC = 1;
const STEADY_OPACITY = 0.9;

/**
 * Draws a colored ring around a robot so its status can be read without
 * hovering. Errors pulse, a steady red is too easy to miss on a busy map.
 */
export const RobotStatusRing = ({
  position,
  statusInfo,
  radius = 0.85,
}: RobotStatusRingProps): JSX.Element => {
  const materialRef = React.useRef<MeshBasicMaterial>(null);
  const color = React.useMemo(() => new Color(robotStatusColor(statusInfo)), [statusInfo]);
  const blink = statusInfo?.status === Status.Error && !statusInfo.decommissioned;

  useFrame(({ clock }) => {
    if (!materialRef.current) {
      return;
    }
    materialRef.current.opacity = blink
      ? 0.3 + 0.6 * Math.abs(Math.sin((Math.PI * clock.elapsedTime) / BLINK_PERIOD_SEC))
      : STEADY_OPACITY;
  });

  return (
    <Ring args={[radius, radius + RING_THICKNESS, RING_SEGMENT]} position={position}>
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={STEADY_OPACITY}
        toneMapped={false}
      />
    </Ring>
  );
};
