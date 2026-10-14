const messages = {
    auth:
    {
        invalidCredentials: "メールアドレスまたはパスワードが正しくありません"
    },
    verification:
    {
        invalid: "入力された{{field}}が無効です。",
        expired: "入力された{{field}}の有効期限が切れています。",
        maxAttempts: "確認の試行回数が上限に達しました。"
    },
    resource:
    {
        noexist: "{{field}}が見つかりませんでした。",
        exists: "{{field}}は既に存在します。",
        invalid: "{{field}}が無効です。",
        unauthorized: "このリソースへのアクセス権限がありません。"
    },
    permission:
    {
        denied: "この操作を実行する権限がありません。",
        tooManyRequests: "リクエストが多すぎます。しばらくしてから再度お試しください。"
    },
    info:
    {
        noAddressOnFile: "住所が登録されていません。",
        noMembersFound: "メンバーが見つかりませんでした。"
    },
    error:
    {
        unknown: "不明なエラーが発生しました。",
        confirmPassword: "パスワードが一致しません。",
        passwordWeak: "パスワードが脆弱です。より強力なパスワードを選択してください。",
        tokenExpired: "セッションの有効期限が切れました。",
        tokenInvalid: "無効なトークンです。再度お試しください。",
        networkError: "ネットワークエラー。接続を確認してください。",
        fileUpload: "ファイルのアップロードに失敗しました。再度お試しください。",
        mixed:
        {
            default: "無効な値 {{value}}",
            required: "この項目は必須です。",
            notType: "有効な{{type}}である必要があります。",
            notNull: "nullにすることはできません。",
            oneOf: "{{values}}のいずれかである必要があります",
            isJson: "有効なJSONである必要があります。"
        },
        number:
        {
            min: "最小値は{{min}}です。",
            max: "最大値は{{max}}です。",
            positive: "正の数である必要があります。",
            integer: "整数である必要があります。",
            moreThan: "{{more}}より大きい値である必要があります。"
        },
        string:
        {
            min: "最小{{min}}文字必要です。",
            max: "最大{{max}}文字までです。",
            handle: "@ハンドルには英数字とアンダースコアのみ使用できます。",
            password: "パスワードには大文字、小文字、数字、記号を含める必要があります。",
            matches: "必要な形式と一致しません。",
            email: "有効なメールアドレスを入力してください。",
            url: "有効なURLを入力してください。",
            uuid: "有効なUUIDである必要があります。",
            date: "有効な日付（UTC ISO 8601形式）である必要があります。",
            verificationCode: "{{field}}は正確に6桁である必要があります",
            notUnique: "{{field}}は既に使用されています。"

        },
        date:
        {
            min: "{{min}}より後である必要があります。",
            max: "{{max}}より前である必要があります。",
            format: "有効な日付である必要があります。",
            utc: "有効なUTC日付である必要があります。",
            validDob:
            {
                tooYoung: "{{minAge}}歳以上である必要があります。",
                tooOld: "{{maxAge}}歳未満である必要があります。"
            }
        },
        array:
        {
            required: "少なくとも1つの項目が必要です。",
            min: "最小{{min}}項目必要です。",
            max: "最大{{max}}項目までです。"
        },
        boolean:
        {
            notType: "trueまたはfalseである必要があります。",
            mustAccept: "{{field}}に同意する必要があります。",
            mustConfirm: "続行するには確認が必要です。"
        }
    }
} as const;

export default messages;
