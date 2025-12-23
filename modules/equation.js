/**
 * Dynamic Equation Module
 * Renders Gordon Growth Model equation with actual calculated values
 */

import { formatCurrency, formatPercentage } from './utils.js';

/**
 * Render dynamic equation with user's values
 * @param {Object} calculations - Growth calculations
 * @param {Object} params - Input parameters
 */
export function renderDynamicEquation(calculations, params) {
  const container = document.getElementById('dynamic-mathml-equation');
  
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
  
  // Build MathML equation
  // g = r − (D₁ / P₀)
  const mathML = `
    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
      <mrow>
        <msub>
          <mi mathcolor="#7a46ff">g</mi>
          <mtext mathcolor="#7a46ff">implied</mtext>
        </msub>
        <mo>=</mo>
        <msub>
          <mi mathcolor="#0079a6">r</mi>
          <mtext mathcolor="#0079a6">required</mtext>
        </msub>
        <mo>−</mo>
        <mfrac linethickness="1.2px">
          <msub>
            <mi mathvariant="bold" mathcolor="#15803d">D</mi>
            <mn mathcolor="#15803d">1</mn>
          </msub>
          <msub>
            <mi mathvariant="bold" mathcolor="#b95b1d">P</mi>
            <mn mathcolor="#b95b1d">0</mn>
          </msub>
        </mfrac>
        <mo>=</mo>
        <mtext mathcolor="#0079a6">${rFormatted}</mtext>
        <mo>−</mo>
        <mfrac linethickness="1.2px">
          <mtext mathvariant="bold" mathcolor="#15803d">${d1Formatted}</mtext>
          <mtext mathvariant="bold" mathcolor="#b95b1d">${p0Formatted}</mtext>
        </mfrac>
        <mo>=</mo>
        <mtext mathcolor="#7a46ff" mathvariant="bold">${gFormatted}</mtext>
      </mrow>
    </math>
  `;
  
  container.innerHTML = mathML;
  
  // Create screen-reader friendly announcement
  const announcement = `Implied growth rate equals ${gFormatted}. ` +
    `Calculated as: required return ${rFormatted} ` +
    `minus next year's dividend ${d1Formatted} divided by current market price ${p0Formatted}.`;
  
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