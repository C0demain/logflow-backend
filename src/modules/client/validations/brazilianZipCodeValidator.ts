import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function IsZipCode(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isZipCode',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const cepRegex = /^\d{5}-\d{3}$/;
                    return typeof value === 'string' && cepRegex.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'O CEP deve estar no formato XXXXX-XXX';
                }
            },
        });
    };
}
