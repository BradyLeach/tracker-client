import { vec4ToHsla } from '@/utils/svgCanvas';
import type { SvgLayerProps } from '@/utils/svgCanvas';

export type { SvgLayerProps };

export function SvgLayer( { color, scale = 1, zIndex, children }: SvgLayerProps ) 
{
    const hsla = vec4ToHsla( color );

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                zIndex,
                transform: `scale(${scale})`,
                transformOrigin: 'center',
                ['--layer-color' as string]: hsla,
                // Note: CSS custom property transitions require @property registration
                // and are not supported via the `transition` shorthand in any browser.
                // Colour animation should be handled by animating the Vec4 state in React
                // and letting each render push new values, or via Web Animations API.
            }}
        >
            {children}
        </div>
    );
}

export default SvgLayer;
