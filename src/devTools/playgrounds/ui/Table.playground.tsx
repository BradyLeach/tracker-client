import { Box, Typography, Card } from '@/components/ui';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@/components/ui';

// ─── Fixture data ──────────────────────────────────────────────────────────────

const FIXTURE_ROWS = [
    { id: '1', name: 'Shea Butter', batch: 'SB-2025-001', totalMg: 5_000_000, availableMg: 3_200_000, costCents: 4500 },
    { id: '2', name: 'Coconut Oil', batch: 'CO-2025-007', totalMg: 10_000_000, availableMg: 8_750_000, costCents: 3200 },
    { id: '3', name: 'Lye (NaOH)', batch: 'LY-2025-003', totalMg: 2_000_000, availableMg: 1_800_000, costCents: 1800 },
    { id: '4', name: 'Lavender EO', batch: 'LA-2025-012', totalMg: 500_000, availableMg: 420_000, costCents: 6200 },
    { id: '5', name: 'Castor Oil', batch: 'CA-2025-002', totalMg: 3_000_000, availableMg: 2_100_000, costCents: 2400 },
    { id: '6', name: 'Palm Oil', batch: 'PA-2025-004', totalMg: 8_000_000, availableMg: 6_500_000, costCents: 5100 },
    { id: '7', name: 'Sweet Almond Oil', batch: 'SA-2025-009', totalMg: 1_500_000, availableMg: 900_000, costCents: 7800 },
    { id: '8', name: 'Titanium Dioxide', batch: 'TD-2025-001', totalMg: 200_000, availableMg: 180_000, costCents: 1200 },
];

function formatMg( mg: number )
{
    return `${( mg / 1000 ).toFixed( 0 )} g`;
}

function formatCents( cents: number )
{
    return `$${( cents / 100 ).toFixed( 2 )}`;
}

// ─── Playground ───────────────────────────────────────────────────────────────

export function TablePlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>Table Primitives</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sticky header (maxHeight 320px) · hover rows
            </Typography>

            <Card sx={{ p: 0 }}>
                <TableContainer sx={{ maxHeight: 320 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Batch</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell align="right">Available</TableCell>
                                <TableCell align="right">Cost</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {FIXTURE_ROWS.map( row => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.batch}</TableCell>
                                    <TableCell align="right">{formatMg( row.totalMg )}</TableCell>
                                    <TableCell align="right">{formatMg( row.availableMg )}</TableCell>
                                    <TableCell align="right">{formatCents( row.costCents )}</TableCell>
                                </TableRow>
                            ) )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}
