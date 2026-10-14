/**
 * SearchButton - Search icon button for navbar
 *
 * Simple icon button that opens SearchModal when clicked.
 * Uses the search icon.
 */
import { IconButton, IconRenderer } from '@/components/ui';

/**
 * Props for SearchButton
 */
interface SearchButtonProps
{
    /** Click handler (opens SearchModal) */
    onClick: () => void;
    /** Accessible label */
    'aria-label'?: string;
}

/**
 * SearchButton component
 *
 * Renders search icon button for navbar.
 *
 * @param props - Component props
 * @returns SearchButton component
 */
export function SearchButton( { onClick, 'aria-label': ariaLabel }: SearchButtonProps )
{
    return (
        <IconButton
            onClick={onClick}
            aria-label={ariaLabel || 'Search'}
            size="large"
            color="inherit"
        >
            <IconRenderer iconKey="search" size={24} width={20} />
        </IconButton>
    );
}

export default SearchButton;
