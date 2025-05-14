interface PhoneValidationRule {
  regex: RegExp;
  errorMessage: string;
  expectedLength: number;
}

// Map of country codes to validation rules
export const phoneValidationRules: Record<string, PhoneValidationRule> = {
  // Default rule for most countries - general validation
  default: {
    regex: /^\d+$/,
    errorMessage: 'Phone number should contain only digits',
    expectedLength: 10
  },
  
  // Country-specific rules
  '+1': { // USA, Canada
    regex: /^\d{10}$/,
    errorMessage: 'US/Canada phone numbers must be 10 digits',
    expectedLength: 10
  },
  '+44': { // UK
    regex: /^\d{10}$/,
    errorMessage: 'UK phone numbers must be 10 digits',
    expectedLength: 10
  },
  '+91': { // India
    regex: /^\d{10}$/,
    errorMessage: 'Indian phone numbers must be 10 digits',
    expectedLength: 10
  },
  '+33': { // France
    regex: /^\d{9}$/,
    errorMessage: 'French phone numbers must be 9 digits',
    expectedLength: 9
  },
  '+49': { // Germany
    regex: /^\d{10,11}$/,
    errorMessage: 'German phone numbers must be 10-11 digits',
    expectedLength: 11
  },
  '+61': { // Australia
    regex: /^\d{9}$/,
    errorMessage: 'Australian phone numbers must be 9 digits',
    expectedLength: 9
  },
  '+86': { // China
    regex: /^\d{11}$/,
    errorMessage: 'Chinese phone numbers must be 11 digits',
    expectedLength: 11
  },
  '+81': { // Japan
    regex: /^\d{10}$/,
    errorMessage: 'Japanese phone numbers must be 10 digits',
    expectedLength: 10
  },
  '+82': { // South Korea
    regex: /^\d{9,10}$/,
    errorMessage: 'South Korean phone numbers must be 9-10 digits',
    expectedLength: 10
  },
  '+55': { // Brazil
    regex: /^\d{10,11}$/,
    errorMessage: 'Brazilian phone numbers must be 10-11 digits',
    expectedLength: 11
  },
  '+52': { // Mexico
    regex: /^\d{10}$/,
    errorMessage: 'Mexican phone numbers must be 10 digits',
    expectedLength: 10
  },
  '+34': { // Spain
    regex: /^\d{9}$/,
    errorMessage: 'Spanish phone numbers must be 9 digits',
    expectedLength: 9
  },
  '+39': { // Italy
    regex: /^\d{9,10}$/,
    errorMessage: 'Italian phone numbers must be 9-10 digits',
    expectedLength: 10
  },
  '+7': { // Russia
    regex: /^\d{10}$/,
    errorMessage: 'Russian phone numbers must be 10 digits',
    expectedLength: 10
  },
  '+65': { // Singapore
    regex: /^\d{8}$/,
    errorMessage: 'Singapore phone numbers must be 8 digits',
    expectedLength: 8
  },
  '+971': { // UAE
    regex: /^\d{9}$/,
    errorMessage: 'UAE phone numbers must be 9 digits',
    expectedLength: 9
  },
  '+966': { // Saudi Arabia
    regex: /^\d{9}$/,
    errorMessage: 'Saudi Arabian phone numbers must be 9 digits',
    expectedLength: 9
  },
  '+353': { // Ireland
    regex: /^\d{9}$/,
    errorMessage: 'Irish phone numbers must be 9 digits',
    expectedLength: 9
  },
  '+64': { // New Zealand
    regex: /^\d{8,9}$/,
    errorMessage: 'New Zealand phone numbers must be 8-9 digits',
    expectedLength: 9
  }
};

/**
 * Validates a phone number based on country code
 * @param countryCode The country code (e.g., '+91')
 * @param phoneNumber The phone number without country code
 * @returns An object with isValid status and error message if invalid
 */
export const validatePhoneNumber = (
  countryCode: string,
  phoneNumber: string
): { isValid: boolean; errorMessage: string } => {
  // Remove any non-digit characters the user might have entered
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
  
  // Get validation rule for country code or use default
  const validationRule = phoneValidationRules[countryCode] || phoneValidationRules.default;
  
  if (!validationRule.regex.test(cleanPhoneNumber)) {
    return {
      isValid: false,
      errorMessage: validationRule.errorMessage
    };
  }
  
  return {
    isValid: true,
    errorMessage: ''
  };
};

/**
 * Returns formatted example phone number for a given country code
 * @param countryCode The country code
 * @returns A string with example phone number format
 */
export const getPhoneNumberPlaceholder = (countryCode: string): string => {
  const rule = phoneValidationRules[countryCode] || phoneValidationRules.default;
  return `Enter ${rule.expectedLength} digit number`;
}; 