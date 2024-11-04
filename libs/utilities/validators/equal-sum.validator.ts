import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export function IsSumEquals(key: string, expectedValue: number, validationOptions?: ValidationOptions) {
    return function (object: unknown, propertyName: string) {
        registerDecorator({
            name: 'IsSumEquals',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [key, expectedValue],
            options: validationOptions,
            validator: {
                defaultMessage(validationArguments?: ValidationArguments): string {
                    return `Summary of ${validationArguments.property}.${key} not equals ${validationArguments.constraints[1]}`
                },
                validate(value: any[] = []) {
                    return expectedValue === value.reduce((acc, v) => acc + v[key], 0)
                },
            },
        })
    }
}
