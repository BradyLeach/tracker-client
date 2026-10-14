const shared = {
    buttons:
    {
        login: "ログイン",
        logout: "ログアウト",
        continue: "続ける",
        save: "保存",
        cancel: "キャンセル",
        delete: "削除",
        remove: "削除する",
        moreActions: "その他の操作",
        refresh: "更新",
        edit: "編集",
        create: "作成",
        close: "閉じる",
        back: "戻る",
        next: "次へ",
        submit: "送信",
        verify: "確認",
    },
    status:
    {
        active: "有効",
        inactive: "無効",
        pending: "保留中",
        locked: "ロック済み",
        disabled: "無効"
    },
    verificationStatus:
    {
        unverified: "未確認",
        pending: "確認待ち",
        verified: "確認済み",
        expired: "確認期限切れ",
        rejected: "確認拒否",
        revoked: "確認取消"
    },
    labels:
    {
        verificationStatus: "認証ステータス",
        status: "アカウントステータス",
        addressLine1: "住所1",
        addressLine2: "住所2",
        city: "市区町村",
        state: "都道府県",
        postalCode: "郵便番号",
        country: "国",
        subdivision: "地区"
    },
    notProvided: "未提供",
    interactions:
    {
        loading: "読み込み中...",
        saving: "保存中...",
        success: "{{action}}しました",
        uploading: "アップロード中...",
        processing: "処理中..."
    }
} as const;

export default shared;
