/**
 * Collection Translations
 *
 * Chrome for the shared collection controls — toolbar and pagination. Sits
 * beside `tables` rather than under a page, because any page can use them.
 */
const collection =
    {
        toolbar:
        {
            filter: "Filter",
            sort: "Sort",
            sortBy: "Sort",
            clearSearch: "Clear search",
            search: "Search",
        },
        pagination:
        {
            empty: "No results",
            of: "of",
        },
        noMatches: "Nothing matches this search or filter",
        view:
        {
            list: "List",
            map: "Map",
            table: "Table",
            card: "Cards",
        }
    } as const;

export default collection;
