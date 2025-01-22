import { IQr30PaymentRequest } from '@libs/repositories/interfaces/openbanking/open-banking.interface'
import { Transform } from 'class-transformer'
import {
    IsAlphanumeric,
    IsNumber,
    IsUppercase,
} from 'class-validator'

export class Qr30PaymentRequest implements IQr30PaymentRequest {
    @IsNumber()
    public amount: number

    @IsAlphanumeric()
    @IsUppercase()
    @Transform(({ value }) => value.toUpperCase())
    public ref1: string

    @IsAlphanumeric()
    @IsUppercase()
    @Transform(({ value }) => value.toUpperCase())
    public ref2: string

    @IsAlphanumeric()
    @IsUppercase()
    @Transform(({ value }) => value.toUpperCase())
    public ref3: string

    public constructor(
        private readonly _ref3Prefix: string,
    ) {

    }

    public extract():IQr30PaymentRequest {
        return {
            amount: this.amount,
            ref1: this.ref1.toUpperCase(),
            ref2: this.ref2.toUpperCase(),
            ref3: `${this._ref3Prefix}${this.ref3}`.toUpperCase()
        }
    }
}