/**
 * Chart Module
 * Chart rendering using Chart.js with keyboard accessibility
 * 
 * Unified Color Scheme:
 * - Orange #b95b1d: Present Value/Current Price (P₀)
 * - Blue #3c6ae5: Periodic Payments (Dividends)
 * - Purple #7a46ff: Rate of Return (r)
 * - Green #15803d: Growth Rates (g)
 */

import { formatCurrency, formatPercentage } from './utils.js';

// Unified color scheme
const COLORS = {
  price: '#b95b1d',       // Orange - Market price (P₀)
  dividend: '#3c6ae5',    // Blue - Dividends (D)
  return: '#7a46ff',      // Purple - Required return (r)
  growth: '#15803d',      // Green - Growth rate (g)
  darkText: '#06005a'
};

let chartInstance = null;
let currentFocusIndex = 0;
let isKeyboardMode = false;

/**
 * Create or update dividend growth chart
 * @param {Array} cashFlows - Array of cash flow objects
 * @param {boolean} showLabels - Whether to show value labels
 * @param {number} growthRate - Implied growth rate percentage
 */
export function renderChart(cashFlows, showLabels = true, growthRate = null) {
  const canvas = document.getElementById('growth-chart');
  
  if (!canvas) {
    console.error('Chart canvas not found');
    return;
  }
  
  // Make canvas focusable and add keyboard navigation
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-roledescription', 'interactive chart');
  canvas.setAttribute(
    'aria-label',
    'Interactive dividend growth chart showing initial investment and projected dividend payments over 10 years. Press Tab to focus, then use Left and Right arrow keys to navigate between years. Home goes to first year, End goes to last year.'
  );

  const ctx = canvas.getContext('2d');
  
  // Prepare data for Chart.js
  const labels = cashFlows.map(cf => cf.year.toString());
  
  // Separate dividend and investment data
  const dividendData = cashFlows.map(cf => cf.dividend);
  const investmentData = cashFlows.map(cf => cf.investment);
  
  // Calculate total for labels
  const totalData = cashFlows.map(cf => cf.totalCashFlow);
  
  // Get required return from first cash flow (it's constant)
  const requiredReturn = growthRate !== null ? 
    parseFloat((dividendData[1] / cashFlows[1].totalCashFlow * 100 + growthRate).toFixed(2)) : 7.40;
  
  // Destroy existing chart instance
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Reset focus index
  currentFocusIndex = 0;
  
  // Create new chart
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Initial investment / Market price',
          data: investmentData,
          backgroundColor: COLORS.price,
          borderWidth: 0,
          stack: 'cashflow',
          yAxisID: 'y',
          order: 1
        },
        {
          label: 'Dividend cash flow',
          data: dividendData,
          backgroundColor: COLORS.dividend,
          borderWidth: 0,
          stack: 'cashflow',
          yAxisID: 'y',
          order: 1
        },
        // Growth rate horizontal line
        {
          label: 'Growth rate (g)',
          data: labels.map(() => growthRate),
          type: 'line',
          borderColor: COLORS.growth,
          borderWidth: 3,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          yAxisID: 'y2',
          order: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      onHover: (event, activeElements) => {
        // Skip if keyboard focus already active
        if (isKeyboardMode && document.activeElement === canvas) return;

        // Announce hovered data point
        if (activeElements.length > 0) {
          const index = activeElements[0].index;
          announceDataPoint(cashFlows[index], totalData[index], growthRate);
        }
      },
      plugins: {
        title: {
          display: false
        },
        legend: {
          display: false // Using custom legend in HTML
        },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            title: (context) => {
              const index = context[0].dataIndex;
              return `Year: ${cashFlows[index].year}`;
            },
            label: (context) => {
              const value = context.parsed.y;
              const index = context.dataIndex;
              const isInitialYear = index === 0;
              
              // Growth rate line
              if (context.dataset.label === 'Growth rate (g)') {
                return `Growth rate (g): ${formatPercentage(value)}`;
              }
              
              // For year 0, show "Initial investment / Market price"
              if (isInitialYear && context.dataset.label === 'Initial investment / Market price') {
                return `Initial investment / Market price (PV_t): ${formatCurrency(value, true)}`;
              }
              
              // Regular labels
              if (context.dataset.label === 'Initial investment / Market price') {
                return `Initial investment / Market price: ${formatCurrency(value, true)}`;
              }
              if (context.dataset.label === 'Dividend cash flow') {
                return `Dividend (Div): ${formatCurrency(value, true)}`;
              }
              
              return `${context.dataset.label}: ${formatCurrency(value, true)}`;
            },
            footer: (context) => {
              const index = context[0].dataIndex;
              const total = totalData[index];
              // Only show total for cash flow bars, not growth line
              if (context[0].dataset.label !== 'Growth rate (g)') {
                return `Total: ${formatCurrency(total, true)}`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Years',
            color: '#000000',
            font: {
              weight: '600'
            }
          },
          ticks: {
            color: '#000000'
          },
          grid: {
            display: false
          },
          border: {
            color: '#000000',
            width: 2
          }
        },
        y: {
          title: {
            display: true,
            text: 'Cash Flows (USD)',
            color: '#000000',
            font: {
              weight: '600'
            }
          },
          position: 'left',
          ticks: {
            callback: function(value) {
              // Format without USD prefix since it's in the axis title
              const absValue = Math.abs(value);
              const formatted = absValue.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              });
              return value < 0 ? `−${formatted}` : formatted;
            },
            color: '#000000',
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          border: {
            color: '#000000',
            width: 2
          }
        },
        y2: {
          title: {
            display: true,
            text: 'Growth Rate',
            color: COLORS.growth,
            font: {
              weight: '600'
            }
          },
          position: 'right',
          min: 0,
          max: growthRate ? Math.max(12, growthRate * 1.5) : 12,
          ticks: {
            callback: function(value) {
              // Return just the number without % sign
              return value.toFixed(1);
            },
            color: COLORS.growth,
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0
          },
          grid: {
            display: false
          },
          border: {
            color: COLORS.growth,
            width: 2
          }
        }
      },
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: showLabels ? 35 : 25, // Extra space for r label
          bottom: 10
        }
      }
    },
    plugins: [{
      // Custom plugin to draw labels on top of stacked bars
      id: 'stackedBarLabels',
      afterDatasetsDraw: (chart) => {
        if (!showLabels) return;
        
        const ctx = chart.ctx;
        ctx.save();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = COLORS.darkText;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const meta0 = chart.getDatasetMeta(0);
        const meta1 = chart.getDatasetMeta(1);
        
        let maxPositiveY = chart.scales.y.top;
        chart.data.labels.forEach((label, index) => {
          const total = totalData[index];
          if (total > 0 && meta0.data[index] && meta1.data[index]) {
            const topY = Math.min(meta0.data[index].y, meta1.data[index].y);
            maxPositiveY = Math.max(maxPositiveY, topY);
          }
        });
        
        chart.data.labels.forEach((label, index) => {
          const total = totalData[index];
          if (Math.abs(total) < 0.01) return;
          
          if (!meta0.data[index] || !meta1.data[index]) return;
          
          const bar0 = meta0.data[index];
          const bar1 = meta1.data[index];
          
          const x = bar1.x;
          let y;
          
          if (total < 0) {
            y = maxPositiveY - 5;
          } else {
            y = Math.min(bar0.y, bar1.y) - 5;
          }
          
          // Format as bare number without USD
          const absValue = Math.abs(total);
          const formatted = absValue.toLocaleString('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          });
          const displayValue = total < 0 ? `−${formatted}` : formatted;
          
          ctx.fillText(displayValue, x, y);
        });
        
        ctx.restore();
      }
    },
    {
      // Custom plugin to draw "g = X.XX%" label
      id: 'gLabel',
      afterDatasetsDraw: (chart) => {
        if (!showLabels) return;
        
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(2); // Growth rate line dataset
        
        if (!meta.data || meta.data.length === 0) return;
        
        // Get chart dimensions
        const chartWidth = chart.width;
        const chartArea = chart.chartArea;
        const centerX = (chartArea.left + chartArea.right) / 2;
        
        ctx.save();
        ctx.font = '600 12px sans-serif';
        
        // Draw g label (growth rate) - centered
        const gLabelText = `g = ${growthRate.toFixed(2)}%`;
        const gTextWidth = ctx.measureText(gLabelText).width;
        const padding = 6;
        const boxWidth = gTextWidth + padding * 2;
        const boxHeight = 20;
        
        // Position g label at center of the line
        const gPoint = meta.data[Math.floor(meta.data.length / 2)];
        const gBoxX = centerX - boxWidth / 2;
        const gBoxY = gPoint.y - boxHeight - 8;
        
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(gBoxX, gBoxY, boxWidth, boxHeight);
        
        // Green border
        ctx.strokeStyle = COLORS.growth;
        ctx.lineWidth = 2;
        ctx.strokeRect(gBoxX, gBoxY, boxWidth, boxHeight);
        
        // Green text
        ctx.fillStyle = COLORS.growth;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gLabelText, centerX, gBoxY + boxHeight / 2);
        
        ctx.restore();
      }
    },
    {
      // Keyboard focus highlight plugin
      id: 'keyboardFocus',
      afterDatasetsDraw: (chart) => {
        if (document.activeElement !== canvas) return;
        
        const ctx = chart.ctx;
        const meta0 = chart.getDatasetMeta(0);
        const meta1 = chart.getDatasetMeta(1);
        
        if (!meta0.data[currentFocusIndex] || !meta1.data[currentFocusIndex]) return;
        
        const bar0 = meta0.data[currentFocusIndex];
        const bar1 = meta1.data[currentFocusIndex];
        
        const allYValues = [bar0.y, bar0.base, bar1.y, bar1.base];
        const topY = Math.min(...allYValues);
        const bottomY = Math.max(...allYValues);
        
        ctx.save();
        ctx.strokeStyle = COLORS.darkText;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        
        const x = bar1.x - bar1.width / 2 - 4;
        const y = topY - 4;
        const width = bar1.width + 8;
        const height = bottomY - topY + 8;
        
        ctx.strokeRect(x, y, width, height);
        ctx.restore();
      }
    }]
  });
  
  // Add keyboard navigation
  setupKeyboardNavigation(canvas, cashFlows, totalData, growthRate, requiredReturn);
}

