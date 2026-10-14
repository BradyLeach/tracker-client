import React from 'react';
import { logger } from '@/core/utils';
import { ICONS } from '@/config/icons.config';
import type { IconKey } from '@/config/icons.config';

type IconRendererProps = {
    /** An icon chosen in code. Typed, so a misspelt key fails typecheck. */
    iconKey?: IconKey;
    /**
     * An icon name read from data — a record's `icon` field, a config value. Resolved at
     * runtime, and takes precedence over `iconKey` when it names a known icon, so a typed
     * `iconKey` can serve as the default for a data-driven one.
     */
    iconName?: string;
    /** Rendered when neither name resolves to an icon. Omit to fall back to the default icon. */
    fallback?: React.ReactNode;
    size?: number;
    width?: number;
    /**
     * A CSS colour, applied as the icon's stroke.
     *
     * Must be a real colour — an MUI palette path such as 'text.secondary'
     * is not valid CSS and resolves to `stroke: none`, rendering the icon
     * invisible. Set the colour on a parent via `sx` and let the default
     * `currentColor` inherit it.
     */
    color?: string;
    stroke?: number;
};

/** Unknown names already reported, so a list of records warns once per name rather than per row. */
const reportedUnknownNames = new Set<string>();

function isIconKey( name: string | undefined ): name is IconKey
{
    return !!name && Object.hasOwn( ICONS, name );
}

/**
 * The single place an icon name becomes an icon.
 *
 * Resolution order: a known `iconName`, then `iconKey`, then `fallback`, then the default icon.
 */
export const IconRenderer: React.FC<IconRendererProps> = ( {
    iconKey,
    iconName,
    fallback,
    size = 20,
    width,
    color = 'currentColor',
    stroke,
} ) =>
{
    // A name the data carries that no icon answers to is a mismatch between the data and the
    // map, so it is reported rather than silently drawn as the default.
    if( import.meta.env.DEV && iconName && !isIconKey( iconName ) && !reportedUnknownNames.has( iconName ) )
    {
        reportedUnknownNames.add( iconName );
        logger.warn( `IconRenderer: no icon named '${iconName}'` );
    }

    const resolved = isIconKey( iconName ) ? iconName : iconKey;

    if( !resolved && fallback !== undefined ) return <>{fallback}</>;

    const Icon = ICONS[resolved ?? 'default'].component;
    return <Icon size={size} width={width} color={color} stroke={stroke} />;
};