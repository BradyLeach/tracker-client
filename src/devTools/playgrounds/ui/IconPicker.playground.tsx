/**
 * IconPicker Playground
 *
 * The icon picker as a controlled component: a trigger showing the current icon, opening
 * a grid of every offered icon grouped by category.
 *
 * What to check here:
 * - the trigger reads as the record's identity: its tile, then a chevron
 * - the grid opens focused on the current icon; arrows move one icon or one row,
 *   Home and End jump to the ends, Enter or Space chooses, Escape closes
 * - focus returns to the trigger after choosing or closing
 * - an empty, unknown or hidden value shows through the fallback and is never replaced
 *   until an icon is chosen
 *
 * Options come from the real registry, so this shows the set users will see.
 */

import { useState } from 'react';
import { Box, Typography } from '@/components/ui';
import { IconPicker } from '@/components/shared/iconPicker';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';
import type { IconKey } from '@/config/icons.config';

// ─── Scenarios ────────────────────────────────────────────────────────────────

interface Scenario
{
    name: string;
    initial?: string;
    disabled?: boolean;
}

const SCENARIOS: Scenario[] = [
    { name: 'A chosen icon', initial: 'building' },
    { name: 'No icon yet — shows the fallback', initial: undefined },
    { name: 'An unknown stored key — shows the fallback, kept until changed', initial: 'shopping-cart' },
    { name: 'A hidden interface icon — still displays, not offered in the grid', initial: 'chevronLeft' },
    { name: 'Disabled', initial: 'leaf', disabled: true },
];

const FALLBACK: IconKey = 'building';

// ─── Playground ───────────────────────────────────────────────────────────────

function ScenarioRow( { scenario }: { scenario: Scenario } )
{
    const [value, setValue] = useState<string | undefined>( scenario.initial );
    const [blurs, setBlurs] = useState( 0 );

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 1.5, borderBottom: 1, borderColor: 'border.faint' }}>
            <Box sx={{ width: 420 }}>
                <Typography variant="body2">{scenario.name}</Typography>
            </Box>
            <IconPicker
                value={value}
                onChange={setValue}
                onBlur={() => setBlurs( count => count + 1 )}
                fallback={FALLBACK}
                disabled={scenario.disabled}
            />
            <Typography variant="caption" color="text.secondary">
                value: {value ?? 'undefined'} · closed {blurs}×
            </Typography>
        </Box>
    );
}

export function IconPickerPlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>Icon picker</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                Controlled picker over the approved registry. Each row holds its own value; the
                fallback for every row is <code>{FALLBACK}</code>. Try it with the keyboard.
            </Typography>

            {SCENARIOS.map( scenario => <ScenarioRow key={scenario.name} scenario={scenario} /> )}

            <PlaygroundDataPreview
                title="Scenarios"
                caption="The stored value each row starts with."
                data={SCENARIOS}
            />
        </Box>
    );
}

export default IconPickerPlayground;
