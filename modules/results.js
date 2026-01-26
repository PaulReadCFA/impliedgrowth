/**
 * Results Display Module
 * Renders implied growth rate and analysis results
 */

import { formatCurrency, formatPercentage, createElement } from './utils.js';

/**
 * Render results and analysis section
 * @param {Object} calculations - Growth calculations
 * @param {Object} params - Input parameters
 */
export function renderResults(calculations, params) {
  const container = document.getElementById('results-content');
  
  if (!container) {
    console.error('Results container not found');
    return;
  }
  
  // Clear existing content
  container.innerHTML = '';
  
  // Create growth rate box
  const growthBox = createGrowthRateBox(calculations);
  container.appendChild(growthBox);
  
  // Create consistency check box (if inconsistent)
  if (!calculations.d1Consistent) {
    const consistencyBox = createConsistencyBox(calculations, params);
    container.appendChild(consistencyBox);
  }
  
  // Create model info box
  const infoBox = createModelInfoBox(calculations, params);
  container.appendChild(infoBox);
}

/**
 * Create implied growth rate display box
 * @param {Object} calculations - Growth calculations
 * @returns {Element} Growth rate box element
 */
function createGrowthRateBox(calculations) {
  const box = createElement('div', { className: 'result-box growth-rate' });
  
  const title = createElement('h5', { className: 'result-title growth-rate' }, 
    'Implied Growth Rate'
  );
  box.appendChild(title);
  
  const valueContainer = createElement('div', { className: 'result-value' });
  
  // Growth rate value with aria-live for screen reader announcements
  const growthValue = createElement('div', {
    'aria-live': 'polite',
    'aria-atomic': 'true'
  }, formatPercentage(calculations.impliedGrowth));
  valueContainer.appendChild(growthValue);
  
  box.appendChild(valueContainer);
  
  // Description
  const description = createElement('div', { className: 'result-description' },
    'Expected by the market based on current pricing'
  );
  box.appendChild(description);
  
  return box;
}

/**
 * Create consistency check box
 * @param {Object} calculations - Growth calculations
 * @param {Object} params - Input parameters
 * @returns {Element} Consistency box element
 */
function createConsistencyBox(calculations, params) {
  const box = createElement('div', { className: 'result-box consistency' });
  
  const title = createElement('h5', { className: 'result-title consistency' }, 
    'Consistency Check'
  );
  box.appendChild(title);
  
  const content = createElement('div', { 
    className: 'analysis-content',
    'aria-live': 'polite',
    'aria-atomic': 'true',
    'role': 'region',
    'aria-labelledby': 'consistency-heading'
  });
  
  // Add ID to title for aria-labelledby
  title.id = 'consistency-heading';
  
  // Warning message
  const warning = createElement('div', { className: 'consistency-warning' });
  
  const warningTitle = createElement('div', { className: 'consistency-warning-title' },
    'Note: Div_t+1 values differ'
  );
  warning.appendChild(warningTitle);
  
  const details = createElement('div', { className: 'consistency-details' });
  details.innerHTML = `
    Expected Div<sub>t+1</sub>: ${formatCurrency(params.expectedDividend)}<br>
    Calculated Div<sub>t+1</sub>: ${formatCurrency(calculations.calculatedD1)}<br>
    <small>(Based on Div<sub>t</sub> × (1 + g))</small>
  `;
  warning.appendChild(details);
  
  content.appendChild(warning);
  box.appendChild(content);
  
  return box;
}

/**
 * Create model information box
 * @param {Object} calculations - Growth calculations
 * @param {Object} params - Input parameters
 * @returns {Element} Model info box element
 */
function createModelInfoBox(calculations, params) {
  const box = createElement('div', { className: 'result-box model-info' });
  
  const title = createElement('h5', { className: 'result-title model-info' }, 
    'Gordon Growth Model'
  );
  box.appendChild(title);
  
  const content = createElement('div', { 
    className: 'analysis-content',
    'role': 'region',
    'aria-labelledby': 'model-info-heading'
  });
  
  // Add ID to title for aria-labelledby
  title.id = 'model-info-heading';
  
  // Model details list
  const list = createElement('ul', { className: 'model-info-list' });
  
  const items = [
    { label: 'Required return (r)', value: formatPercentage(params.requiredReturn) },
    { label: 'Dividend yield', value: formatPercentage(calculations.dividendYield) },
    { label: 'Implied growth (g)', value: formatPercentage(calculations.impliedGrowth) }
  ];
  
  items.forEach(item => {
    const li = createElement('li');
    li.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
    list.appendChild(li);
  });
  
  content.appendChild(list);
  
  // Formula reminder
  const formula = createElement('div', { 
    className: 'analysis-details',
    style: 'margin-top: 0.75rem; font-size: 0.8125rem;'
  });
  formula.innerHTML = `<em>Formula: g = r − (Div<sub>t+1</sub> / PV<sub>t</sub>)</em>`;
  content.appendChild(formula);
  
  box.appendChild(content);
  
  return box;
}