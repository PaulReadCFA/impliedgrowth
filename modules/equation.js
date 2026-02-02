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
  const originalContainer = document.getElementById('dynamic-equation');
  const solvedContainer = document.getElementById('dynamic-solved-equation');
  
  if (!originalContainer || !solvedContainer) {
    console.error('Dynamic equation containers not found');
    return;
  }
  
  const { impliedGrowth, impliedGrowthDecimal, expectedD1 } = calculations;
  const { requiredReturn, currentDividend, marketPrice } = params;
  
  // Format values for display
  const gFormatted = formatPercentage(impliedGrowth);
  const rFormatted = formatPercentage(requiredReturn);
  const divtFormatted = formatCurrency(currentDividend);
  const pvtFormatted = formatCurrency(marketPrice);
  
  // Build LaTeX equation using color scheme:
  // Green #15803d for g (growth rate)
  // Purple #7a46ff for r (required return)
  // Blue #3c6ae5 for dividends
  // Orange #b95b1d for price
  
  // Escape special characters in formatted values
  const rClean = rFormatted.replace('%', '\\%');
  const gClean = gFormatted.replace('%', '\\%');
  const divtClean = divtFormatted.replace('USD', '\\text{USD}').replace('−', '-');
  const pvtClean = pvtFormatted.replace('USD', '\\text{USD}');
  
  // Original formula with actual numbers:
  // g = r - Div_t(1+g)/PV_t = result
  const originalLatex = `\\color{#15803d}{g} = \\color{#7a46ff}{${rClean}} - \\frac{\\color{#3c6ae5}{${divtClean}}(1+\\color{#15803d}{g})}{\\color{#b95b1d}{${pvtClean}}} = \\color{#15803d}{\\mathbf{${gClean}}}`;
  
  originalContainer.textContent = '$$' + originalLatex + '$$';
  
  // Solved formula with actual numbers:
  // g = (r*PV_t - Div_t) / (PV_t + Div_t) = result
  const solvedLatex = `\\color{#15803d}{g} = \\frac{\\color{#7a46ff}{${rClean}} \\times \\color{#b95b1d}{${pvtClean}} - \\color{#3c6ae5}{${divtClean}}}{\\color{#b95b1d}{${pvtClean}} + \\color{#3c6ae5}{${divtClean}}} = \\color{#15803d}{\\mathbf{${gClean}}}`;
  
  solvedContainer.textContent = '$$' + solvedLatex + '$$';
  
  // Trigger MathJax to render both equations
  if (window.MathJax && window.MathJax.Hub) {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, originalContainer]);
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, solvedContainer]);
  }
  
  // Create screen-reader friendly announcement
  const announcement = `Implied growth rate equals ${gFormatted}. ` +
    `Formula: g equals required return ${rFormatted} ` +
    `minus current dividend ${divtFormatted} times quantity 1 plus g, divided by market price ${pvtFormatted}.`;
  
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