import { Line, LineProps } from '@react-three/drei';
import React from 'react';
import { Material } from 'three';

// three-stdlib is not a direct dependency here, so take the ref type from drei.
type LineRef = React.ElementRef<typeof Line>;

/**
 * Drop-in replacement for drei's `Line` that releases its material on unmount.
 *
 * Drei renders the line through `<primitive>` elements, and r3f deliberately
 * never disposes primitives ("their state may be kept outside of React"). Drei
 * disposes the geometry itself but not the `LineMaterial`, so every unmounted
 * line leaves a compiled shader program behind on the gpu. Lines that come and
 * go, like the trajectories, leak one per update.
 */
export const DisposableLine = React.forwardRef<LineRef, LineProps>((props, forwardedRef) => {
  // captured while the ref is attached, refs are already detached by the time
  // the unmount cleanup runs.
  const materialRef = React.useRef<Material | Material[] | null>(null);

  const setRef = React.useCallback(
    (line: LineRef | null) => {
      if (line) {
        materialRef.current = line.material;
      }
      if (typeof forwardedRef === 'function') {
        forwardedRef(line);
      } else if (forwardedRef) {
        forwardedRef.current = line;
      }
    },
    [forwardedRef],
  );

  React.useEffect(
    () => () => {
      const material = materialRef.current;
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else {
        material?.dispose();
      }
      materialRef.current = null;
    },
    [],
  );

  return <Line ref={setRef} {...props} />;
});

DisposableLine.displayName = 'DisposableLine';
