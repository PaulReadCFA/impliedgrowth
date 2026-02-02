/**
 * Implied Growth Rate Calculator - Main Entry Point
 * CFA Institute - Vanilla JavaScript Implementation
 * 
 * This calculator demonstrates the Gordon Growth Model for calculating
 * implied growth rates from market pricing.
 * Built with accessibility (WCAG 2.1 AA) and maintainability in mind.
 */

import { state, setState, subscribe } from './modules/state.js';
import { calculateGrowthMetrics } from './modules/calculations.js';
import { 
  validateAllInputs, 
  validateField, 
  updateFieldError, 
  updateValidationSummary,
  hasErrors 
} from './modules/validation.js';
import { 
  $, 
  listen, 
  focusElement, 
  announceToScreenReader,
  debounce
} from './modules/utils.js';
import { renderChart, shouldShowLabels, destroyChart } from './modules/chart.js';
import { renderTable } from './modules/table.js';
import { renderResults } from './modules/results.js';
import { renderDynamicEquation } from './modules/equation.js';

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the calculator when DOM is ready
 */
function init() {
  console.log('Implied Growth Calculator initializing...');
  
  // Set up input event listeners
  setupInputListeners();
  
  // Set up view toggle listeners
  setupViewToggle();
  
  // Set up skip link handlers
  setupSkipLinks();
  
  // Set up window resize listener for chart labels
  setupResizeListener();
  
  // Subscribe to state changes
  subscribe(handleStateChange);
  
  // Initial calculation
  updateCalculations();
  
  // Run self-tests
  runSelfTests();
  
  console.log('Implied Growth Calculator ready');
}

/**
 * Set up skip link handlers for accessibility
 */
