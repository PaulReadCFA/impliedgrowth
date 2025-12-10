/**
 * Implied Growth Calculations Module
 * Pure functions for Gordon Growth Model mathematics
 */

/**
 * Calculate implied growth rate using Gordon Growth Model
 * Formula: g = r - (D₁ / P₀)
 * 
 * @param {Object} params - Model parameters
 * @param {number} params.marketPrice - Current market price (P₀)
 * @param {number} params.currentDividend - Current dividend (D₀)
 * @param {number} params.requiredReturn - Required return (r, as percentage)
 * @param {number} params.expectedDividend - Expected next dividend (D₁)
 * @returns {Object} Calculation results
 */
export function calculateImpliedGrowth({ marketPrice, currentDividend, requiredReturn, expectedDividend }) {
  // Convert required return from percentage to decimal
  const r = requiredReturn / 100;
  
  // Calculate implied growth rate
  // g = r - (D₁ / P₀)
  const impliedGrowth = r - (expectedDividend / marketPrice);
  
  // Calculate what D₁ should be based on D₀ and implied growth
  // D₁ = D₀ × (1 + g)
  const calculatedD1 = currentDividend * (1 + impliedGrowth);
  
  // Check consistency between expected D₁ and calculated D₁
  const d1Consistent = Math.abs(expectedDividend - calculatedD1) < 0.01;
  
  // Calculate dividend yield
  const dividendYield = (expectedDividend / marketPrice) * 100;
  
  return {
    impliedGrowth: impliedGrowth * 100, // Convert to percentage
    impliedGrowthDecimal: impliedGrowth,
    calculatedD1,
    d1Consistent,
    dividendYield,
    isValid: impliedGrowth < r && impliedGrowth >= 0
  };
}

/**
 * Generate dividend cash flow projections
 * @param {Object} params - Calculation parameters
 * @param {number} params.marketPrice - Initial investment
 * @param {number} params.currentDividend - Current dividend (D₀)
 * @param {number} params.impliedGrowthDecimal - Growth rate (as decimal)
 * @param {number} params.years - Number of years to project (default 10)
 * @returns {Array} Array of cash flow objects
 */
export function generateCashFlows({ marketPrice, currentDividend, impliedGrowthDecimal, years = 10 }) {
  const cashFlows = [];
  
  // Year 0: Initial investment (negative cash flow)
  cashFlows.push({
    year: 0,
    dividend: 0,
    investment: -marketPrice,
    totalCashFlow: -marketPrice,
    cumulativeCashFlow: -marketPrice
  });
  
  // Years 1 to n: Dividend payments growing at rate g
  let cumulativeTotal = -marketPrice;
  
  for (let year = 1; year <= years; year++) {
    // D_t = D₀ × (1 + g)^t
    const dividend = currentDividend * Math.pow(1 + impliedGrowthDecimal, year);
    cumulativeTotal += dividend;
    
    cashFlows.push({
      year,
      dividend,
      investment: 0,
      totalCashFlow: dividend,
      cumulativeCashFlow: cumulativeTotal
    });
  }
  
  return cashFlows;
}

/**
 * Calculate all growth model metrics
 * @param {Object} params - Input parameters from state
 * @returns {Object} Complete growth calculations
 */
export function calculateGrowthMetrics(params) {
  const { marketPrice, currentDividend, requiredReturn, expectedDividend } = params;
  
  // Calculate implied growth
  const growthData = calculateImpliedGrowth({
    marketPrice,
    currentDividend,
    requiredReturn,
    expectedDividend
  });
  
  // Generate cash flow projections
  const cashFlows = generateCashFlows({
    marketPrice,
    currentDividend,
    impliedGrowthDecimal: growthData.impliedGrowthDecimal,
    years: 10
  });
  
  return {
    ...growthData,
    cashFlows
  };
}

/**
 * Calculate stock price using Gordon Growth Model (for reference)
 * P₀ = D₁ / (r - g)
 * 
 * @param {number} d1 - Next dividend
 * @param {number} r - Required return (decimal)
 * @param {number} g - Growth rate (decimal)
 * @returns {number} Theoretical stock price
 */
export function calculateGordonPrice(d1, r, g) {
  if (g >= r) {
    throw new Error('Growth rate must be less than required return');
  }
  return d1 / (r - g);
}
