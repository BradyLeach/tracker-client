/**
 * Swipeable - Reusable gesture wrapper for swipeable content
 *
 * Encapsulates all swipe gesture logic and reveal animations.
 * Supports optional left/right reveal content and colors.
 *
 * @example
 * ```tsx
 * <Swipeable
 *   onSwipeLeft={() => markAsRead()}
 *   leftReveal={<Icon />}
 *   leftColor="primary.main"
 *   threshold={60}
 * >
 *   <ListItemButton>Content</ListItemButton>
 * </Swipeable>
 * ```
 */
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Box from '../layout/Box';

export interface SwipeableProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftReveal?: ReactNode;
  rightReveal?: ReactNode;
  leftColor?: string;
  rightColor?: string;
  threshold?: number;
  disabled?: boolean;
}

export function Swipeable( {
    children,
    onSwipeLeft,
    onSwipeRight,
    leftReveal,
    rightReveal,
    leftColor = 'primary.main',
    rightColor = 'primary.main',
    threshold = 60,
    disabled = false,
}: SwipeableProps ) 
{
    const [swipeOffset, setSwipeOffset] = useState( 0 );

    const clamp = ( v: number ) => Math.max( -threshold, Math.min( v, threshold ) );

    const swipeHandlers = useSwipeable( {
        onSwiping: ( { deltaX } ) => 
        {
            if( disabled ) return;

            let next = swipeOffset;
            if( onSwipeLeft && deltaX < 0 ) 
            {
                next = clamp( deltaX );
            }
            else if( onSwipeRight && deltaX > 0 ) 
            {
                next = clamp( deltaX );
            }
            if( next !== swipeOffset ) 
            {
                setSwipeOffset( next );
            }
        },
        onSwiped: () => 
        {
            if( disabled ) return;

            const abs = Math.abs( swipeOffset );
            if( swipeOffset < 0 && onSwipeLeft && abs >= threshold ) 
            {
                onSwipeLeft();
            }
            if( swipeOffset > 0 && onSwipeRight && abs >= threshold ) 
            {
                onSwipeRight();
            }
            setSwipeOffset( 0 );
        },
        trackMouse: false,
        preventScrollOnSwipe: true,
    } );

    // Swipe left → content moves left → exposes right side
    // Swipe right → content moves right → exposes left side
    const showRightReveal = swipeOffset < 0 && rightReveal;
    const showLeftReveal = swipeOffset > 0 && leftReveal;

    return (
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 0 }}>
            {/* Left reveal background */}
            {showLeftReveal && (
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: threshold,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: leftColor,
                        opacity: Math.min( Math.abs( swipeOffset ) / threshold, 1 ),
                    }}
                >
                    {leftReveal}
                </Box>
            )}

            {/* Right reveal background */}
            {showRightReveal && (
                <Box
                    sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: threshold,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: rightColor,
                        opacity: Math.min( Math.abs( swipeOffset ) / threshold, 1 ),
                    }}
                >
                    {rightReveal}
                </Box>
            )}

            {/* Children container with gesture handlers */}
            <Box
                {...( disabled ? {} : swipeHandlers )}
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    transform: `translateX(${swipeOffset}px)`,
                    transition: swipeOffset === 0 ? 'transform 0.2s ease' : 'none',
                    touchAction: 'pan-y',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

export default Swipeable;
