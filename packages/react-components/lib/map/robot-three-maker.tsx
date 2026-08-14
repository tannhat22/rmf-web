import { Html, Text } from '@react-three/drei';
import { MeshProps, ThreeEvent, useLoader } from '@react-three/fiber';
import React from 'react';
import { Color, Euler, Texture, TextureLoader, Vector3 } from 'three';

import { robotStatusToUpperCase } from '../robots/utils';
import { CircleShape } from './circle-shape';
import { RobotStatusInfo, robotStatusColor, RobotStatusRing } from './robot-status-three';
import { debounce } from './shape-three-rendering';
import { TextThreeRendering } from './text-maker';

export interface RobotData {
  fleet: string;
  name: string;
  model: string;
  footprint: number;
  scale: number;
  color: string;
  inConflict?: boolean;
  iconPath?: string;
}

interface RobotThreeMakerProps {
  imageUrl?: string;
  robot: RobotData;
  position: Vector3;
  onRobotClick?: (ev: ThreeEvent<MouseEvent>, robot: RobotData) => void;
  rotation: Euler;
  circleSegment: number;
  fontPath?: string;
  robotLabel: boolean;
  statusInfo?: RobotStatusInfo;
  showStatus?: boolean;
}

interface RobotImageMakerProps extends MeshProps {
  imageUrl: string;
  robot: RobotData;
  position: Vector3;
  onRobotClick?: (ev: ThreeEvent<MouseEvent>, robot: RobotData) => void;
  rotation: Euler;
}

const RobotImageMaker = ({
  imageUrl,
  position,
  rotation,
  onRobotClick,
  robot,
  ...otherProps
}: RobotImageMakerProps): JSX.Element => {
  const alphaTestThreshold = 0.5;
  const texture: Texture | undefined = useLoader(TextureLoader, imageUrl, undefined, (err) => {
    console.error(`Error loading image from ${imageUrl}:`, err);
  });

  if (!texture) {
    console.error(`Failed to create image texture with ${robot.iconPath}.`);
    return <></>;
  }

  return (
    <>
      <mesh
        position={position}
        rotation={new Euler(0, 0, rotation.z)}
        onClick={(ev: ThreeEvent<MouseEvent>) => onRobotClick && onRobotClick(ev, robot)}
        {...otherProps}
      >
        <planeGeometry
          attach="geometry"
          args={[texture.image.width * robot.scale, texture.image.height * robot.scale]}
        />
        <meshBasicMaterial
          attach="material"
          map={texture}
          color={new Color(robot.color)}
          alphaTest={alphaTestThreshold}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

export const RobotThreeMaker = ({
  imageUrl,
  robot,
  position,
  onRobotClick,
  rotation,
  circleSegment,
  fontPath,
  robotLabel,
  statusInfo,
  showStatus = false,
}: RobotThreeMakerProps): JSX.Element => {
  const [isHovered, setIsHovered] = React.useState(false);

  // the debounced handlers have to survive re-renders, otherwise each render
  // builds a fresh timer that the other handler can no longer cancel. Robots
  // re-render on every state update, so without this the tooltip gets stuck.
  const debouncedHandlePointerOver = React.useMemo(
    () =>
      debounce(() => {
        setIsHovered(true);
      }, 300),
    [],
  );

  const debouncedHandlePointerOut = React.useMemo(
    () =>
      debounce(() => {
        setIsHovered(false);
      }, 300),
    [],
  );

  const scaleFactor = isHovered ? 2 : 1.0;

  const statusColor = robotStatusColor(statusInfo);
  const statusLabel = statusInfo?.decommissioned
    ? 'DECOMMISSIONED'
    : statusInfo?.status
      ? robotStatusToUpperCase(statusInfo.status)
      : 'UNKNOWN';

  return (
    <>
      {isHovered && (
        <mesh position={position} scale={[0.5, 0.5, 0.5]}>
          <Html zIndexRange={[1]}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '0.3rem 0.5rem',
                borderRadius: '4px',
                borderLeft: `3px solid ${statusColor}`,
                fontSize: '0.6rem',
                whiteSpace: 'nowrap',
                transform: `scale(${scaleFactor})`,
                transition: 'transform 0.3s',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{robot.name}</div>
              {statusInfo && (
                <>
                  <div style={{ color: statusColor, fontWeight: 'bold' }}>{statusLabel}</div>
                  {statusInfo.battery != null && (
                    <div>{`Battery: ${(statusInfo.battery * 100).toFixed(0)}%`}</div>
                  )}
                  {statusInfo.taskId && <div>{`Task: ${statusInfo.taskId}`}</div>}
                  {statusInfo.issues && statusInfo.issues.length > 0 && (
                    <div>{`Issues: ${statusInfo.issues.join(', ')}`}</div>
                  )}
                </>
              )}
            </div>
          </Html>
        </mesh>
      )}
      {showStatus && <RobotStatusRing position={position} statusInfo={statusInfo} radius={0.65} />}
      {robotLabel && fontPath && fontPath.length > 0 ? (
        <Text
          color="black"
          font={fontPath}
          fontSize={0.5}
          position={[position.x, position.y + 1, position.z]}
        >
          {robot.name}
        </Text>
      ) : robotLabel ? (
        <TextThreeRendering position={[position.x, position.y + 1, 1]} text={robot.name} />
      ) : null}
      {imageUrl ? (
        <RobotImageMaker
          imageUrl={imageUrl}
          position={position}
          rotation={rotation}
          onRobotClick={(ev: ThreeEvent<MouseEvent>) => onRobotClick && onRobotClick(ev, robot)}
          robot={robot}
          onPointerOver={debouncedHandlePointerOver}
          onPointerOut={debouncedHandlePointerOut}
        />
      ) : (
        <CircleShape
          position={position}
          rotation={rotation}
          onRobotClick={(ev: ThreeEvent<MouseEvent>) => onRobotClick && onRobotClick(ev, robot)}
          robot={robot}
          segment={circleSegment}
          onPointerOver={debouncedHandlePointerOver}
          onPointerOut={debouncedHandlePointerOut}
        />
      )}
    </>
  );
};
