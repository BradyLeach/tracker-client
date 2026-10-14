/**
 * CollectionToolbar
 *
 * Search, sort and filter controls for any collection view. Sits between the
 * page header and the collection itself.
 *
 * A renderer, like DataTable: it reports the user's intent and transforms
 * nothing. The collection pipeline owns what the intent means, so the same
 * toolbar drives a table, a card grid or a grouped board.
 *
 * Named CollectionToolbar because `ui/navigation/Toolbar` is MUI's AppBar
 * layout primitive and is a different thing entirely.
 *
 * @example
 * ```tsx
 * const collection = useCollection( companies, { fields: columns } );
 *
 * <CollectionToolbar
 *     search={collection.search}
 *     onSearchChange={collection.setSearch}
 *     sortOptions={SORT_OPTIONS}
 *     sortKey={collection.sortKey}
 *     sortDir={collection.sortDir}
 *     onSortChange={collection.toggleSort}
 *     actions={<Button>Add Partner</Button>}
 * />
 * ```
 */

import { useState, type MouseEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Checkbox,
    Divider,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    MenuList,
    MenuRow,
    Popover,
    ResponsiveButton,
    Stack,
    TextField,
    Typography,
} from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import type { CollectionFilterOption, CollectionToolbarProps } from './CollectionToolbar.types';

/** Tall enough for a short list whole; a longer one scrolls between the slots. */
const FILTER_OPTIONS_MAX_HEIGHT = 260;

/**
 * The filter menu's options in order, with their section headers and dividers. An
 * array rather than fragments, which the list does not accept as children. The slots
 * are not rows: they sit outside the list, so only the options scroll.
 */
function buildFilterMenuRows( {
    options, activeKeys, showCheckbox, multiSelect, onToggle, translate,
}: {
    options: readonly CollectionFilterOption[];
    activeKeys: readonly string[];
    showCheckbox: boolean;
    multiSelect: boolean;
    onToggle: ( key: string ) => void;
    translate: ( key: string ) => string;
} ): ReactNode[]
{
    const rows: ReactNode[] = [];

    let currentSection: string | undefined;

    for( const option of options )
    {
        if( option.showDividerBefore ) rows.push( <Divider key={`divider-${option.key}`} sx={{ my: 0.5 }} /> );

        if( option.section && option.section !== currentSection )
        {
            rows.push(
                <MenuRow key={`section-${option.key}`} heading>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                        {translate( option.section )}
                    </Typography>
                </MenuRow>
            );
        }
        currentSection = option.section;

        const isActive = activeKeys.includes( option.key );

        /**
         * Multi-select filters combine; single-select replaces whatever was chosen.
         * Either way the menu stays open until the user clicks away, so a wrong pick
         * is corrected in place rather than by reopening the menu.
         */
        const select = () =>
        {
            if( !multiSelect ) activeKeys.filter( key => key !== option.key ).forEach( onToggle );
            onToggle( option.key );
        };

        rows.push(
            <MenuItem
                key={option.key}
                selected={isActive}
                // The row is the control, so it carries the checked state for assistive tech.
                role={multiSelect ? 'menuitemcheckbox' : 'menuitemradio'}
                aria-checked={isActive}
                onClick={select}
                sx={{
                    py: 1,
                    px: 2,
                    // Selection is carried by the text and checkbox, so its background stays
                    // a step quieter than the theme's selected fill.
                    '&.Mui-selected, &.Mui-selected.Mui-focusVisible': { bgcolor: 'action.hover' },
                    '&.Mui-selected:hover': { bgcolor: 'action.selected' },
                }}
            >
                {/* Selection reads from the highlight and the stronger text, so no
                    tick column holds the label off the left edge. */}
                <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
                    {/* Shows the state only: the row is the click target, so one click
                        cannot toggle twice. */}
                    {showCheckbox && (
                        <Box component="span" aria-hidden sx={{ display: 'inline-flex' }}>
                            <Checkbox
                                size="small"
                                checked={isActive}
                                tabIndex={-1}
                                disableRipple
                                sx={{ p: 0, pointerEvents: 'none' }}
                            />
                        </Box>
                    )}
                    {/* Supporting, so a step quieter than the label beside it. */}
                    {option.iconKey && (
                        <Box sx={{ display: 'inline-flex', color: 'text.secondary', opacity: 0.7 }}>
                            <IconRenderer iconKey={option.iconKey} size={18} />
                        </Box>
                    )}
                    {/* Colour, not weight: a heavier label is wider, and the menu would
                        resize under the cursor as options are ticked. */}
                    <Typography variant="body2" color={isActive ? 'text.primary' : 'text.secondary'}>
                        {translate( option.label )}
                    </Typography>
                </Stack>
            </MenuItem>
        );
    }

    return rows;
}

