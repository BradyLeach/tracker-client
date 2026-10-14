/**
 * Text Utilities
 *
 * Display-side string helpers shared by avatars, tiles and lists.
 */

/**
 * Up to two initials from a name.
 *
 * Used wherever a record has no image — an avatar, an icon tile, a comment
 * author — so a missing picture never renders as a gap.
 */
export function getInitials( text: string ): string
{
    return text
        .split( /\s+/ )
        .filter( Boolean )
        .slice( 0, 2 )
        .map( word => word[0]?.toUpperCase() ?? '' )
        .join( '' );
}
