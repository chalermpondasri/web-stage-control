import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export function IsCustomDateString(template: string, validationOptions?: ValidationOptions) {
    return function (object: unknown, propertyName: string) {
        registerDecorator({
            name: 'IsCustomDateString',
            target: object.constructor,
            propertyName,
            constraints: [template],
            options: validationOptions,
            validator: {
                defaultMessage(validationArguments?: ValidationArguments): string {
                    return `${propertyName} Invalid date format, expect ${validationArguments.constraints[0]}`
                },
                validate(value: any, args: ValidationArguments) {
                    try {
                        return typeof value === 'string' && dayjs(value, args.constraints[0], true).isValid()
                    } catch (e) {
                        return false
                    }
                },
            },
        })
    }
}

export const IsMaxDate = (maxDate: Date = new Date(), validationOptions?: ValidationOptions) => {
    return (object: unknown, propertyName: string) =>
        registerDecorator({
            name: 'IsMaxDate',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                defaultMessage(): string {
                    return `maximal allowed date for ${propertyName} is ${dayjs(maxDate).format('YYYY-MM-DD')}`
                },
                validate(value: any) {
                    try {
                        return new Date(value).getTime() <= maxDate.getTime()
                    } catch (e) {
                        return false
                    }
                },
            },
        })
}
