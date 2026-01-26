/**
 * Table Rendering Module
 * Renders accessible data table for dividend growth projections
 */

import { $, formatCurrency, formatPercentage, announceToScreenReader } from './utils.js';

/**
 * Render cash flow table
 * @param {Array} cashFlows - Array of cash flow objects
 * @param {number} growthRate - Growth rate percentage
 */
export function renderTable(cashFlows, growthRate) {
  const table = $('#cash-flow-table');

  if (!table) {
    console.error('Table element not found');
    return;
  }

  // Build the HTML string
  let html = `
    <caption class="sr-only">
      Dividend growth projection schedule showing year, growth rate, dividend payment,
      investment, and total cash flows.
    </caption>

    <thead>
      <tr>
        <th scope="col" class="text-left">Year</th>
        <th scope="col" class="text-right">Growth Rate <span style="color: #15803d;">(g)</span></th>
        <th scope="col" class="text-right">Dividend <span style="color: #3c6ae5;">(Div)</span></th>
        <th scope="col" class="text-right">Investment <span style="color: #b95b1d;">(PV<sub>t</sub>)</span></th>
        <th scope="col" class="text-right">Total Cash Flow</th>
        <th scope="col" class="text-right">Cumulative</th>
      </tr>
    </thead>

    <tbody>`;

  // Add a row for every cash-flow
  cashFlows.forEach((cf, index) => {
    const isInitial = index === 0;

    html += `
      <tr>
        <td class="text-left">${cf.year}</td>
        <td class="text-right" style="color: #15803d;">${formatPercentage(growthRate)}</td>
        <td class="text-right" style="color: #3c6ae5;">${formatCurrency(cf.dividend)}</td>
        <td class="text-right" style="color: #b95b1d;">${formatCurrency(cf.investment)}</td>
        <td class="text-right"><strong>${formatCurrency(cf.totalCashFlow)}</strong></td>
        <td class="text-right"><strong>${formatCurrency(cf.cumulativeCashFlow)}</strong></td>
      </tr>`;
  });

  html += `
    </tbody>
  `;

  // Inject the HTML
  table.innerHTML = html;

  // Add accessibility attributes
  table.setAttribute('aria-label', 'Dividend growth projection table.');

  // Announce to screen-reader users
  announceToScreenReader('Table view loaded with dividend projections.');
}