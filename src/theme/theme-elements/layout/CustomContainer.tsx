
import { Container, type ContainerProps } from '@mui/material';

/**
 * CustomContainer - Theme-element wrapper for MUI Container
 *
 * Provides decoupled Container primitive for page width constraints.
 * Currently a passthrough wrapper - customize here for app-wide Container behavior.
 */
const CustomContainer = ( props: ContainerProps ) => <Container {...props} />;

export default CustomContainer;
