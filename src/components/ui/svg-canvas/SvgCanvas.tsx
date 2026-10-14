import type { SvgCanvasProps } from '@/utils/svgCanvas';

export type { SvgCanvasProps };

export function SvgCanvas( { width = '100%', height = '100%', children }: SvgCanvasProps ) 
{
    return (
        <div
            style={{
                position: 'relative',
                width,
                height,
            }}
        >
            {children}
        </div>
    );
}

export default SvgCanvas;
