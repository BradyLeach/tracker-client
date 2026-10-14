const forms =
    {
        login:
        {
            rememberMe: "30日間記憶する",
            forgotPassword: "パスワードをお忘れですか？",
            loginButton: "ログイン",
            googleButton: "Googleでログイン",
            fields:
            {
                email: "メールアドレス",
                emailPlaceholder: "メールアドレスを入力",
                password: "パスワード",
                passwordPlaceholder: "安全なパスワードを選択"
            }
        },
        provideEmail:
        {
            title: "メールアドレス入力",
            subtitle: "確認を続行するにはメールアドレスを入力してください",
            fields:
            {
                email: "メールアドレス",
                emailPlaceholder: "メールアドレスを入力"
            }
        },
        provideCode:
        {
            title: "確認コードを入力",
            subtitle: "確認リンクを送信しました",
            fields:
            {
                code: "確認コード",
                codePlaceholder: "000000"
            }
        },
        registration:
        {
            registerButton: "登録",
            title: "アカウント作成",
            subtitle: "登録フォーム",
            sections:
            {
                personalDetails: "個人情報",
                personalSubtitle: "個人情報を入力してください",
                profileDetails: "プロフィール詳細",
                accessDetails: "アクセス詳細",
                legalDetails: "法的詳細"
            },
            fields:
            {
                firstname: "名",
                firstnamePlaceholder: "名を入力",
                lastname: "姓",
                lastnamePlaceholder: "姓を入力",
                email: "メールアドレス",
                emailPlaceholder: "メールアドレスを入力",
                password: "パスワード",
                passwordPlaceholder: "安全なパスワードを選択",
                passwordConfirm: "パスワード確認",
                passwordConfirmPlaceholder: "パスワードを確認",
                handle: "ハンドル",
                handlePlaceholder: "@ハンドルを選択",
                name: "表示名",
                namePlaceholder: "表示名を選択",
                sex: "生まれたときの性別",
                sexPlaceholder: "性別を選択",
                height: "身長（cm）",
                heightPlaceholder: "身長を選択",
                dob: "生年月日",
                dobPlaceholder: "生年月日を選択",
                acknowledgedTerms: "同意します ",
                acknowledgedTermsLink: "利用規約に同意します。",
                acknowledgedAge: "入力した生年月日が正しいことを確認します。",
                acknowledgedAgePlaceholder: "入力した年齢が正確であることを確認します。"
            },
            options:
            {
                sexMale: "男性",
                sexFemale: "女性",
                sexOther: "その他"
            },
            footer:
            {
                prefaceText: "既にアカウントをお持ちですか？",
                linkText: "ログイン"
            }
        },
        identity:
        {
            sections:
            {
                status: "ステータス",
                personalDetails: "個人情報",
                contactDetails: "連絡先情報"
            },
            fields:
            {
                email: "メールアドレス",
                emailPlaceholder: "メールアドレスを入力",
                recoveryEmail: "リカバリーメール",
                recoveryEmailPlaceholder: "リカバリーメールアドレスを入力",
                firstname: "名",
                firstnamePlaceholder: "名を入力",
                lastname: "姓",
                lastnamePlaceholder: "姓を入力",
                dob: "生年月日",
                dobPlaceholder: "生年月日を選択"
            }
        },
        company:
        {
            editTitle: "会社を編集",
            fields:
            {
                name: "会社名",
                namePlaceholder: "会社名を入力",
                contactEmail: "連絡先メール",
                contactEmailPlaceholder: "連絡先メールを入力",
                phoneNumber: "電話番号",
                phoneNumberPlaceholder: "電話番号を入力",
                websiteUrl: "ウェブサイト",
                websiteUrlPlaceholder: "ウェブサイトのアドレスを入力",
                taxIdentifierType: "税番号の種類",
                taxIdentifierTypePlaceholder: "税番号の種類を選択",
                taxIdentifier: "税番号",
                taxIdentifierPlaceholder: "税番号を入力"
            },
            options:
            {
                abn: "ABN",
                ein: "EIN",
                vat: "VAT",
                gst: "GST",
                company_number: "会社番号"
            }
        },
        partnership:
        {
            title: "パートナーシップを追加",
            editTitle: "パートナーシップを編集",
            submitButton: "パートナーシップを追加",
            fields:
            {
                partnershipTypeId: "パートナーシップタイプ",
                partnershipTypeIdPlaceholder: "タイプを選択",
                contactName: "担当者名",
                contactNamePlaceholder: "担当者名を入力",
                contactEmail: "担当者メール",
                contactEmailPlaceholder: "担当者メールを入力",
                contactPhone: "担当者電話",
                contactPhonePlaceholder: "担当者電話番号を入力",
                rating: "評価",
                ratingPlaceholder: "1 ～ 5"
            }
        },
        location:
        {
            title: "拠点を追加",
            editTitle: "拠点を編集",
            submitButton: "拠点を追加",
            fields:
            {
                companyId: "会社",
                companyIdPlaceholder: "会社を選択",
                label: "名称",
                labelPlaceholder: "拠点名を入力",
                locationTypeId: "拠点の種類",
                locationTypeIdPlaceholder: "種類を選択",
                description: "説明",
                descriptionPlaceholder: "説明を入力"
            }
        },
        address:
        {
            fields:
            {
                line1: "住所1",
                line1Placeholder: "番地・通り名を入力",
                line2: "住所2",
                line2Placeholder: "建物名・部屋番号(任意)",
                city: "市区町村",
                cityPlaceholder: "市区町村を入力",
                postalCode: "郵便番号",
                postalCodePlaceholder: "郵便番号を入力",
                countryId: "国",
                countryIdPlaceholder: "国を選択"
            }
        },
        locationAddress:
        {
            fields:
            {
                addressTypeId: "住所の種類",
                addressTypeIdPlaceholder: "住所の種類を選択"
            }
        },
        shared:
        {
            validation:
            {
                required: "必須",
                optional: "任意"
            }
        }
    } as const;

export default forms;
