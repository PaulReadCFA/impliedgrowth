/**
 * Dynamic Equation Module
 * Renders Gordon Growth Model equation with actual calculated values using MathJax
 */

import { formatCurrency, formatPercentage } from './utils.js';

/**
 * Render dynamic equation with user's values
 * @param {Object} calculations - Growth calculations
 * @param {Object} params - Input parameters
 */
export function renderDynamicEquation(calculations, params) {
  const container = document.getElementById('dynamic-equation');
  
  if (!container) {
    console.error('Dynamic equation container not found');
    return;
  }
  
  const { impliedGrowth, impliedGrowthDecimal } = calculations;
  const { requiredReturn, expectedDividend, marketPrice } = params;
  
  // Format values for display
  const gFormatted = formatPercentage(impliedGrowth);
  const rFormatted = formatPercentage(requiredReturn);
  const d1Formatted = formatCurrency(expectedDividend);
  const p0Formatted = formatCurrency(marketPrice);
  
  // Build LaTeX equation using color scheme:
  // Green #15803d for g (growth rate)
  // Purple #7a46ff for r (required return)
  // Blue #3c6ae5 for dividends
  // Orange #b95b1d for price
  
  // Escape special characters in formatted values
  const rClean = rFormatted.replace('%', '\\%');
  const gClean = gFormatted.replace('%', '\\%');
  const d1Clean = d1Formatted.replace('USD', '\\text{USD}');
  const p0Clean = p0Formatted.replace('USD', '\\text{USD}');
  
  // Simplified equation: g_implied = calculation with values only
  const latex = `\\color{#15803d}{g_{\\text{implied}}} = \\color{#7a46ff}{${rClean}} - \\frac{\\color{#3c6ae5}{${d1Clean}}}{\\color{#b95b1d}{${p0Clean}}} = \\color{#15803d}{\\mathbf{${gClean}}}`;
  
  container.textContent = '$$' + latex + '$$';
  
  // Trigger MathJax to render the equation
  if (window.MathJax && window.MathJax.Hub) {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, container]);
  }
  
  // Create screen-reader friendly announcement
  const announcement = `Implied growth rate equals ${gFormatted}. ` +
    `Calculated as: required return ${rFormatted} ` +
    `minus next dividend (Div sub t+1) ${d1Formatted} divided by current market price (PV sub t) ${p0Formatted}.`;
  
  // Update aria-live region for screen readers
  let liveRegion = document.getElementById('equation-live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'equation-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = announcement;
}