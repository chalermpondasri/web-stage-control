import { ErrorDomain } from '@libs/common/constants'
import { AbstractDomainErrorBuilder } from '@libs/factories/error.builder'

export class PaymentDomainErrorBuilder extends AbstractDomainErrorBuilder {
    public constructor() {
        super(ErrorDomain.PAYMENT)
    }
}
