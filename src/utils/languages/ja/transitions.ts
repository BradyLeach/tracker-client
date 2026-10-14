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
    activate: "有効化",
    approve: "承認",
    archive: "アーカイブ",
    cancel: "キャンセル",
    close: "完了",
    close_short: "一部未達で完了",
    consume: "消費",
    deactivate: "無効化",
    enter: "開始",
    enter_prospect: "見込みとして開始",
    expect_delivery: "配送予定",
    expect_more_deliveries: "追加配送予定",
    mark_expired_open: "期限切れ（開封済み）",
    mark_expired_verified: "期限切れ（確認済み）",
    open_container: "開封",
    place_on_hold: "保留にする",
    place_order: "発注",
    receive_all: "全数入荷",
    receive_goods: "入荷",
    receive_partial: "一部入荷",
    reject: "却下",
    reopen: "再開",
    resume_partnership: "パートナーシップ再開",
    retire_partnership: "パートナーシップ廃止",
    return_to_active: "有効に戻す",
    revive_partnership: "パートナーシップ復活",
    start_evaluation: "評価開始",
    terminate: "終了",
    trigger_review: "レビュー開始",
    verify: "確認",
} as const;

export default transitions;
