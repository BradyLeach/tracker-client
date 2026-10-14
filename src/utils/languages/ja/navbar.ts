const navbar = {
    brand: {
        text: "Tracker",
    },
    search: {
        label: "検索",
        placeholder: "何でも検索...",
        button: "検索",
    },
    actions: {
        notifications: "通知",
        profile: "プロフィールメニュー",
        mobileMenu: "メニュー",
    },
    profile: {
        title: "ユーザープロフィール",
        menu: {
            notifications: "通知",
            profile: "プロフィール",
            accountSettings: "アカウント設定",
            themeSettings: "テーマ設定",
            language: "言語",
            currency: "通貨",
            country: "国",
            switchProfile: "プロフィール切替",
            logout: "ログアウト",
        },
    },
    nav: {
        sections: {
            business: "ビジネス",
        },
    },
    drawer: {
        title: "ナビゲーション",
        home: "ホーム",
        partnerships: "パートナー",
        team: "チーム",
        close: "メニューを閉じる",
    },
} as const;

export default navbar;
