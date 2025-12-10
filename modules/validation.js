/**
 * Validation Module
 * Input validation and error handling
 */

import { $ } from './utils.js';

/**
 * Validation rules for each field
 */
const VALIDATION_RULES = {
  marketPrice: {
    min: 1,
    max: 500,
    required: true,
    label: 'Market price',
    prefix: '$'
  },
  currentDividend: {
    min: 0,
    max: 50,
    required: true,
    label: 'Current dividend',
    prefix: '$'
  },
  requiredReturn: {
    min: 0.01,
    max: 25,
    required: true,
    label: 'Required return',
    unit: '%'
  },
  expectedDividend: {
    min: 0,
    max: 50,
    required: true,
    label: 'Expected next dividend',
    prefix: '$'
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
    return `${rules.label} is required`;
  }
  
  if (rules.min !== undefined && value < rules.min) {
    const minDisplay = rules.prefix ? `${rules.prefix}${rules.min}` : `${rules.min}${rules.unit || ''}`;
    const maxDisplay = rules.prefix ? `${rules.prefix}${rules.max}` : `${rules.max}${rules.unit || ''}`;
    return `${rules.label} must be between ${minDisplay} and ${maxDisplay}`;
  }
  
  if (rules.max !== undefined && value > rules.max) {
    const minDisplay = rules.prefix ? `${rules.prefix}${rules.min}` : `${rules.min}${rules.unit || ''}`;
    const maxDisplay = rules.prefix ? `${rules.prefix}${rules.max}` : `${rules.max}${rules.unit || ''}`;
    return `${rules.label} must be between ${minDisplay} and ${maxDisplay}`;
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
    const d1 = inputs.expectedDividend;
    const p0 = inputs.marketPrice;
    const g = r - (d1 / p0);
    
    const logicError = validateFinancialLogic(g, r);
    if (logicError) {
      errors.financial = logicError;
    }
  }
  
  return errors;
}

/**
 * Update field error display
 * @param {string} fieldId - Field ID
 * @param {string|null} errorMessage - Error message or null
 */
export function updateFieldError(fieldId, errorMessage) {
  const input = $(`#${fieldId}`);
  if (!input) return;
  
  if (errorMessage) {
    input.setAttribute('aria-invalid', 'true');
    input.classList.add('error');
  } else {
    input.removeAttribute('aria-invalid');
    input.classList.remove('error');
  }
}

/**
 * Update validation summary
 * @param {Object} errors - Error object
 */
export function updateValidationSummary(errors) {
  const summary = $('#validation-summary');
  const list = $('#validation-list');

  if (!summary || !list) return;

  if (hasErrors(errors)) {
    list.innerHTML = Object.entries(errors)
      .map(([field, message]) => `<li>${message}</li>`)
      .join('');
    summary.style.display = 'block';
  } else {
    summary.style.display = 'none';
  }
}

/**
 * Check if there are any errors
 * @param {Object} errors - Error object
 * @returns {boolean} True if errors exist
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
