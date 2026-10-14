# Theme System

## File roles

| File | Role |
|---|---|
| `src/theme/DefaultColors.tsx` | Complete Stone light/dark palettes and semantic tokens |
| `src/theme/Theme.tsx` | Palette lookup, defaults, theme compilation, and component overrides |
| `src/theme/Components.tsx` | Component overrides using the compiled theme |
| `src/theme/Typography.tsx` | Typography definitions |
| `src/theme/Shadows.tsx` | Light/dark shadow definitions |
| `src/theme/types.ts` | Custom theme and palette type extensions |
| `config/modules/ui.ts` | Default mode, theme name, direction, and shape settings |

The supported name is `STONE_THEME`, declared in `src/core/utils/constants.ts`.
`Theme.tsx` maps it to the two palettes. Unknown persisted names fall back to Stone.
There are no separate LightThemeColors, DarkThemeColors, or ThemeColors files.

## Theme compilation

`BuildTheme` reads defaults through `getConfig()`. Explicit build options override those
fallbacks. The name selects a palette pair; mode selects its light or dark member and shadows.

Compilation uses this merge order, with later entries winning:

```ts
merge({}, baseMode, baseTheme, locales, { direction })
```

`baseMode` supplies mode, border radius, shadows, and typography. `baseTheme` is the
complete selected palette from `DefaultColors.tsx`. `locales` is the imported MUI locale
namespace. The final direction overrides the palette's direction.

After `createTheme`, `components(compiledTheme)` supplies component overrides. Those
can reference the resolved palette and tokens.

## Runtime preferences

`src/core/context/theme/Theme.context.tsx` initializes mode, direction, and theme name
from `preferenceStorage`, falling back to configuration. Setters update state and storage.
`getThemeState()` exposes a frozen snapshot for non-React consumers; `getThemeSetters()`
exposes setters for hydration.

| Storage key | Value |
|---|---|
| `theme:mode` | `light` or `dark` |
| `theme:direction` | `ltr` or `rtl` |
| `theme:name` | Theme name, currently `STONE_THEME` |

`src/core/context/theme/theme.hydrator.ts` applies supplied server preferences:

- Authenticated hydration overwrites the corresponding local values.
- Unauthenticated hydration applies a value only when its storage key is absent.
- Missing server fields leave the corresponding setting unchanged.

Defaults in `config/modules/ui.ts` are dark mode and Stone. Runtime precedence is supplied
authenticated server preferences, then local preferences, then configuration defaults.
`AppProviders` builds the theme from context mode, theme name, and direction.

## Theme control

`src/components/modals/theme/ThemeModal.tsx` exposes a light/dark switch. It calls
`preferencesOrchestrator.updateTheme` with the new mode and current theme name.
It does not render a color-theme picker or a list of palette swatches.

## Styling contract

Use semantic theme tokens instead of raw color literals in components. The palette includes
status colors, neutral structure, `iconTile.bg`, and `tag.inactiveText` in both modes.
Define new tokens in the light and dark palettes and extend the theme types as needed.

The UI import stack is documented in [LAYER-ARCHITECTURE.md](LAYER-ARCHITECTURE.md)
and the repository's `CLAUDE.md` files. Theme internals own direct MUI theme imports.
