export class PaymentPayload {
    public payeeProxyId: string
    public payeeProxyType: string
    public payeeAccountNumber: string
    public payeeName: string
    public payerProxyId: string
    public payerProxyType: string
    public payerAccountNumber: string
    public payerName: string
    public sendingBankCode: string
    public receivingBankCode: string
    public amount: string
    public channelCode: string
    public transactionId: string
    public transactionDateandTime: string // ISO 8601 formatted datetime
    public billPaymentRef1: string
    public billPaymentRef2: string
    public billPaymentRef3: string
    public currencyCode: string
    public transactionType: string
}