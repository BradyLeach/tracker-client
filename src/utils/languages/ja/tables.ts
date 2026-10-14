const tables = {
    order:
    {
        columns:
        {
            reference: "注文番号",
            ordered: "注文日",
            status: "ステータス",
            total: "合計",
        }
    },
    location:
    {
        columns:
        {
            name: "拠点",
            address: "住所",
            type: "種類",
            description: "説明",
        }
    },
    supply:
    {
        columns:
        {
            item: "品目",
            relationship: "関係",
            lastSupplied: "最終供給日",
        }
    },
    companies:
    {
        columns:
        {
            name: "会社",
            website: "ウェブサイト",
            taxIdentifier: "税番号",
            types: "提携種別",
            status: "ステータス",
        }
    },
    partnerships:
    {
        group:
        {
            company: "会社",
            partnerships: "取引関係",
        },
        columns:
        {
            company: "会社",
            partnershipType: "種別",
            contactName: "担当者名",
            contactEmail: "担当者メール",
            contactPhone: "担当者電話",
            rating: "評価",
            currentState: "ステータス",
        }
    }
} as const;

export default tables;
