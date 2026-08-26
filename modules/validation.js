/**
 * Validation Module
 * Input validation and error handling
 */

import {
  updateFieldError,
  updateValidationSummary,
  hasErrors,
  requiredMessage,
  minMessage,
  maxMessage,
  usdAmount,
} from '../validation-ui.js';

export { updateFieldError, updateValidationSummary, hasErrors };

/**
 * Validation rules for each field
 */
const VALIDATION_RULES = {
  marketPrice: {
    min: 1,
    max: 500,
    required: true,
    label: 'Market price',
    prefix: 'USD'
  },
  currentDividend: {
    min: 0,
    max: 50,
    required: true,
    label: 'Current dividend',
    prefix: 'USD'
  },
  requiredReturn: {
    min: 0.1,
    max: 25,
    required: true,
    label: 'Required return',
    unit: '%'
  }
};

/**
 * Validate a single field
 * @param {string} field - Field name
 * @param {number} value - Field value
 * @returns {string|null} Error message or null
 */
export function validateField(field, value) {
  const rules = VALIDATION_RULES[field];
  if (!rules) return null;
  
  if (rules.required && (value === '' || value == null || isNaN(value))) {
    return requiredMessage(rules.label);
  }
  
  if (rules.min !== undefined && value < rules.min) {
    const minDisplay = rules.prefix ? usdAmount(rules.min) : `${rules.min}${rules.unit || ''}`;
    return minMessage(rules.label, minDisplay);
  }
  
  if (rules.max !== undefined && value > rules.max) {
    const maxDisplay = rules.prefix ? usdAmount(rules.max) : `${rules.max}${rules.unit || ''}`;
    return maxMessage(rules.label, maxDisplay);
  }
  
  return null;
}

/**
 * Validate financial logic (g < r)
 * @param {number} impliedGrowth - Implied growth rate (decimal)
 * @param {number} requiredReturn - Required return (decimal)
 * @returns {string|null} Error message or null
 */
export function validateFinancialLogic(impliedGrowth, requiredReturn) {
  if (impliedGrowth >= requiredReturn) {
    return 'Invalid inputs: implied growth rate must be less than required return';
  }
  
  if (impliedGrowth < 0) {
    return 'Invalid inputs: implied growth rate cannot be negative';
  }
  
  return null;
}

/**
 * Validate all inputs
 * @param {Object} inputs - Input values
 * @returns {Object} Error object
 */
export function validateAllInputs(inputs) {
  const errors = {};
  
  // Field validation
  Object.keys(VALIDATION_RULES).forEach(field => {
    const error = validateField(field, inputs[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  // Financial logic validation (only if no field errors)
  if (Object.keys(errors).length === 0) {
    const r = inputs.requiredReturn / 100;
    const pvt = inputs.marketPrice;
    const divt = inputs.currentDividend;
    
    // Calculate g = (r*PV_t - Div_t) / (PV_t + Div_t)
    // This is the algebraically solved form of: g = r - Div_t(1+g)/PV_t
    const g = (r * pvt - divt) / (pvt + divt);
    
    const logicError = validateFinancialLogic(g, r);
    if (logicError) {
      errors.financial = logicError;
    }
  }
  
  return errors;
}
