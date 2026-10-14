/**
 * State Translations
 *
 * Keyed by the state's snake_case `label`, which is the stable identifier — the same
 * contract the type catalogs use. States are bootstrapped, never user-created, so this set
 * is finite and changes only when the seed does.
 *
 * Resolve an entity's `currentStateGraphStateId` through stateRegistry to get the state,
 * then translate its label here. Labels are identifiers, never display text — a missing key
 * must surface as a missing key, not fall back to the raw label.
 */
const states = {
    active: "Active",
    archived: "Archived",
    awaiting_delivery: "Awaiting Delivery",
    awaiting_verification: "Awaiting Verification",
    cancelled: "Cancelled",
    closed: "Closed",
    closed_short: "Closed Short",
    consumed: "Consumed",
    evaluation: "Evaluation",
    expired: "Expired",
    in_review: "In Review",
    inactive: "Inactive",
    on_hold: "On Hold",
    open: "Open",
    ordered: "Ordered",
    partially_received: "Partially Received",
    pending: "Pending",
    planned: "Planned",
    prospect: "Prospect",
    received: "Received",
    rejected: "Rejected",
    reopened: "Reopened",
    retired: "Retired",
    returned: "Returned",
    terminated: "Terminated",
    verified: "Verified",
} as const;

export default states;
