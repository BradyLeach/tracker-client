/**
 * Collection Translations (ja)
 *
 * Chrome for the shared collection controls — toolbar and pagination. Sits
 * beside `tables` rather than under a page, because any page can use them.
 */
const collection =
    {
        toolbar:
        {
            filter: "絞り込み",
            sort: "並べ替え",
            sortBy: "並べ替え",
            clearSearch: "検索をクリア",
            search: "検索",
        },
        pagination:
        {
            empty: "結果がありません",
            of: "/",
        },
        noMatches: "この検索または絞り込みに一致する項目はありません",
        view:
        {
            list: "リスト",
            map: "地図",
            table: "テーブル",
            card: "カード",
        }
    } as const;

export default collection;
