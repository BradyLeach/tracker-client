/**
 * IconPicker
 *
 * Chooses an icon from the approved registry. A trigger showing the current icon opens a
 * grid of every offered icon, grouped by category.
 *
 * Controlled: the value is a registry key held by the caller, typically a record's `icon`
 * field. Any stored value displays as it does everywhere else — empty, unknown or hidden
 * — and only choosing an icon changes it. Opening or dismissing the grid never does.
 *
 * Keyboard: focus lands on the current icon when the grid opens. Left and right move one
 * icon; up and down move one row in the same column, crossing into the neighbouring group at
 * its edge. Home and End jump to the ends, Enter or Space chooses, and Escape closes.
 * Focus returns to the trigger either way.
 */

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Button, IconButton, IconRenderer, Popover, Tooltip, Typography } from '@/components/ui';
import { ICONS } from '@/config/icons.config';
import type { IconCategory, IconDefinition, IconKey } from '@/config/icons.config';

export interface IconPickerProps
{
    /** The stored registry key. Empty, unknown or hidden keys display through the fallback rules. */
    value?: string;
    /** Called with the chosen key. Never called by opening or dismissing the grid. */
    onChange: ( key: IconKey ) => void;
    /** Called when the grid closes, so a form can mark the field touched. */
    onBlur?: () => void;
    /** The category's generic icon, shown when the value is empty or unknown. */
    fallback: IconKey;
    disabled?: boolean;
    /** Forwarded to the trigger, so a form can focus the field. */
    ref?: Ref<HTMLButtonElement>;
    id?: string;
}

/** Icons per grid row at full width. Narrower screens fit fewer; the grid reports how many. */
const COLUMNS = 8;

/** The tile shared by the trigger and the selected option. */
const TILE_SX = {
    backgroundColor: 'iconTile.bg',
    border: '1px solid',
    borderColor: 'border.base',
} as const;

interface Group
{
    category: string;
    keys: IconKey[];
}

/** The order groups are shown in. Places leads: it holds the icons records are most often given. */
const CATEGORY_ORDER: IconCategory[] = ['places', 'people', 'commerce', 'shipping', 'production', 'ingredients'];

/**
 * The offered set, grouped by category in CATEGORY_ORDER, icons in registry order within each.
 * Interface icons are the app's own chrome and deprecated icons are being retired, so neither
 * is offered.
 */
const GROUPS: Group[] = CATEGORY_ORDER
    .map( category => ( {
        category,
        keys: ( Object.keys( ICONS ) as IconKey[] ).filter( key =>
        {
            const definition: IconDefinition = ICONS[key];
            return definition.category === category && !definition.deprecated;
        } ),
    } ) )
    .filter( group => group.keys.length > 0 );

/** Every offered key in display order — the sequence arrow keys move through. */
const OFFERED: IconKey[] = GROUPS.flatMap( group => group.keys );

/** Where each group begins in OFFERED. */
const GROUP_STARTS: number[] = GROUPS.reduce<number[]>(
    ( starts, _group, index ) => [...starts, index === 0 ? 0 : starts[index - 1] + GROUPS[index - 1].keys.length],
    []
);

/**
 * The option a row move lands on: the same column in the next row up or down. Groups wrap
 * their own rows, so a move past a group's edge row enters the neighbouring group at the same
 * column, and a short row takes its last icon.
 */
function verticalTarget( index: number, step: 1 | -1, columns: number ): number
{
    const group = GROUP_STARTS.reduce( ( found, start, groupIndex ) => start <= index ? groupIndex : found, 0 );
    const position = index - GROUP_STARTS[group];
    const column = position % columns;

    const rowStart = ( groupIndex: number, row: number ) =>
        GROUP_STARTS[groupIndex] + Math.min( row * columns + column, GROUPS[groupIndex].keys.length - 1 );
    const lastRow = ( groupIndex: number ) => Math.floor( ( GROUPS[groupIndex].keys.length - 1 ) / columns );

    const row = Math.floor( position / columns ) + step;
    if( row >= 0 && row <= lastRow( group ) ) return rowStart( group, row );

    const neighbour = group + step;
    if( neighbour < 0 || neighbour >= GROUPS.length ) return index;

    return rowStart( neighbour, step === 1 ? 0 : lastRow( neighbour ) );
}

