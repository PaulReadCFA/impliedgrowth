/**
 * Dynamic Equation Module
 * Renders Gordon Growth Model equations as native MathML.
 */

import { formatCurrency, formatCurrencySpeech, formatPercentage } from './utils.js';
import { renderEquationGroup } from '../equation-render.js';

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

  const percentMath = (value, color, bold = false) =>
    `<mstyle mathcolor="${color}"${bold ? ' mathvariant="bold"' : ''}>` +
      `<mn>${value.replace('%', '')}</mn><mo>%</mo>` +
    `</mstyle>`;

  const originalMathML = `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
    <mrow>
      <mi mathcolor="#07514F">g</mi><mo>=</mo>
      ${percentMath(rFormatted, '#7A46FF')}
      <mo>&#x2212;</mo>
      <mfrac>
        <mrow>
          <mtext mathcolor="#3C6AE5">${divtFormatted}</mtext>
          <mo>&#x2062;</mo>
          <mrow><mo>(</mo><mn>1</mn><mo>+</mo><mi mathcolor="#07514F">g</mi><mo>)</mo></mrow>
        </mrow>
        <mtext mathcolor="#B95B1D">${pvtFormatted}</mtext>
      </mfrac>
      <mo>=</mo>${percentMath(gFormatted, '#07514F', true)}
    </mrow>
  </math>`;

  const solvedMathML = `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
    <mrow>
      <mi mathcolor="#07514F">g</mi><mo>=</mo>
      <mfrac>
        <mrow>
          ${percentMath(rFormatted, '#7A46FF')}
          <mo>&#x00D7;</mo>
          <mtext mathcolor="#B95B1D">${pvtFormatted}</mtext>
          <mo>&#x2212;</mo>
          <mtext mathcolor="#3C6AE5">${divtFormatted}</mtext>
        </mrow>
        <mrow>
          <mtext mathcolor="#B95B1D">${pvtFormatted}</mtext>
          <mo>+</mo>
          <mtext mathcolor="#3C6AE5">${divtFormatted}</mtext>
        </mrow>
      </mfrac>
      <mo>=</mo>${percentMath(gFormatted, '#07514F', true)}
    </mrow>
  </math>`;

  // The shared mount holds each equation's height and hides the source MathML
  // while MathJax typesets, so the cards below stay put.
  renderEquationGroup(
    [
      { mount: originalContainer, markup: originalMathML },
      { mount: solvedContainer, markup: solvedMathML },
    ],
    {
      // Keep the visible card title as the accessible name and expose current
      // values as its description.
      onTypeset: () => {
        const summary = document.getElementById('equation-summary');
        if (summary) {
          summary.textContent =
            'Implied growth rate result: ' + gFormatted + '. ' +
            'Required return: ' + rFormatted + '. ' +
            'Current dividend: ' + formatCurrencySpeech(currentDividend) + '. ' +
            'Market price: ' + formatCurrencySpeech(marketPrice) + '.';
        }
      },
    }
  );
}