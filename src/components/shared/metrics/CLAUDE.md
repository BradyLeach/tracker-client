See also: ../../CLAUDE.md

## Metrics are injectable, never page-specific

A metric (summary number, chart, KPI) is a standalone component, like a Power BI widget. "Total
Partners" belongs on a dashboard, a report, and the partners list alike — defining it inside
`PagePartners` couples it to one page and kills the reuse that is the whole point.

- Metrics are injected into the `metrics` slot of `CollectionView`.
- Never define metric layout inside a page component.
- Never add metric strings to `pages.{domain}.*` translations.

## `direction` and `sentiment` are independent

`direction` (`'up' | 'down'`) drives the arrow. `sentiment`
(`'positive' | 'negative' | 'neutral'`) drives the badge colour. **Never conflate them** — up is
not always good. "Overdue Orders up 7" is an up arrow with negative sentiment.

## Variants

`'default' | 'compact' | 'minimal' | 'highlight' | 'large'`. Padding and value sizes are in
`CountMetric.tsx`; `highlight` adds a 3px left accent bar in the sentiment colour, `minimal` is
inline-flex with no background or border.

`GraphMetric` and `PieMetric` are planned and follow the same injection contract.
