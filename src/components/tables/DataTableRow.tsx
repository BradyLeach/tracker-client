/**
 * DataTableRow
 *
 * One row of a DataTable. Extracted so row-level hooks can be called per
 * row — currently realtime trace animation on change.
 */

import { TableRow } from '@/components/ui/data-display/Table';
import { useRealtimeAnimation } from '@/components/shared/realtime';
import type { ReactNode } from 'react';

export interface DataTableRowProps
{
    rowId: string;
    selected: boolean;
    clickable: boolean;
    onClick?: () => void;
    children: ReactNode;
    changeNonce?: number;
    selectedSx: Record<string, unknown>;
}

export function DataTableRow( {
    rowId, selected, clickable, onClick, children, changeNonce, selectedSx,
}: DataTableRowProps )
{
    const traceClass = useRealtimeAnimation( changeNonce );

    return (
        <TableRow
            key={rowId}
            hover
            selected={selected}
            onClick={onClick}
            className={traceClass}
            sx={{
                cursor: clickable ? 'pointer' : 'default',
                ...selectedSx,
            }}
        >
            {children}
        </TableRow>
    );
}
