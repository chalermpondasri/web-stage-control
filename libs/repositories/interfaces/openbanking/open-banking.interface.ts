import { Observable } from 'rxjs'

export interface IQr30PaymentRequest {
    amount: number
    ref1: string
    ref2: string
    ref3: string
}

export interface IQr30Data {
    status: {
        code: number
        description: string
    }
    data: {
        qrRawData: string
        qrImage: string
    }
}
export interface IOpenBanking {
    generateQrCode(request: IQr30PaymentRequest): Observable<IQr30PaymentRequest & IQr30Data>
}