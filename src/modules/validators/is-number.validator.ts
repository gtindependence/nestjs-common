import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint()
export class IsNumberConstraint implements ValidatorConstraintInterface {

    validate(number: unknown) {
        return !isNaN(Number(number));
    }

    defaultMessage() {
      return `$property must be a number.`;
    }

}

export function IsNumber(validationOptions?: ValidationOptions) {
   return (object: object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsNumberConstraint
        });
   };
}
