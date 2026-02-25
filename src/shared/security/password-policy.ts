import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
    validate(password: string) {
        if (!password) return false;

        // Check for minimum length 8
        if (password.length < 8) return false;

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) return false;

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) return false;

        // Check for at least one number
        if (!/[0-9]/.test(password)) return false;

        // Check for at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

        return true;
    }

    defaultMessage() {
        return 'Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.';
    }
}

export function IsStrongPasswordValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsStrongPasswordConstraint,
        });
    };
}
