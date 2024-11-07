import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'

export function IsEnumName(refEnum: any, options?: ValidationOptions) {
    return function (object: unknown, propertyName: string) {
        registerDecorator({
            name: 'IsEnumName',
            target: object.constructor,
            propertyName,
            constraints: [refEnum],
            options,
            validator: {
                defaultMessage(): string {
                    return `${propertyName} Invalid enum name`
                },
                validate(value: any, validationArguments?: ValidationArguments): boolean {
                    const constraints = validationArguments.constraints
                    try {
                        return !!constraints[0][value]
                    } catch (e) {
                        return false
                    }
                },
            },
        })
    }
}
