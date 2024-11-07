import Decimal from 'decimal.js'
import { isNil } from 'lodash'
import { ValueTransformer } from 'typeorm'

export class DecimalValueTransformer implements ValueTransformer {
    public to(value: Decimal): string {
        return value?.toString()
    }
    public from(value: string): Decimal {
        return isNil(value) ? null : new Decimal(value)
    }
}
