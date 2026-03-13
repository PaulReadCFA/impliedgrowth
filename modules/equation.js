/**
 * Dynamic Equation Module
 * Renders Gordon Growth Model equation with actual calculated values using MathJax
 */

import { formatCurrency, formatPercentage } from './utils.js';

// Track the tallest height the equation card has ever reached so it never
// shrinks and causes a layout jump on subsequent recalculations.
let equationCardMinHeight = 0;

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
  const originalLatex = `\\color{#15803d}{g} = \\color{#7a46ff}{${rClean}} - \\frac{\\color{#3c6ae5}{${divtClean}}(1+\\color{#15803d}{g})}{\\color{#b95b1d}{${pvtClean}}} = \\color{#15803d}{\\mathbf{${gClean}}}`;

  // Solved formula:  g = (r·PV_t − Div_t) / (PV_t + Div_t) = result
  const solvedLatex = `\\color{#15803d}{g} = \\frac{\\color{#7a46ff}{${rClean}} \\times \\color{#b95b1d}{${pvtClean}} - \\color{#3c6ae5}{${divtClean}}}{\\color{#b95b1d}{${pvtClean}} + \\color{#3c6ae5}{${divtClean}}} = \\color{#15803d}{\\mathbf{${gClean}}}`;

  // ─── Layout-shift prevention ───────────────────────────────────────────────
  const card = document.getElementById('equation-card');
  const isFirstRender = originalContainer.offsetHeight === 0;

  if (!isFirstRender && card) {
    // Hard-lock the card at its current pixel height so nothing inside can
    // push or pull surrounding content while MathJax is working.
    const cardH = card.offsetHeight;
    card.style.height   = cardH + 'px';
    card.style.overflow = 'hidden';
  }

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

      if (card) {
        // Release the hard height lock.
        card.style.height   = '';
        card.style.overflow = '';

        // Update the high-water mark: the card's min-height is always the
        // tallest it has ever naturally rendered. This means small value
        // changes (fewer digits → shorter equation) never cause the card to
        // shrink, eliminating the residual few-pixel jump.
        const renderedH = card.offsetHeight;
        if (renderedH > equationCardMinHeight) {
          equationCardMinHeight = renderedH;
        }
        card.style.minHeight = equationCardMinHeight + 'px';
      }
    });
  } else {
    // MathJax unavailable — just show content.
    originalContainer.style.visibility = 'visible';
    solvedContainer.style.visibility   = 'visible';
    if (card) {
      card.style.height   = '';
      card.style.overflow = '';
    }
  }
}