/**
 * Slider - App UI component for slider inputs
 *
 * Thin wrapper over CustomSlider (MUI Slider + Modernize theme).
 * Provides stable import surface for all slider usage across app.
 */
import CustomSlider from '@/theme/theme-elements/forms/CustomSlider';
import type { SliderProps } from '@mui/material';

export type { SliderProps } from '@mui/material';

export function Slider( props: SliderProps )
{
    return <CustomSlider {...props} />;
}

export default Slider;