export function CollectionToolbar( {
    search,
    onSearchChange,
    searchPlaceholder = 'Search',
    sortOptions,
    sortKey,
    sortDir = 'asc',
    onSortChange,
    filterOptions,
    activeFilterKeys = [],
    onFilterToggle,
    filterShowCheckbox = false,
    filterMultiSelect = true,
    filterHeader,
    filterFooter,
    actions,
}: CollectionToolbarProps )
{
    const { t } = useTranslation();

    const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>( null );
    const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>( null );

    const showSearch = !!onSearchChange;
    const showSort = !!sortOptions?.length && !!onSortChange;
    // The slots are menu content too, so a header search that narrows the options to
    // nothing leaves the menu open rather than unmounting it under the cursor.
    const showFilter = !!onFilterToggle && ( !!filterOptions?.length || !!filterHeader || !!filterFooter );

    const activeSort = sortOptions?.find( option => option.key === sortKey );
    const filtersApplied = activeFilterKeys.length > 0;

    // Sort has three states, not two — unsorted, ascending, descending — and
    // the icon carries the direction so the label does not have to.
    const sortIconKey = !activeSort
        ? 'sortArrows'
        : sortDir === 'asc' ? 'sortAscending' : 'sortDescending';

    return (
        <Box
            // No outer margin: the toolbar sits in a page body above a grid and
            // in a fixed-height section header, and a bottom margin pushes it
            // off centre in the second. Spacing is the caller's.
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
            }}
        >
            {showSearch && (
                <TextField
                    size="small"
                    value={search ?? ''}
                    onChange={event => onSearchChange( event.target.value )}
                    placeholder={t( searchPlaceholder )}
                    // Grows to fill but shrinks first: in a fixed-height section
                    // header the row must not wrap, so the field gives up width
                    // before the controls beside it do.
                    sx={{ flex: '1 1 140px', minWidth: 110, maxWidth: 360 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconRenderer iconKey="search" size={16} />
                                </InputAdornment>
                            ),
                            endAdornment: search
                                ? (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            aria-label={t( 'collection.toolbar.clearSearch' )}
                                            onClick={() => onSearchChange( '' )}
                                        >
                                            <IconRenderer iconKey="close" size={14} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                                : undefined,
                        },
                    }}
                />
            )}

            {showFilter && (
                <>
                    <ResponsiveButton
                        size="small"
                        variant="outlined"
                        color="inherit"
                        // Applied filters show in the icon, never the label, so the button keeps
                        // its width and the toolbar does not shift. The count stays in the
                        // accessible name.
                        iconKey={filtersApplied ? 'filterFilled' : 'filter'}
                        label={t( 'collection.toolbar.filter' )}
                        aria-label={filtersApplied
                            ? `${t( 'collection.toolbar.filter' )} (${activeFilterKeys.length})`
                            : t( 'collection.toolbar.filter' )}
                        trailing={<IconRenderer iconKey="chevronDown" size={14} />}
                        onClick={( event: MouseEvent<HTMLElement> ) => setFilterAnchor( event.currentTarget )}
                    />
                    {/* A popover rather than a menu, so the slots sit outside the option list:
                        only the options scroll, and the scrollbar stays beside them. */}
                    <Popover
                        anchorEl={filterAnchor}
                        open={!!filterAnchor}
                        onClose={() => setFilterAnchor( null )}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        slotProps={{
                            paper: {
                                // The same surface the theme gives a menu.
                                sx: {
                                    mt: 0.5,
                                    minWidth: 200,
                                    boxShadow: 9,
                                    border: '1px solid',
                                    borderColor: 'border.base',
                                    borderRadius: 1,
                                    backgroundImage: 'none',
                                },
                            },
                        }}
                    >
                        {filterHeader && (
                            <>
                                <Box sx={{ px: 2, py: 0.5 }}>{filterHeader}</Box>
                                <Divider />
                            </>
                        )}
                        <MenuList
                            autoFocusItem={!filterHeader}
                            sx={{ py: 0.5, maxHeight: FILTER_OPTIONS_MAX_HEIGHT, overflowY: 'auto' }}
                        >
                            {buildFilterMenuRows( {
                                options: filterOptions ?? [],
                                activeKeys: activeFilterKeys,
                                showCheckbox: filterShowCheckbox,
                                multiSelect: filterMultiSelect,
                                onToggle: onFilterToggle,
                                translate: t,
                            } )}
                        </MenuList>
                        {filterFooter && (
                            <>
                                <Divider />
                                <Box sx={{ px: 2, py: 0.5 }}>{filterFooter}</Box>
                            </>
                        )}
                    </Popover>
                </>
            )}

            {showSort && (
                <>
                    <ResponsiveButton
                        size="small"
                        variant="outlined"
                        color="inherit"
                        iconKey={sortIconKey}
                        label={activeSort
                            ? `${t( 'collection.toolbar.sortBy' )}: ${t( activeSort.label )}`
                            : t( 'collection.toolbar.sort' )}
                        trailing={<IconRenderer iconKey="chevronDown" size={14} />}
                        onClick={( event: MouseEvent<HTMLElement> ) => setSortAnchor( event.currentTarget )}
                    />
                    <Menu
                        anchorEl={sortAnchor}
                        open={!!sortAnchor}
                        onClose={() => setSortAnchor( null )}
                    >
                        {sortOptions.map( option => (
                            <MenuItem
                                key={option.key}
                                selected={option.key === sortKey}
                                onClick={() =>
                                {
                                    onSortChange( option.key );
                                    // Direction is a second press on the same
                                    // key, so leave the menu open for it.
                                    if( option.key !== sortKey ) setSortAnchor( null );
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    <Box sx={{ width: 16, display: 'flex' }}>
                                        {option.key === sortKey && (
                                            <IconRenderer
                                                iconKey={sortDir === 'asc' ? 'sortAscending' : 'sortDescending'}
                                                size={14}
                                            />
                                        )}
                                    </Box>
                                    {t( option.label )}
                                </Box>
                            </MenuItem>
                        ) )}
                    </Menu>
                </>
            )}

            {actions && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {actions}
                </Box>
            )}
        </Box>
    );
}

export default CollectionToolbar;
