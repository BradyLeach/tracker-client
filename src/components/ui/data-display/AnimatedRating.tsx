/**
 * AnimatedRating
 *
 * Wraps Rating with a count-up animation from 0 to the target value.
 * Animation re-fires on each mount, making it compatible with Collapse/unmount patterns.
 */

import { useState, useEffect } from 'react';
import { Rating } from './Rating';
import type { RatingProps } from './Rating';

export interface AnimatedRatingProps extends Omit<RatingProps, 'value'>
{
    value: number;
}

export function AnimatedRating( { value, max = 5, ...props }: AnimatedRatingProps )
{
    const [displayValue, setDisplayValue] = useState( 0 );

    useEffect( () =>
    {
        if( value === 0 ) return;
        let step = 0;
        const interval = setInterval( () =>
        {
            step += 1;
            setDisplayValue( step );
            if( step >= value ) clearInterval( interval );
        }, 120 );
        return () => clearInterval( interval );
    }, [value] );

    return <Rating value={displayValue} max={max} {...props} />;
}
