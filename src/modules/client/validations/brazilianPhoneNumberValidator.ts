import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function IsBrazilianPhoneNumber(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isBrazilianPhoneNumber',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    // A regex aceita números de celular e residenciais
                    const brazilianPhoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
                    return typeof value === 'string' && brazilianPhoneRegex.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'O número de telefone deve estar no formato celular: (DD) XXXX-XXXX ou residencial: (DD) XXXXX-XXXX';
                }
            },
        });
    };
}
