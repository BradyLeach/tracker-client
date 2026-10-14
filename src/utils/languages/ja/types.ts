/**
 * System Type Translations (ja)
 *
 * Mirrors the GET /system/types payload, keyed by the type's snake_case `label`.
 * Categories not yet translated fall back to en-GB.
 */
const types = {
    partnershipType:
    {
        supplier: "サプライヤー",
        stockist: "在庫業者",
        service_provider: "サービス提供者",
        distributor: "販売代理店",
        manufacturer: "製造業者",
        consultant: "コンサルタント",
        contractor: "請負業者",
        wholesaler: "卸売業者",
        retailer: "小売業者",
        logistics: "物流",
        marketing: "マーケティング",
        technology: "テクノロジー",
    },
    addressType:
    {
        primary: "主要",
        billing: "請求先",
        shipping: "配送先",
        mailing: "郵送先",
        registered: "登記上の住所",
        physical: "所在地",
        postal: "私書箱",
        pickup: "集荷先",
        delivery: "配達先",
        return: "返品先",
        other: "その他",
    },
    locationType:
    {
        warehouse: "倉庫",
        office: "事務所",
        manufacturing: "製造拠点",
        pickup: "集荷所",
        retail: "店舗",
        market: "市場",
        other: "その他",
    }
} as const;

export default types;
