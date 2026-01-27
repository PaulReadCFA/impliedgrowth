/**
 * Implied Growth Calculations Module
 * Pure functions for Gordon Growth Model mathematics
 */

/**
 * Calculate implied growth rate using Gordon Growth Model
 * 
 * Starting from the curriculum formula:
 *   g = r - Div_t(1+g)/PV_t
 * 
 * Solving for g algebraically:
 *   g = r - Div_t/PV_t - Div_t*g/PV_t
 *   g + Div_t*g/PV_t = r - Div_t/PV_t
 *   g(1 + Div_t/PV_t) = r - Div_t/PV_t
 *   g(PV_t + Div_t)/PV_t = (r*PV_t - Div_t)/PV_t
 *   g = (r*PV_t - Div_t) / (PV_t + Div_t)
 * 
 * @param {Object} params - Model parameters
 * @param {number} params.marketPrice - Current market price (PV_t)
 * @param {number} params.currentDividend - Current dividend (Div_t)
 * @param {number} params.requiredReturn - Required return (r, as percentage)
 * @returns {Object} Calculation results
 */
export function calculateImpliedGrowth({ marketPrice, currentDividend, requiredReturn }) {
  // Convert required return from percentage to decimal
  const r = requiredReturn / 100;
  
  // Calculate implied growth rate using solved formula
  // g = (r*PV_t - Div_t) / (PV_t + Div_t)
  const impliedGrowth = (r * marketPrice - currentDividend) / (marketPrice + currentDividend);
  
  // Calculate what Div_{t+1} should be based on Div_t and implied growth
  // Div_{t+1} = Div_t × (1 + g)
  const expectedD1 = currentDividend * (1 + impliedGrowth);
  
  // Calculate dividend yield (based on Div_{t+1})
  const dividendYield = (expectedD1 / marketPrice) * 100;
  
  return {
    impliedGrowth: impliedGrowth * 100, // Convert to percentage
    impliedGrowthDecimal: impliedGrowth,
    expectedD1,
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
  const { marketPrice, currentDividend, requiredReturn } = params;
  
  // Calculate implied growth
  const growthData = calculateImpliedGrowth({
    marketPrice,
    currentDividend,
    requiredReturn
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