function setupSkipLinks() {
  const skipToDataEntry = document.querySelector('a[href="#data-entry"]');
  const skipToTableBtn = document.querySelector('a[href="#table-view-btn"]');
  
  if (skipToDataEntry) {
    listen(skipToDataEntry, 'click', (e) => {
      e.preventDefault();
      
      // Focus the first input field
      const firstInput = $('#market-price');
      if (firstInput) {
        firstInput.focus();
        // Scroll into view
        const dataEntry = $('#data-entry');
        if (dataEntry) {
          dataEntry.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
  
  if (skipToTableBtn) {
    listen(skipToTableBtn, 'click', (e) => {
      e.preventDefault();
      
      // Switch to table view
      switchView('table');
      
      // Focus the table button
      const tableBtn = $('#table-view-btn');
      if (tableBtn) {
        tableBtn.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          tableBtn.focus();
        }, 100);
      }
    });
  }
}

// =============================================================================
// INPUT HANDLING
// =============================================================================

/**
 * Set up event listeners for input fields
 */
function setupInputListeners() {
  const inputs = [
    { id: 'market-price', field: 'marketPrice' },
    { id: 'current-dividend', field: 'currentDividend' },
    { id: 'required-return', field: 'requiredReturn' }
  ];
  
  inputs.forEach(({ id, field }) => {
    const input = $(`#${id}`);
    if (!input) return;
    
    // Update state on input change (debounced)
    const debouncedUpdate = debounce(() => {
      const value = parseFloat(input.value);
      
      // Validate field
      const error = validateField(field, value);
      updateFieldError(id, error);
      
      // Update state
      const errors = { ...state.errors };
      if (error) {
        errors[field] = error;
      } else {
        delete errors[field];
        // Also clear financial error - we'll revalidate below
        delete errors.financial;
      }
      
      setState({
        [field]: value,
        errors
      });
      
      // Update validation summary
      updateValidationSummary(errors);
      
      // Always try to recalculate if no field errors
      // This will revalidate financial logic with new values
      if (!hasErrors(errors)) {
        updateCalculations();
      } else {
        // Clear calculations if field errors exist
        setState({ growthCalculations: null });
      }
    }, 300);
    
    listen(input, 'input', debouncedUpdate);
    listen(input, 'change', debouncedUpdate);
  });
}

/**
 * Update growth calculations based on current state
 */
function updateCalculations() {
  const { marketPrice, currentDividend, requiredReturn, errors } = state;
  
  // Don't calculate if there are validation errors
  if (hasErrors(errors)) {
    setState({ growthCalculations: null });
    return;
  }
  
  try {
    // Calculate growth metrics
    const calculations = calculateGrowthMetrics({
      marketPrice,
      currentDividend,
      requiredReturn
    });
    
    // Validate financial logic
    const allErrors = validateAllInputs(state);
    
    if (hasErrors(allErrors)) {
      setState({ errors: allErrors, growthCalculations: null });
      updateValidationSummary(allErrors);
      return;
    }
    
    // Clear errors and update calculations
    setState({ 
      errors: {},  // Explicitly clear errors
      growthCalculations: calculations 
    });
    updateValidationSummary({});  // Explicitly hide error display
    
  } catch (error) {
    console.error('Calculation error:', error);
    setState({ growthCalculations: null });
  }
}

// =============================================================================
// VIEW TOGGLE (CHART/TABLE)
// =============================================================================

/**
 * Set up chart/table view toggle with arrow key navigation
 */
function setupViewToggle() {
  const chartBtn = $('#chart-view-btn');
  const tableBtn = $('#table-view-btn');
  
  if (!chartBtn || !tableBtn) {
    console.error('Toggle buttons not found');
    return;
  }
  
  // Click handlers
  listen(chartBtn, 'click', () => {
    switchView('chart');
  });
  
  listen(tableBtn, 'click', () => {
    switchView('table');
  });
  
  // Keyboard handlers for Chart button
  listen(chartBtn, 'keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      // Arrow keys: move to table button and switch to table view
      tableBtn.focus();
      switchView('table');
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Enter/Space: activate chart view (this button's view)
      switchView('chart');
    }
  });
  
  // Keyboard handlers for Table button
  listen(tableBtn, 'keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      // Arrow keys: move to chart button and switch to chart view
      chartBtn.focus();
      switchView('chart');
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Enter/Space: activate table view (this button's view)
      switchView('table');
    }
  });
}

/**
 * Switch between chart and table views
 * @param {string} view - 'chart' or 'table'
 */
function switchView(view) {
  const chartBtn = $('#chart-view-btn');
  const tableBtn = $('#table-view-btn');
  const chartContainer = $('#chart-container');
  const tableContainer = $('#table-container');
  const legend = $('#chart-legend');
  const chartNote = $('#chart-note');
  
  // Update state
  setState({ viewMode: view });
  
  // Update button states
  if (view === 'chart') {
    chartBtn.classList.add('active');
    chartBtn.setAttribute('aria-pressed', 'true');
    tableBtn.classList.remove('active');
    tableBtn.setAttribute('aria-pressed', 'false');
    
    // Show chart, hide table
    chartContainer.style.display = 'block';
    tableContainer.style.display = 'none';
    legend.style.display = 'flex';
    if (chartNote) chartNote.style.display = 'block';
    
    // Announce change
    announceToScreenReader('Chart view active');
    
  } else {
    tableBtn.classList.add('active');
    tableBtn.setAttribute('aria-pressed', 'true');
    chartBtn.classList.remove('active');
    chartBtn.setAttribute('aria-pressed', 'false');
    
    // Show table, hide chart
    tableContainer.style.display = 'block';
    chartContainer.style.display = 'none';
    legend.style.display = 'none';
    if (chartNote) chartNote.style.display = 'none';
    
    // Announce change
    announceToScreenReader('Table view active');
  }
}

// =============================================================================
// RENDERING
// =============================================================================

/**
 * Handle state changes and update UI
 * @param {Object} newState - Updated state
 */
function handleStateChange(newState) {
  const { growthCalculations, viewMode } = newState;
  
  if (!growthCalculations) {
    // Clear displays if no calculations
    return;
  }
  
  // Update results section
  renderResults(growthCalculations, {
    marketPrice: newState.marketPrice,
    currentDividend: newState.currentDividend,
    requiredReturn: newState.requiredReturn
  });
  
  // Update dynamic equation
  renderDynamicEquation(growthCalculations, {
    marketPrice: newState.marketPrice,
    currentDividend: newState.currentDividend,
    requiredReturn: newState.requiredReturn
  });
  
  // Update chart if in chart view
  if (viewMode === 'chart') {
    const showLabels = shouldShowLabels();
    renderChart(
      growthCalculations.cashFlows, 
      showLabels, 
      growthCalculations.impliedGrowth
    );
  }
  
  // Always update table (even if hidden)
  renderTable(
    growthCalculations.cashFlows,
    growthCalculations.impliedGrowth
  );
}

// =============================================================================
// WINDOW RESIZE HANDLING
// =============================================================================

/**
 * Set up window resize listener for responsive chart labels
 */
function setupResizeListener() {
  let resizeTimeout;
  
  listen(window, 'resize', () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      handleResponsiveView();
      
      if (state.viewMode === 'chart' && state.growthCalculations) {
        const showLabels = shouldShowLabels();
        renderChart(
          state.growthCalculations.cashFlows, 
          showLabels,
          state.growthCalculations.impliedGrowth
        );
      }
    }, 250);
  });
  
  // Initial check
  handleResponsiveView();
}

