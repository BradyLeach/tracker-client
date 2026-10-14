import { SmartLink } from '@/components/shared/links/SmartLink';

import LogoMark from '@/assets/logos/plan-make-trace-mark.svg?react';

/**
 * Props for LogoTile
 *
 * @property {boolean} [disableLink] - Render the tile on its own, without the
 * link to home. Used on the home page itself, where the link is a self-reference.
 * @property {number | string} [size] - Rendered width of the tile. Height
 * follows from the CSS aspect ratio, so `'100%'` fills a sized container.
 */
interface LogoTileProps
{
    disableLink?: boolean;
    size?: number | string;
}

/**
 * App-icon treatment: the white mark on a solid brand rounded square.
 *
 * Both colours and the mark's share of the tile are CSS variables
 * (`--pmt-logo-tile-bg`, `--pmt-logo-tile-fg`, `--pmt-logo-tile-mark-size`),
 * so the treatment can be re-tuned without touching this component or the SVG.
 *
 * @returns The tiled mark, wrapped in a SmartLink to home unless disabled
 */
export function LogoTile( { disableLink, size = 72 }: LogoTileProps = {} )
{
    const tile = (
        <span className="pmt-logo-tile" style={{ width: size }}>
            <LogoMark
                role="img"
                aria-label="Plan Make Trace"
                className="pmt-logo pmt-logo--inherit pmt-logo-tile__mark"
            />
        </span>
    );

    if( disableLink )
    {
        return tile;
    }

    return (
        <SmartLink href="/" sx={{ display: 'flex', alignItems: 'center', }}>
            {tile}
        </SmartLink>
    );
}

export default LogoTile;
