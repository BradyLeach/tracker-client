/**
 * System Type Translations
 *
 * Mirrors the GET /system/types payload: one block per catalog, named by the
 * catalog's model and keyed by the type's snake_case `label`.
 *
 * Resolve an entity's `...TypeId` through typeRegistry to get the label, then
 * translate it here. Labels are identifiers, never display text — a missing key
 * must surface as a missing key, not fall back to the raw label.
 */
const types = {
    addressType:
    {
        primary: "Primary",
        billing: "Billing",
        shipping: "Shipping",
        mailing: "Mailing",
        registered: "Registered",
        physical: "Physical",
        postal: "Postal",
        pickup: "Pickup",
        delivery: "Delivery",
        return: "Return",
        other: "Other",
    },
    channel:
    {
        viral_marketing: "Viral Marketing",
        public_relations: "Public Relations",
        unconventional_pr: "Unconventional PR",
        search_engine_marketing: "Search Engine Marketing",
        social_and_display_ads: "Social and Display Ads",
        offline_ads: "Offline Ads",
        search_engine_optimization: "Search Engine Optimization",
        content_marketing: "Content Marketing",
        email_marketing: "Email Marketing",
        engineering_as_marketing: "Engineering as Marketing",
        targeting_blogs: "Targeting Blogs",
        business_development: "Business Development",
        sales: "Sales",
        affiliate_programs: "Affiliate Programs",
        existing_platforms: "Existing Platforms",
        trade_shows: "Trade Shows",
        offline_events: "Offline Events",
        speaking_engagements: "Speaking Engagements",
        community_building: "Community Building",
    },
    locationType:
    {
        warehouse: "Warehouse",
        office: "Office",
        manufacturing: "Manufacturing",
        pickup: "Pickup",
        retail: "Retail",
        market: "Market",
        other: "Other",
    },
    partnershipType:
    {
        supplier: "Supplier",
        stockist: "Stockist",
        service_provider: "Service Provider",
        distributor: "Distributor",
        manufacturer: "Manufacturer",
        consultant: "Consultant",
        contractor: "Contractor",
        wholesaler: "Wholesaler",
        retailer: "Retailer",
        logistics: "Logistics",
        marketing: "Marketing",
        technology: "Technology",
    },
} as const;

export default types;
