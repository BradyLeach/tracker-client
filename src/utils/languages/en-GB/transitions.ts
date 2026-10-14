/**
 * Transition Translations
 *
 * Keyed by the snake_case `label`, which is the stable identifier — the same contract the
 * type catalogs and states use. These are bootstrapped, never user-created, so the set is
 * finite and changes only when the seed does.
 *
 * Labels are identifiers, never display text — a missing key must surface as a missing key,
 * not fall back to the raw label.
 */
const transitions = {
    activate: "Activate",
    approve: "Approve",
    archive: "Archive",
    cancel: "Cancel",
    close: "Close",
    close_short: "Close Short",
    consume: "Consume",
    deactivate: "Deactivate",
    enter: "Enter",
    enter_prospect: "Enter Prospect",
    expect_delivery: "Expect Delivery",
    expect_more_deliveries: "Expect More Deliveries",
    mark_expired_open: "Mark Expired (Open)",
    mark_expired_verified: "Mark Expired (Verified)",
    open_container: "Open Container",
    place_on_hold: "Place On Hold",
    place_order: "Place Order",
    receive_all: "Receive All",
    receive_goods: "Receive Goods",
    receive_partial: "Receive Partial",
    reject: "Reject",
    reopen: "Reopen",
    resume_partnership: "Resume Partnership",
    retire_partnership: "Retire Partnership",
    return_to_active: "Return to Active",
    revive_partnership: "Revive Partnership",
    start_evaluation: "Start Evaluation",
    terminate: "Terminate",
    trigger_review: "Trigger Review",
    verify: "Verify",
} as const;

export default transitions;