export function IconPicker( { value, onChange, onBlur, fallback, disabled, ref, id }: IconPickerProps )
{
    const { t } = useTranslation();
    const [anchor, setAnchor] = useState<HTMLElement | null>( null );
    const [activeIndex, setActiveIndex] = useState( 0 );
    const [columns, setColumns] = useState( COLUMNS );
    const optionRefs = useRef<( HTMLButtonElement | null )[]>( [] );
    const gridRef = useRef<HTMLElement | null>( null );

    const selectedIndex = useMemo( () => OFFERED.indexOf( value as IconKey ), [value] );
    const open = !!anchor;

    // The grid fits as many columns as the screen allows, so row moves read the count it rendered.
    // An unresolved template (no layout to measure) keeps the full-width count.
    useEffect( () =>
    {
        if( !open ) return;

        const frame = requestAnimationFrame( () =>
        {
            const template = gridRef.current ? getComputedStyle( gridRef.current ).gridTemplateColumns : '';
            const rendered = template.includes( 'repeat' ) ? 0 : template.split( ' ' ).filter( Boolean ).length;

            setColumns( rendered || COLUMNS );
        } );

        return () => cancelAnimationFrame( frame );
    }, [open] );

    // Focus follows the active option, so the grid is navigable from the moment it opens.
    useEffect( () =>
    {
        if( !open ) return;

        const frame = requestAnimationFrame( () =>
        {
            const option = optionRefs.current[activeIndex];
            option?.focus();
            option?.scrollIntoView( { block: 'nearest' } );
        } );

        return () => cancelAnimationFrame( frame );
    }, [open, activeIndex] );

    const openGrid = ( trigger: HTMLElement ) =>
    {
        // The current icon when it is offered; the first otherwise.
        setActiveIndex( Math.max( selectedIndex, 0 ) );
        setAnchor( trigger );
    };

    const close = () =>
    {
        const trigger = anchor;

        setAnchor( null );
        onBlur?.();

        // Back to the trigger explicitly: a click does not focus a button in every browser,
        // so the popover's own restore can land focus on the page instead.
        requestAnimationFrame( () => trigger?.focus() );
    };

    const choose = ( key: IconKey ) =>
    {
        onChange( key );
        close();
    };

    const handleKeyDown = ( event: KeyboardEvent<HTMLElement> ) =>
    {
        const last = OFFERED.length - 1;
        const moves: Record<string, number> = {
            ArrowRight: activeIndex + 1,
            ArrowLeft: activeIndex - 1,
            ArrowDown: verticalTarget( activeIndex, 1, columns ),
            ArrowUp: verticalTarget( activeIndex, -1, columns ),
            Home: 0,
            End: last,
        };

        if( event.key in moves )
        {
            event.preventDefault();
            setActiveIndex( Math.min( Math.max( moves[event.key], 0 ), last ) );
            return;
        }

        if( event.key === 'Enter' || event.key === ' ' )
        {
            event.preventDefault();
            choose( OFFERED[activeIndex] );
        }
    };

    return (
        <>
            <Button
                ref={ref}
                id={id}
                variant="outlined"
                color="inherit"
                size="small"
                disabled={disabled}
                aria-label={t( 'shared.iconPicker.choose' )}
                aria-haspopup="listbox"
                aria-expanded={open ? 'true' : undefined}
                onClick={( event: MouseEvent<HTMLElement> ) => openGrid( event.currentTarget )}
                // Leaving the field without opening it still counts as visiting it. Focus moving
                // into the open grid does not.
                onBlur={() => { if( !open ) onBlur?.(); }}
                sx={{ minWidth: 0, px: 1, gap: 1 }}
            >
                <Avatar
                    variant="rounded"
                    sx={{ ...TILE_SX, width: 28, height: 28, borderRadius: '6px', color: 'text.secondary' }}
                >
                    <IconRenderer iconName={value} iconKey={fallback} size={18} />
                </Avatar>
                <IconRenderer iconKey="chevronDown" size={14} />
            </Button>

            <Popover
                open={open}
                anchorEl={anchor}
                onClose={close}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                slotProps={{ paper: { sx: { maxHeight: 320, width: COLUMNS * 36 + 32, maxWidth: 'calc(100vw - 32px)', mt: 0.5 } } }}
            >
                <Box
                    role="listbox"
                    aria-label={t( 'shared.iconPicker.choose' )}
                    onKeyDown={handleKeyDown}
                    sx={{ px: 2, py: 1 }}
                >
                    {GROUPS.map( group =>
                    {
                        const headingId = `icon-picker-${group.category}`;

                        return (
                            <Box key={group.category} role="group" aria-labelledby={headingId} sx={{ mb: 1.5 }}>
                                <Typography
                                    id={headingId}
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75 }}
                                >
                                    {t( `shared.iconCategory.${group.category}` )}
                                </Typography>
                                <Box
                                    ref={group === GROUPS[0] ? gridRef : undefined}
                                    sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 32px)', gap: 0.5 }}
                                >
                                    {group.keys.map( key =>
                                    {
                                        const index = OFFERED.indexOf( key );
                                        const isSelected = index === selectedIndex;
                                        const label = t( ICONS[key].label ?? key );

                                        return (
                                            <Tooltip key={key} title={label}>
                                                <IconButton
                                                    ref={( node: HTMLButtonElement | null ) =>
                                                    {
                                                        optionRefs.current[index] = node;
                                                    }}
                                                    role="option"
                                                    aria-label={label}
                                                    aria-selected={isSelected}
                                                    // Roving focus: one option in the tab order at a time.
                                                    tabIndex={index === activeIndex ? 0 : -1}
                                                    size="small"
                                                    onClick={() => choose( key )}
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '6px',
                                                        color: 'text.secondary',
                                                        ...( isSelected
                                                            ? TILE_SX
                                                            : { border: '1px solid transparent' } ),
                                                    }}
                                                >
                                                    <IconRenderer iconKey={key} size={18} />
                                                </IconButton>
                                            </Tooltip>
                                        );
                                    } )}
                                </Box>
                            </Box>
                        );
                    } )}
                </Box>
            </Popover>
        </>
    );
}

export default IconPicker;