/**
 * Setup keyboard navigation for the chart
 */
function setupKeyboardNavigation(canvas, cashFlows, totalData, growthRate, requiredReturn) {
  const oldListener = canvas._keydownListener;
  if (oldListener) {
    canvas.removeEventListener('keydown', oldListener);
  }
  
  const keydownListener = (e) => {
    const maxIndex = cashFlows.length - 1;
    let newIndex = currentFocusIndex;
    
    isKeyboardMode = true;
    
    switch(e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(currentFocusIndex + 1, maxIndex);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(currentFocusIndex - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = maxIndex;
        break;
      default:
        return;
    }
    
    if (newIndex !== currentFocusIndex) {
      currentFocusIndex = newIndex;
      chartInstance.update('none');
      announceDataPoint(cashFlows[currentFocusIndex], totalData[currentFocusIndex], growthRate);
      showTooltipAtIndex(currentFocusIndex);
    }
  };
  
  canvas._keydownListener = keydownListener;
  canvas.addEventListener('keydown', keydownListener);
  
  const focusListener = () => {
    isKeyboardMode = true;
    showTooltipAtIndex(currentFocusIndex);
    announceDataPoint(cashFlows[currentFocusIndex], totalData[currentFocusIndex], growthRate);
  };
  
  const blurListener = () => {
    chartInstance.tooltip.setActiveElements([], {x: 0, y: 0});
    chartInstance.update('none');
  };
  
  canvas._focusListener = focusListener;
  canvas._blurListener = blurListener;
  canvas.addEventListener('focus', focusListener);
  canvas.addEventListener('blur', blurListener);
  
  const mouseMoveListener = () => {
    isKeyboardMode = false;
  };
  
  canvas._mouseMoveListener = mouseMoveListener;
  canvas.addEventListener('mousemove', mouseMoveListener);
}

/**
 * Show tooltip at a specific data index
 */
function showTooltipAtIndex(index) {
  if (!chartInstance) return;
  
  const meta0 = chartInstance.getDatasetMeta(0);
  const meta1 = chartInstance.getDatasetMeta(1);
  
  if (!meta0.data[index] || !meta1.data[index]) return;
  
  chartInstance.tooltip.setActiveElements([
    {datasetIndex: 0, index: index},
    {datasetIndex: 1, index: index}
  ], {
    x: meta1.data[index].x,
    y: meta1.data[index].y
  });
  
  chartInstance.update('none');
}

/**
 * Announce data point for screen readers
 */
function announceDataPoint(cashFlow, total, growthRate) {
  let liveRegion = document.getElementById('chart-live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'chart-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  const isInitialYear = cashFlow.year === 0;
  const investmentLabel = isInitialYear ? 'Initial investment / Market price (PV_t)' : 'No investment';
  
  const announcement = `Year ${cashFlow.year}. ` +
    `Growth rate (g): ${growthRate ? formatPercentage(growthRate) : '0%'}. ` +
    `${investmentLabel}: ${formatCurrency(cashFlow.investment, true)}. ` +
    `Dividend (Div): ${formatCurrency(cashFlow.dividend, true)}. ` +
    `Total: ${formatCurrency(total, true)}.`;
  
  liveRegion.textContent = announcement;
}

/**
 * Update chart visibility based on window width
 * @returns {boolean} True if labels should be shown
 */
export function shouldShowLabels() {
  return window.innerWidth > 860;
}

/**
 * Cleanup chart resources
 */
export function destroyChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}