import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function IsCNPJ(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isCNPJ',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
                    return typeof value === 'string' && cnpjRegex.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'O CNPJ deve estar no formato: xx.xxx.xxx/xxxx-xx';
                }
            },
        });
    };
}
