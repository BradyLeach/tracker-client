See also: ../components/CLAUDE.md, ../domains/CLAUDE.md

# This is the canonical reference for every component

**Read the playground before writing or changing any UI code.** Every component is built here
first, with its real config visible beside its rendered output. A playground shows the config
shape, the data shape, and the states the component already handles — so there is never a reason
to invent a new config, a new data shape, or a new component that already exists.

Read the playground for the thing you are touching. If a playground exists, that file *is* the
pattern; copy it. If the task is "swap component A for component B", both playgrounds already
show exactly how each is configured.

## Index

| Area | Playground |
|------|-----------|
| Tables | `tables/DataTable.playground.tsx`, `tables/GroupedDataTable.playground.tsx`, `ui/Table.playground.tsx`, `partnerships/PartnershipsTable.playground.tsx` |
| Cards | `company/CompanyCard.playground.tsx` |
| Dialogs and menus | `ui/Dialog.playground.tsx`, `ui/Menu.playground.tsx`, `ui/ConfigMenu.playground.tsx`, `communications/NotificationsModal.playground.tsx` |
| Forms | `forms/FormScaffold.playground.tsx` |
| Collection UI | `ui/CollectionToolbar.playground.tsx`, `ui/CountMetric.playground.tsx`, `ui/StatusChip.playground.tsx`, `ui/EmptyState.playground.tsx` |
| Containers and layout | `containers/AppHeader`, `containers/NavbarSidebarLayout`, `containers/NavRail`, `containers/DetailPanelHeader` |
| Navigation | `ui/SidebarMenu.playground.tsx` |
| Other UI | `ui/BadgeAvatar`, `ui/CommentThread`, `ui/IconButton`, `ui/Rating`, `ui/RealtimeTrace`, `ui/RichTextEditor`, `ui/LocationView`, `ui/MapView` |
| Rules | `rules/LimitRule.playground.tsx`, `rules/VerificationRule.playground.tsx` |
| Workflow | `workflow/StateGraphViewer.playground.tsx`, `svgCanvas/SvgCanvas.playground.tsx` |
| API | `api/PingTest.playground.tsx` |

## Shape of a playground

A playground imports the **real** domain config builder and mock data from `devTools/mocks/` —
never from domain code. `DataTable.playground.tsx` imports `buildPartnershipsTableConfig` and
`PARTNERSHIP_MOCKS`, then renders scenarios (with data, loading, empty) from them. Overrides
for demo purposes are made on top of the real config and commented as such.

`PlaygroundDataPreview` renders the driving data beside the output, so the expected shape is
visible without opening the source.

## Adding a component

New components are built here first, with config visible, before they are used in a domain.
A component that has no playground is not finished.
