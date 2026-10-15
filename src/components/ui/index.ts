/**
 * UI Components - App UI layer master export
 *
 * Stable import surface for all UI primitives.
 * Never import MUI directly - always use these wrappers.
 *
 * Organized by category:
 * - layout: Box, Stack, Grid, Container, Divider
 * - typography: Typography
 * - surfaces: Card
 * - inputs: Button, Link, InputAdornment, FormHelperText, IconButton
 * - navigation: AppBar, Toolbar, Tab, Tabs, TabPanel, MenuItem, Menu, Drawer
 * - data-display: Avatar, Badge, BadgeAvatar, Skeleton, Tooltip
 * - interactions: Swipeable
 * - svg-canvas: SvgCanvas, SvgLayer
 */

// Interactions
export { Swipeable, type SwipeableProps } from './interactions';

// Layout
export { Box, Stack, Grid, Container, Divider } from './layout';

// Typography
export { Typography, type TypographyProps } from './typography';

// Surfaces
export
{
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Dialog,
    Paper,
    Popover,
    type CardHeaderProps,
    type CardContentProps,
    type CardActionsProps,
    type DialogProps,
    type PaperProps,
    type PopoverProps
} from './surfaces';

// Inputs
export
{
    Button,
    ResponsiveButton,
    ButtonGroup,
    Link,
    InputAdornment,
    FormHelperText,
    Switch,
    IconButton,
    FormControlLabel,
    type ResponsiveButtonProps
} from './inputs';

// Navigation
export
{
    AppBar,
    Toolbar,
    Pagination,
    Tab,
    Tabs,
    TabPanel,
    type TabPanelProps,
    MenuItem,
    Menu,
    MenuList,
    type MenuListProps,
    MenuRow,
    type MenuRowProps,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    type ListProps,
    type ListItemButtonProps,
    type ListItemTextProps,
    Stepper,
    Step,
    StepLabel
} from './navigation';

// Data Display
export
{
    Avatar,
    Badge,
    BadgeAvatar,
    Chip,
    Rating,
    Skeleton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    EmptyState,
} from './data-display';
export type {
    ChipProps,
    RatingProps,
    EmptyStateProps,
    EmptyStateAction,
    TableProps,
    TableBodyProps,
    TableCellProps,
    TableContainerProps,
    TableHeadProps,
    TableRowProps,
} from './data-display';

// Forms
export
{
    TextField,
    FormLabel,
    Checkbox,
    Select,
    Slider,
    DatePicker,
    Autocomplete,
    type AutocompleteProps,
    type AutocompleteOption,
    TagsInput,
    type TagsInputProps,
} from './forms';

// SVG Canvas
export { SvgCanvas, SvgLayer, type SvgCanvasProps, type SvgLayerProps } from './svg-canvas';

// Charts
export { SparkLine, type SparkLineProps } from './charts/SparkLine';
export { LineChart, ChartsReferenceLine, type LineChartProps, type ChartsReferenceLineProps } from './charts/LineChart';

// Icons
export { IconRenderer } from './icons/Icon';
export type { IconKey } from '@/config/icons.config';

// Theme
export { useTheme, alpha } from '@mui/material/styles';
export { useMediaQuery } from '@mui/material';
export type { Theme } from '@mui/material/styles';

// Types
export type { AlertColor } from '@mui/material';
