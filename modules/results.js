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
    'Constant Dividend Growth Model'
  );
  box.appendChild(title);
  
  const content = createElement('div', { 
    className: 'analysis-content',
    'role': 'region',
    'aria-labelledby': 'model-info-heading'
  });
  
  // Add ID to title for aria-labelledby
  title.id = 'model-info-heading';
  
  // Description
  const description = createElement('p', { 
    style: 'margin-bottom: 0.75rem; font-size: 0.9375rem; color: var(--color-gray-700);'
  });
  description.innerHTML = `Based on this scenario, we have the following:`;
  content.appendChild(description);
  
  // Model details list (removed dividend yield line)
  const list = createElement('ul', { className: 'model-info-list' });
  
  const items = [
    { label: 'Required return (<i>r</i>)', value: formatPercentage(params.requiredReturn) },
    { label: 'Implied growth (<i>g</i>)', value: formatPercentage(calculations.impliedGrowth) },
    { label: 'Expected next dividend (Div<sub>t+1</sub>)', value: formatCurrency(calculations.expectedD1) }
  ];
  
  items.forEach(item => {
    const li = createElement('li');
    li.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
    list.appendChild(li);
  });
  
  content.appendChild(list);
  
  box.appendChild(content);
  
  return box;
}