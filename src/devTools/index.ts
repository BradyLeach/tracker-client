// DevTools pages are lazy-loaded directly by the router from './pages/*'.
// They are intentionally NOT re-exported here — doing so creates a barrel cycle
// (index → pages → index) and forces every playground into a single chunk.

//components
export { ComponentApiTest } from './playgrounds/api/PingApi';

// playgrounds
export { PagePing } from './playgrounds/api/PingTest.playground';
export { PageDialogPlayground } from './playgrounds/ui/Dialog.playground';
export { TablePlayground } from './playgrounds/ui/Table.playground';
export { PageFormPlayground } from './playgrounds/forms/FormScaffold.playground';
export { PageBadgeAvatarPlayground } from './playgrounds/ui/BadgeAvatar.playground';
export { PageIconButtonPlayground } from './playgrounds/ui/IconButton.playground';
export { RatingPlayground } from './playgrounds/ui/Rating.playground';
export { StatusChipPlayground } from './playgrounds/ui/StatusChip.playground';
export { CountMetricPlayground } from './playgrounds/ui/CountMetric.playground';
export { RealtimeTracePlayground } from './playgrounds/ui/RealtimeTrace.playground';
export { PageMenuPlayground } from './playgrounds/ui/Menu.playground';
export { PageConfigMenuPlayground } from './playgrounds/ui/ConfigMenu.playground';
export { PageSidebarMenuPlayground } from './playgrounds/ui/SidebarMenu.playground';

//Rule Playgrounds
export { PageRulePlayground } from './playgrounds/rules/PageRule';
export { VerificationRulePlayground } from './playgrounds/rules/VerificationRule.playground';
export { LimitRulePlayground } from './playgrounds/rules/LimitRule.playground';

// Communications Playgrounds
export { NotificationsModalPlayground } from './playgrounds/communications/NotificationsModal.playground';

// Container Playgrounds
export { PageNavbarSidebarLayoutPlayground } from './playgrounds/containers/NavbarSidebarLayout.playground';
export { PageNavRailPlayground } from './playgrounds/containers/NavRail.playground';
export { PageAppHeaderPlayground } from './playgrounds/containers/AppHeader.playground';

// SVG Canvas Playgrounds
export { PageSvgCanvasPlayground } from './playgrounds/svgCanvas/SvgCanvas.playground';

// Table Playgrounds
export { DataTablePlayground } from './playgrounds/tables/DataTable.playground';
export { GroupedDataTablePlayground } from './playgrounds/tables/GroupedDataTable.playground';

// Workflow Playgrounds
export { StateGraphViewerPlayground } from './playgrounds/workflow/StateGraphViewer.playground';
