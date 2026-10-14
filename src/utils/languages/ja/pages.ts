const pages =
    {
        login:
        {
            title: "Trackerへようこそ",
            subtitle: "メールアドレスとパスワードを入力してログインしてください。",
            needAccount: "アカウントをお持ちでないですか？",
            register: "アカウントを作成"
        },
        registration:
        {
            title: "アカウント作成",
            subtitle: "コミュニティに参加",
            alreadyHaveAccount: "既にアカウントをお持ちですか？"
        },
        verifyEmail:
        {
            dialogs:
            {
                verificationSuccess: "おめでとうございます。メールアドレスが確認されました。",
                resendSuccess: "新しい確認コードが登録済みメールアドレスに送信されました。"
            },
            provideCode:
            {
                title: "メールを確認してください",
                subtitle: "確認リンクを送信しました",
                clickToResendText: "メールが届きませんでしたか？",
                clickToResendLink: "再送信する"
            },
            provideEmail:
            {
                title: "メールアドレスを入力",
                subtitle: "確認を続行するにはメールアドレスを入力してください",
                clickToResendText: "メールが届きませんでしたか？",
                clickToResendLink: "再送信する"
            }
        },
        landing:
        {
            title: "より良い製品を。より速いスケールを。",
            subtitle: "石鹸とクラフトビジネスのレシピ、在庫、製造ランを管理"
        },
        userSettings:
        {
            title: "ユーザー設定",
            description: "個人設定を管理",
            tabs:
            {
                identity: "本人情報",
                notifications: "通知",
                security: "セキュリティ"
            },
            sections:
            {
                accountStatus: "アカウントステータス",
                security: "セキュリティ",
                securityDescription: "パスワードと認証設定を管理します。"
            },
            actions:
            {
                resetPassword: "パスワードをリセット",
                verifyRecoveryEmail: "リカバリーメールを確認"
            },
            placeholders:
            {
                notifications: "通知設定は近日公開予定です。",
                security: "セキュリティ設定は近日公開予定です。"
            }
        },
        accountSettings:
        {
            title: "アカウント設定",
            description: "アカウント、住所、チームメンバーを管理",
            sections:
            {
                overview: "概要",
                address: "住所",
                members: "メンバー",
                billing: "請求"
            },
            billing:
            {
                placeholder: "請求はStripeを通じて管理されます。設定は近日公開予定です。"
            }
        },
        partnerships:
        {
            title: "パートナー",
            description: "パートナー関係を表示・管理する",
            addButton: "パートナーを追加",
            searchPlaceholder: "会社を検索",
            emptyState:
            {
                headline: "パートナーがまだいません",
                subtext: "最初のサプライヤー、ベンダー、またはパートナーを追加して始めましょう",
                addButton: "パートナーを追加",
            },
            trash:
            {
                title: "パートナーのゴミ箱",
                description: "削除されたパートナー。復元するまで保持されます",
                searchPlaceholder: "ゴミ箱を検索",
                emptyState:
                {
                    headline: "ゴミ箱は空です",
                    subtext: "削除した会社は復元するまでここに保持されます",
                }
            }
        },
        company:
        {
            title: "会社",
            description: "会社プロフィール",
            overview: "会社の概要",
            editButton: "会社を編集",
            relationshipStatus: "取引関係: {{status}}",
            deleteConfirm:
            {
                title: "会社を削除しますか?",
                body: "{{name}} とそのパートナーシップはゴミ箱に移動されます。後で復元できます。"
            },
            hardDeleteConfirm:
            {
                title: "完全に削除しますか?",
                body: "{{name}} は完全に削除されます。この操作は元に戻せません。",
                bodyBulk: "{{count}} 社が完全に削除されます。この操作は元に戻せません。",
                progress: "{{total}} 件中 {{completed}} 件を削除中…"
            },
            section:
            {
                location: "拠点",
                partner: "パートナー",
                comment: "コメント"
            },
            location:
            {
                empty: "地図上の住所がありません",
                summary: "{{addressCount}} 件の住所 · {{locationCount}} 件の拠点",
                addButton: "拠点を追加",
                emptyState:
                {
                    headline: "拠点がまだありません",
                    subtext: "拠点を追加して、この会社の住所を整理しましょう。"
                },
                moreAddresses: "(他 {{count}} 件)",
                addresses: "住所",
                addAddressButton: "住所を追加",
                noAddresses: "住所が登録されていません",
                addressTitle: "住所",
                removeAddress: "住所を削除",
                removeAddressConfirm:
                {
                    title: "住所を削除しますか?",
                    body: "{{address}} はこの拠点から削除されます。"
                },
                deleteConfirm:
                {
                    title: "拠点を削除しますか?",
                    body: "{{name}} は完全に削除されます。この操作は元に戻せません。"
                }
            },
            partner:
            {
                addButton: "パートナーシップを追加",
                emptyState:
                {
                    headline: "パートナーシップがまだありません",
                    subtext: "パートナーシップを追加して、この会社の担当者を管理しましょう。"
                },
                deleteConfirm:
                {
                    title: "パートナーシップを削除しますか?",
                    body: "{{name}} とのパートナーシップは完全に削除されます。この操作は元に戻せません。"
                }
            },
        },
        error:
        {
            title: "うーん、何か問題が発生しました",
            subtitle: "これは恥ずかしいですね...",
            retry: "再試行",
            code: "エラーコード"
        }
    } as const;

export default pages;
