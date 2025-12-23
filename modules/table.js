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
      investment, and total cash flows. Note: Values in parentheses indicate negative cash flows.
    </caption>

    <thead>
      <tr>
        <th scope="col" class="text-left">Year</th>
        <th scope="col" class="text-right">Growth Rate <span style="color: #7a46ff;">(g)</span></th>
        <th scope="col" class="text-right">Dividend <span style="color: #15803d;">(D)</span></th>
        <th scope="col" class="text-right">Investment <span style="color: #b95b1d;">(P₀)</span></th>
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
        <td class="text-right" style="color: #7a46ff;" data-tooltip="Constant implied growth rate" tabindex="0">${formatPercentage(growthRate)}</td>
        <td class="text-right" style="color: #15803d;" data-tooltip="${isInitial ? 'No dividend in year 0' : 'Dividend = D₀ × (1 + g)^' + cf.year}" tabindex="0">${formatCurrency(cf.dividend)}</td>
        <td class="text-right" style="color: #b95b1d;" data-tooltip="${isInitial ? 'Initial stock purchase price (negative cash flow)' : 'No additional investment after year 0'}" tabindex="0">${formatCurrency(cf.investment)}</td>
        <td class="text-right" tabindex="0" data-tooltip="${isInitial ? 'Initial investment paid' : 'Dividend received'} = ${formatCurrency(cf.totalCashFlow)}"><strong>${formatCurrency(cf.totalCashFlow)}</strong></td>
        <td class="text-right" tabindex="0" data-tooltip="Running total of all cash flows"><strong>${formatCurrency(cf.cumulativeCashFlow)}</strong></td>
      </tr>`;
  });

  html += `
    </tbody>
  `;

  // Inject the HTML
  table.innerHTML = html;

  // Add accessibility attributes
  table.setAttribute('aria-label', 'Dividend growth projection table. Press Escape to exit table.');

  // Announce to screen-reader users
  announceToScreenReader('Table view loaded with dividend projections.');
  
  // Add keyboard navigation to escape the table
  setupTableKeyboardEscape();
}

/**
 * Set up Escape key to exit table and move to next section
 */
function setupTableKeyboardEscape() {
  const table = document.getElementById('cash-flow-table');
  
  if (!table) return;
  
  // Remove old listener if exists
  if (table._escapeListener) {
    table.removeEventListener('keydown', table._escapeListener);
  }
  
  const escapeListener = (e) => {
    // Press Escape to jump out of table to calculator section
    if (e.key === 'Escape') {
      e.preventDefault();
      const calculator = document.getElementById('calculator');
      if (calculator) {
        calculator.focus();
        announceToScreenReader('Exited table, moved to calculator section');
      }
    }
  };
  
  table._escapeListener = escapeListener;
  table.addEventListener('keydown', escapeListener);
}