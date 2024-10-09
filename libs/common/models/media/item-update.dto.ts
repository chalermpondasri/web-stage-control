export interface ItemUpdateDto {
    mediaId: number
    title: string
    artist?: string
    duration: number
    coverImage?: string

    totalPoint: number
    updatedAt: number
}