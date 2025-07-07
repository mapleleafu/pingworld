interface ValidationRule {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationSchema {
  [field: string]: ValidationRule;
}

interface FieldLabels {
  [field: string]: string;
}

class ValidatorService {
  private messages = {
    required: "{field} is required.",
    email: "Please enter a valid email address.",
    minLength: "{field} must be at least {min} characters.",
    maxLength: "{field} cannot exceed {max} characters.",
    pattern: "Please enter a valid {field}.",
  };

  validate(
    data: any,
    schema: ValidationSchema,
    labels: FieldLabels = {},
  ): string[] {
    const errors: string[] = [];

    Object.keys(schema).forEach((field) => {
      const value = data[field];
      const rules = schema[field];
      const label = labels[field] || field;

      if (rules.required && (!value || value.trim() === "")) {
        errors.push(this.messages.required.replace("{field}", label));
        return;
      }

      if (!value || value.trim() === "") return;

      if (rules.email && !this.isValidEmail(value)) {
        errors.push(this.messages.email.replace("{field}", label));
      }

      if (rules.minLength && value.length < rules.minLength) {
        errors.push(
          this.messages.minLength
            .replace("{field}", label)
            .replace("{min}", rules.minLength.toString()),
        );
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(
          this.messages.maxLength
            .replace("{field}", label)
            .replace("{max}", rules.maxLength.toString()),
        );
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(this.messages.pattern.replace("{field}", label));
      }

      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
          errors.push(customError);
        }
      }
    });

    return errors;
  }

  validateEmail(email: string): string | null {
    if (!this.isValidEmail(email)) {
      return "Please enter a valid email address.";
    }
    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}

export const validator = new ValidatorService();
