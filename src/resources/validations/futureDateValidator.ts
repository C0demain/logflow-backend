import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ async: false })
@Injectable()
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: Date) {
    const currentDate = new Date();
    return date > currentDate;
  }

  defaultMessage() {
    return 'A data deve estar no futuro.';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
