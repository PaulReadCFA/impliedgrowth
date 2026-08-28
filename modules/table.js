/**
 * Table Rendering Module
 * Renders accessible data table for dividend growth projections
 */

import { $, formatNumber, formatPercentage, announceToScreenReader } from './utils.js';
import { applyTableRoles } from '../table-roles.js';

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
        <th scope="col" class="text-right table-var-5">Dividend growth rate (𝑔)</th>
        <th scope="col" class="text-right table-var-2">Dividend (Div<sub>𝑡</sub>) (USD)</th>
        <th scope="col" class="text-right table-var-6">Initial investment / Market price (PV<sub>𝑡</sub>) (USD)</th>
        <th scope="col" class="text-right">Total Cash Flow (USD)</th>
        <th scope="col" class="text-right">Cumulative (USD)</th>
      </tr>
    </thead>

    <tbody>`;

  // data-label mirrors the column header: it becomes the visible label when the
  // shared base reflows each row into a card below 768px. cell-value keeps the
  // value as a single element so it stays on the right of that label.
  cashFlows.forEach((cf) => {
    html += `
      <tr>
        <th scope="row" class="text-left" data-label="Year">${cf.year}</th>
        <td class="text-right" data-label="Dividend growth rate (𝑔)"><span class="cell-value table-var-5">${formatPercentage(growthRate)}</span></td>
        <td class="text-right" data-label="Dividend (Div𝑡) (USD)"><span class="cell-value table-var-2">${formatNumber(cf.dividend)}</span></td>
        <td class="text-right" data-label="Initial investment / Market price (PV𝑡) (USD)"><span class="cell-value table-var-6">${formatNumber(cf.investment)}</span></td>
        <td class="text-right" data-label="Total Cash Flow (USD)"><span class="cell-value"><strong>${formatNumber(cf.totalCashFlow)}</strong></span></td>
        <td class="text-right" data-label="Cumulative (USD)"><span class="cell-value"><strong>${formatNumber(cf.cumulativeCashFlow)}</strong></span></td>
      </tr>`;
  });

  html += `
    </tbody>
  `;

  // Inject the HTML
  table.innerHTML = html;
  applyTableRoles(table);

  // Announce to screen-reader users
  announceToScreenReader('Table view loaded with dividend projections.');
}