/**
 * Handle responsive view switching based on viewport width
 */
function handleResponsiveView() {
  const chartBtn = $('#chart-view-btn');
  const tableBtn = $('#table-view-btn');
  const viewportWidth = window.innerWidth;
  
  // At very narrow widths (< 600px), force table view and disable chart button
  if (viewportWidth < 600) {
    if (state.viewMode === 'chart') {
      switchView('table');
    }
    
    // Disable chart button
    if (chartBtn) {
      chartBtn.disabled = true;
      chartBtn.setAttribute('aria-disabled', 'true');
      chartBtn.title = 'Chart view not available at this screen size';
    }
    if (tableBtn) {
      tableBtn.disabled = false;
      tableBtn.removeAttribute('aria-disabled');
      tableBtn.title = '';
    }
  } else {
    // Re-enable chart button at wider widths
    if (chartBtn) {
      chartBtn.disabled = false;
      chartBtn.removeAttribute('aria-disabled');
      chartBtn.title = '';
    }
  }
}

// =============================================================================
// SELF-TESTS
// =============================================================================

/**
 * Run self-tests to verify calculations
 */
function runSelfTests() {
  console.log('Running self-tests...');
  
  const tests = [
    {
      name: 'Default values (100, 5, 7%)',
      inputs: { marketPrice: 100, currentDividend: 5, requiredReturn: 7 },
      expected: { impliedGrowth: 1.90 } // (0.07*100 - 5)/(100 + 5) = 2/105 = 1.90%
    },
    {
      name: 'Higher growth scenario',
      inputs: { marketPrice: 50, currentDividend: 2, requiredReturn: 10 },
      expected: { impliedGrowth: 5.77 } // (0.1*50 - 2)/(50 + 2) = 3/52 = 5.77%
    },
    {
      name: 'Lower growth scenario',
      inputs: { marketPrice: 100, currentDividend: 3, requiredReturn: 12 },
      expected: { impliedGrowth: 8.74 } // (0.12*100 - 3)/(100 + 3) = 9/103 = 8.74%
    }
  ];
  
  tests.forEach(test => {
    try {
      const result = calculateGrowthMetrics(test.inputs);
      
      if (test.expected.impliedGrowth !== undefined) {
        const diff = Math.abs(result.impliedGrowth - test.expected.impliedGrowth);
        if (diff <= 0.1) {
          console.log(`âœ“ ${test.name} passed`);
        } else {
          console.warn(`✗ ${test.name} failed: expected ${test.expected.impliedGrowth}%, got ${result.impliedGrowth.toFixed(2)}%`);
        }
      }
    } catch (error) {
      console.error(`✗ ${test.name} threw error:`, error);
    }
  });
  
  console.log('Self-tests complete');
}

// =============================================================================
// CLEANUP
// =============================================================================

/**
 * Cleanup function (called on page unload)
 */
function cleanup() {
  destroyChart();
  console.log('Calculator cleanup complete');
}

// Register cleanup
window.addEventListener('beforeunload', cleanup);

// =============================================================================
// START THE APPLICATION
// =============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready
  init();
}

// Export for potential external use
export { state, setState, updateCalculations };