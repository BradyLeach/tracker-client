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
    active: "有効",
    archived: "アーカイブ済み",
    awaiting_delivery: "配送待ち",
    awaiting_verification: "確認待ち",
    cancelled: "キャンセル済み",
    closed: "完了",
    closed_short: "一部未達で完了",
    consumed: "消費済み",
    evaluation: "評価中",
    expired: "期限切れ",
    in_review: "レビュー中",
    inactive: "無効",
    on_hold: "保留中",
    open: "進行中",
    ordered: "発注済み",
    partially_received: "一部入荷",
    pending: "保留",
    planned: "計画中",
    prospect: "見込み",
    received: "入荷済み",
    rejected: "却下",
    reopened: "再開",
    retired: "廃止",
    returned: "返品",
    terminated: "終了",
    verified: "確認済み",
} as const;

export default states;
