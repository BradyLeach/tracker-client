/**
 * DatePicker - App UI component for date selection
 *
 * Thin wrapper over MUI X DatePicker (no theme-element exists).
 * Provides stable import surface for all date picker usage across app.
 */
import { DatePicker as MuiDatePicker, type DatePickerProps } from '@mui/x-date-pickers/DatePicker';

export type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';

export function DatePicker<T extends boolean = true>( props: DatePickerProps<T> )
{
    return <MuiDatePicker {...props} />;
}

export default DatePicker;
