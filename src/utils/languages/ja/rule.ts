const rule = {
    LIMIT:
    {
        block:
        {
            title: "{{service}}の上限に達しました",
            description: "{{max}}個の{{service}}のうち{{current}}個を作成しました。さらに作成するにはプランをアップグレードしてください。",
            action: "プランをアップグレード",
            program:
            {
                title: "プログラムの上限に達しました",
                description: "{{max}}個のプログラムのうち{{current}}個を作成しました。無制限にプログラムを作成するにはアップグレードしてください。",
                action: "プランをアップグレード"
            },
            participant:
            {
                title: "参加者の上限に達しました",
                description: "{{max}}人の参加者のうち{{current}}人を追加しました。さらに参加者を追加するにはアップグレードしてください。",
                action: "プランをアップグレード"
            }
        },
        warning:
        {
            title: "{{service}}の上限に近づいています",
            description: "残り{{remaining}}個の{{service}}（{{current}}/{{max}}）です。すぐにアップグレードを検討してください。",
            action: "閉じる",
            program:
            {
                title: "プログラムの上限に近づいています",
                description: "{{max}}個のプログラムのうち{{current}}個を作成しました。中断を避けるためアップグレードを検討してください。",
                action: "閉じる"
            }
        },
        generic:
        {
            title: "リソースの上限",
            description: "リソースの上限に達しました。プランをアップグレードしてください。",
            action: "プランをアップグレード"
        }
    },
    VERIFICATION:
    {
        block:
        {
            title: "確認が必要です",
            description: "この操作には確認が必要です。必要な確認手順を完了してください。",
            action: "今すぐ確認",
            age:
            {
                title: "年齢確認が必要です",
                description: "お住まいの地域で{{service}}を{{operation}}するには、{{minAge}}歳以上である必要があります。現在の年齢：{{actual}}。",
                action: "プロフィールを更新"
            },
            email:
            {
                title: "メールアドレスの確認が必要です",
                description: "{{service}}を{{operation}}するにはメールアドレスを確認してください。",
                action: "メールを確認"
            },
            identity:
            {
                title: "本人確認が必要です",
                description: "{{service}}を{{operation}}するには本人確認が必要です。現在の状態：{{identityVerificationStatus}}。",
                action: "本人確認"
            }
        },
        generic:
        {
            title: "確認が必要です",
            description: "この操作を完了するには確認が必要です。",
            action: "今すぐ確認"
        }
    },
    FEATURE:
    {
        block:
        {
            title: "プレミアム機能",
            description: "この機能はプレミアムプランでのみ利用可能です。",
            action: "今すぐアップグレード",
            program:
            {
                title: "プレミアム{{service}}機能",
                description: "高度な{{service}}機能はプレミアムプランでのみ利用可能です。無制限の可能性を解き放つためにアップグレードしてください。",
                action: "今すぐアップグレード"
            }
        },
        generic:
        {
            title: "プレミアム機能",
            description: "この機能にはプレミアムプランが必要です。",
            action: "今すぐアップグレード"
        }
    },
    COMPLIANCE:
    {
        block:
        {
            title: "操作が許可されていません",
            description: "コンプライアンス要件によりこの操作はブロックされています。",
            action: "詳細を確認",
            retention:
            {
                title: "データ保持ルール",
                description: "この{{service}}を{{operation}}できません - {{minRetentionDays}}日間保持する必要があります。現在のレコード期間：{{recordAge}}日。",
                action: "詳細を確認"
            },
            suspended:
            {
                title: "アカウントが停止されています",
                description: "アカウントが停止されました。サポートにお問い合わせください。",
                action: "サポートに連絡"
            }
        },
        generic:
        {
            title: "コンプライアンスブロック",
            description: "規制またはコンプライアンス要件によりこの操作はブロックされています。",
            action: "詳細を確認"
        }
    },
    generic:
    {
        title: "操作が制限されています",
        description: "現時点でこの操作を完了できません。サポートが必要な場合はお問い合わせください。",
        action: "閉じる"
    },
    actions:
    {
        upgrade: "プランをアップグレード",
        dismiss: "後で",
        close: "閉じる",
        verify: "今すぐ確認",
        learnMore: "詳細を確認",
        contactSupport: "サポートに連絡",
        updateProfile: "プロフィールを更新"
    }

} as const;

export default rule;
