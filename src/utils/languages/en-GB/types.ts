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
