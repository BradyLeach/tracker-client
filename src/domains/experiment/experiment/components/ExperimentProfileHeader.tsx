/**
 * ExperimentProfileHeader
 *
 * Who this experiment is and what can be done to it now. The actions follow its phase:
 * a draft is edited, started or abandoned; a running experiment is concluded or
 * abandoned; a finished one is read. Delete sits behind the menu in every phase.
 *
 * Presentational: the page owns the mutations and passes each action in.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, IconButton, IconRenderer, Menu, MenuItem, Tooltip, Typography } from '@/components/ui';
import { StatusChip } from '@/components/shared/status';
import { stateRegistry } from '@/core/models/StateRegistry';
import { experimentPhase } from '../orchestrators/experiments.orchestrator';
import type { Experiment } from '../types/experiment.types';

export interface ExperimentProfileHeaderProps
{
    experiment: Experiment;
    /** An action in flight disables the others, so two lifecycle moves cannot race. */
    isPending?: boolean;
    onEdit: () => void;
    onStart: () => void;
    onConclude: () => void;
    onAbandon: () => void;
    onDelete: () => void;
}

export function ExperimentProfileHeader( {
    experiment, isPending, onEdit, onStart, onConclude, onAbandon, onDelete,
}: ExperimentProfileHeaderProps )
{
    const { t } = useTranslation();
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );

    const phase = experimentPhase( experiment );
    const state = stateRegistry.getState( experiment.currentStateGraphStateId ?? '' );

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                p: 3,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'border.base',
                borderRadius: 1,
            }}
        >
            <IconRenderer iconKey="flask" size={28} />

            <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="h5">{experiment.title}</Typography>
                <Box sx={{ mt: 0.5 }}>
                    <StatusChip
                        stateName={state && t( `states.${state.label}` )}
                        stateCategoryColour={state?.stateCategory?.color}
                    />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {phase === 'draft' && (
                    <>
                        <Button variant="outlined" size="small" disabled={isPending} onClick={onEdit}>
                            {t( 'pages.experiment.design.editButton' )}
                        </Button>
                        <Button variant="contained" size="small" disabled={isPending} onClick={onStart}>
                            {t( 'pages.experiment.actions.start' )}
                        </Button>
                    </>
                )}

                {phase === 'running' && (
                    <Button variant="contained" size="small" disabled={isPending} onClick={onConclude}>
                        {t( 'pages.experiment.actions.conclude' )}
                    </Button>
                )}

                {( phase === 'draft' || phase === 'running' ) && (
                    <Button variant="text" size="small" color="error" disabled={isPending} onClick={onAbandon}>
                        {t( 'pages.experiment.actions.abandon' )}
                    </Button>
                )}

                <Tooltip title={t( 'shared.buttons.moreActions' )}>
                    <IconButton
                        size="small"
                        aria-label={t( 'shared.buttons.moreActions' )}
                        aria-haspopup="true"
                        aria-expanded={menuAnchor ? 'true' : undefined}
                        onClick={( event ) => setMenuAnchor( event.currentTarget )}
                    >
                        <IconRenderer iconKey="dotsVertical" size={16} />
                    </IconButton>
                </Tooltip>
                <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor( null )}>
                    <MenuItem
                        onClick={() =>
                        {
                            setMenuAnchor( null );
                            onDelete();
                        }}
                        sx={{ color: 'danger.main' }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconRenderer iconKey="trash" size={16} />
                            {t( 'shared.buttons.delete' )}
                        </Box>
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
}
