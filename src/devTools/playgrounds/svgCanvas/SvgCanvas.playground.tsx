import React from 'react';
import { Box, Stack, Divider } from '@/components/ui/layout';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/inputs';
import { Slider } from '@/components/ui/forms';
import { SvgCanvas, SvgLayer } from '@/components/ui/svg-canvas';
import type { Vec4 } from '@/utils/svgCanvas';

const PRESETS: Record<string, Vec4> = {
    Rested: [240, 80, 50, 1],
    Trained: [120, 80, 50, 1],
    Overtrained: [0, 80, 50, 1],
};

interface LayerState {
    color: Vec4;
    scale: number;
}

const INITIAL_LAYERS: LayerState[] = [
    { color: [240, 80, 50, 1], scale: 1 },
    { color: [200, 80, 30, 0.8], scale: 0.6 },
];

interface LayerControlsProps {
    index: number;
    layer: LayerState;
    onChange: ( layer: LayerState ) => void;
}

function LayerControls( { index, layer, onChange }: LayerControlsProps ) 
{
    const [h, s, l, a] = layer.color;
    const { scale } = layer;

    function setColor( color: Vec4 ) 
    {
        onChange( { ...layer, color } );
    }

    function setScale( v: number ) 
    {
        onChange( { ...layer, scale: v } );
    }

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                Layer {index + 1} — Vec4: [{h.toFixed( 0 )}, {s.toFixed( 0 )}, {l.toFixed( 0 )}, {a.toFixed( 2 )}]
            </Typography>

            <Stack direction="row" spacing={2} mb={1}>
                {Object.entries( PRESETS ).map( ( [label, preset] ) => (
                    <Button key={label} variant="outlined" size="small" onClick={() => setColor( preset )}>
                        {label}
                    </Button>
                ) )}
            </Stack>

            <Box sx={{ maxWidth: 400 }}>
                <Typography variant="body2">H: {h.toFixed( 0 )}</Typography>
                <Slider min={0} max={360} step={1} value={h}
                    onChange={( _, v ) => setColor( [v as number, s, l, a] )} />

                <Typography variant="body2">S: {s.toFixed( 0 )}</Typography>
                <Slider min={0} max={100} step={1} value={s}
                    onChange={( _, v ) => setColor( [h, v as number, l, a] )} />

                <Typography variant="body2">L: {l.toFixed( 0 )}</Typography>
                <Slider min={0} max={100} step={1} value={l}
                    onChange={( _, v ) => setColor( [h, s, v as number, a] )} />

                <Typography variant="body2">A: {a.toFixed( 2 )}</Typography>
                <Slider min={0} max={1} step={0.01} value={a}
                    onChange={( _, v ) => setColor( [h, s, l, v as number] )} />

                <Typography variant="body2">Scale: {scale.toFixed( 2 )}</Typography>
                <Slider min={0.1} max={2} step={0.01} value={scale}
                    onChange={( _, v ) => setScale( v as number )} />
            </Box>
        </Box>
    );
}

export function PageSvgCanvasPlayground() 
{
    const [layers, setLayers] = React.useState<LayerState[]>( INITIAL_LAYERS );

    function updateLayer( index: number, layer: LayerState ) 
    {
        setLayers( prev => prev.map( ( l, i ) => ( i === index ? layer : l ) ) );
    }

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                SvgCanvas Playground
            </Typography>

            <Stack direction="row" spacing={4} alignItems="flex-start">
                <Box sx={{ minWidth: 440 }}>
                    {layers.map( ( layer, i ) => (
                        <Box key={i}>
                            <LayerControls index={i} layer={layer} onChange={( l ) => updateLayer( i, l )} />
                            {i < layers.length - 1 && <Divider sx={{ my: 2 }} />}
                        </Box>
                    ) )}
                </Box>

                <Box sx={{ width: 300, height: 300, position: 'relative', border: '1px solid #ccc', flexShrink: 0 }}>
                    <SvgCanvas width="100%" height="100%">
                        {layers.map( ( { color, scale }, i ) => (
                            <SvgLayer key={i} color={color} scale={scale} zIndex={i + 1}>
                                <svg width="100%" height="100%" viewBox="0 0 100 100">
                                    <rect
                                        x="10"
                                        y="10"
                                        width="80"
                                        height="80"
                                        strokeWidth="3"
                                        vectorEffect="non-scaling-stroke"
                                        style={{ stroke: 'var(--layer-color)', fill: 'var(--layer-color)', fillOpacity: 0.15 }}
                                    />
                                </svg>
                            </SvgLayer>
                        ) )}
                    </SvgCanvas>
                </Box>
            </Stack>
        </Box>
    );
}
