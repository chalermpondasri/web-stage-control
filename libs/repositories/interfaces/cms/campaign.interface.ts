export interface CampaignCMS {
    id: number
    name: string
    quotas: number
    reusable: boolean
    codeAmounts: number
    coinPerVoucher: number
    startDate?: Date
    endDate?: Date
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date
}
