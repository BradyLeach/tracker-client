/**
 * Type declarations for individual Tabler icon imports
 *
 * Tabler icons can be imported individually from dist/esm/icons/*.mjs
 * for optimal tree-shaking, but those files lack TypeScript definitions.
 * This shim provides type safety for the selective import pattern.
 */
declare module '@tabler/icons-react/dist/esm/icons/*.mjs' {
  import { FC, SVGProps } from 'react';

  export interface TablerIconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    stroke?: string | number;
  }

  const Icon: FC<TablerIconProps>;
  export { Icon as default };
}
