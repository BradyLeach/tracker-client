See also: ../../CLAUDE.md — the absolute rules, including the three-layer import stack.

**Before writing or changing any component, read its playground in `../devTools/`.** Every
component is built there first with its real config visible. See `../devTools/CLAUDE.md` for the
index. If a playground exists, that file is the pattern — do not invent a second way.

## Layer map

- `ui/` — raw MUI wrappers only. No logic, no i18n. Every third-party library gets a wrapper here
  before any shared or domain code may import it.
- `shared/` — logic-bearing UI atoms (`StatusChip`, `Label`).
- `forms/` — config-driven form layer (factory, renderers, hooks).
- `tables/` — config-driven table layer (`TableColumnFactory`, `DataTable`, `GroupedDataTable`,
  cell renderers).
- `container/` — page scaffolds: `Page`, `NavbarLayout`, `SidePanel`, `DetailPanelHeader`.
- `navbar/` — navigation layer.

## Navigation must render real anchors

A link that takes the user to a route uses `component={RouterLink}` with a `to` prop, so it emits
a real `<a href>` and the browser's right-click "open in new tab" works. Never a bare `Button`
with `onClick={() => navigate(...)}` — that is JS-only, produces no `href`, and silently removes
the option. Applies to `SidebarMenu`, `SidebarMenuTabs`, and every nav link component.

Action buttons that open a dialog, submit a form, or trigger a mutation have no URL and cannot
support this. That is correct and expected — the distinction is navigation versus action.

When reviewing nav components, check what element the MUI button actually renders.
