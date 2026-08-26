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

  const { impliedGrowth } = calculations;
  const { requiredReturn, currentDividend, marketPrice } = params;

  // Format values for display
  const gFormatted    = formatPercentage(impliedGrowth);
  const rFormatted    = formatPercentage(requiredReturn);
  const divtFormatted = formatCurrency(currentDividend);
  const pvtFormatted  = formatCurrency(marketPrice);

  // Escape special characters in formatted values
  const rClean    = rFormatted.replace('%', '\\%');
  const gClean    = gFormatted.replace('%', '\\%');
  const divtClean = divtFormatted.replace('USD', '\\text{USD}').replace('−', '-');
  const pvtClean  = pvtFormatted.replace('USD', '\\text{USD}');

  // Original formula:  g = r - Div_t(1+g)/PV_t = result
  const originalLatex = `\\color{#07514F}{g} = \\color{#7a46ff}{${rClean}} - \\frac{\\color{#3c6ae5}{${divtClean}}(1+\\color{#07514F}{g})}{\\color{#b95b1d}{${pvtClean}}} = \\color{#07514F}{\\mathbf{${gClean}}}`;

  // Solved formula:  g = (r·PV_t − Div_t) / (PV_t + Div_t) = result
  const solvedLatex = `\\color{#07514F}{g} = \\frac{\\color{#7a46ff}{${rClean}} \\times \\color{#b95b1d}{${pvtClean}} - \\color{#3c6ae5}{${divtClean}}}{\\color{#b95b1d}{${pvtClean}} + \\color{#3c6ae5}{${divtClean}}} = \\color{#07514F}{\\mathbf{${gClean}}}`;

  const card = document.getElementById('equation-card');

  // Hide both containers so the raw LaTeX string is never user-visible.
  originalContainer.style.visibility = 'hidden';
  solvedContainer.style.visibility   = 'hidden';

  // Write raw LaTeX (invisible at this point).
  originalContainer.textContent = '$$' + originalLatex + '$$';
  solvedContainer.textContent   = '$$' + solvedLatex   + '$$';

  if (window.MathJax && window.MathJax.Hub) {
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, originalContainer]);
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, solvedContainer]);
    MathJax.Hub.Queue(function () {
      // Reveal rendered math.
      originalContainer.style.visibility = 'visible';
      solvedContainer.style.visibility   = 'visible';

      // Keep the visible card title as the accessible name and expose current
      // values as its description.
      const summary = document.getElementById('equation-summary');
      if (summary) {
        summary.textContent =
          'Implied growth rate result: ' + gFormatted + '. ' +
          'Required return: ' + rFormatted + '. ' +
          'Current dividend: ' + divtFormatted + '. ' +
          'Market price: ' + pvtFormatted + '.';
      }

    });
  } else {
    // MathJax unavailable — just show content.
    originalContainer.style.visibility = 'visible';
    solvedContainer.style.visibility   = 'visible';
  }
}