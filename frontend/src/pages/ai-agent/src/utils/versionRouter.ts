import type React from 'react';
import { appVersionType } from '@/utils/env';

type TypeVersionComponentMap<P = any> = Record<string, React.ComponentType<P>>;

export function getVersionComponent<P = any>(
  versions: TypeVersionComponentMap<P>,
): React.ComponentType<P> {
  const Component = versions[appVersionType];
  // const Component = versions['GLOBAL'];
  if (Component) {
    return Component;
  }

  if (versions['CN']) {
    console.warn(`Version ${appVersionType} not found, fallback to CN version`);
    return versions['CN'];
  }

  throw new Error(`No component found for version ${appVersionType} and no CN fallback available`);
}

export type { TypeVersionComponentMap };
