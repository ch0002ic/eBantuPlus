/**
 * LAB eBantu Formula Calculations
 * Based on official LAB eBantu logic for SMU hackathon PDF requirements
 */

export interface FormulaResult {
  amount: number
  lowerRange: number
  upperRange: number
  isHighIncome: boolean
  shouldSeekLegalAdvice: boolean
}

export interface NafkahIddahResult extends FormulaResult {
  monthlyAmount: number
}

export interface MutaahResult extends FormulaResult {
  dailyAmount: number
  monthlyAmount: number
}

// Business constants from LAB eBantu logic
const HIGH_INCOME_THRESHOLD = 4000 // SGD per month
const NAFKAH_IDDAH_COEFFICIENT = 0.14
const NAFKAH_IDDAH_BASE = 47
const NAFKAH_IDDAH_LOWER_OFFSET = -3
const NAFKAH_IDDAH_UPPER_OFFSET = 197

const MUTAAH_COEFFICIENT = 0.00096
const MUTAAH_BASE = 0.85
const MUTAAH_LOWER_OFFSET = -0.15
const MUTAAH_UPPER_OFFSET = 1.85

/**
 * Round to nearest hundred for Nafkah Iddah amounts
 */
function roundToNearestHundred(value: number): number {
  return Math.round(value / 100) * 100
}

/**
 * Round to nearest integer for Mutaah amounts
 */
function roundToNearestInteger(value: number): number {
  return Math.round(value)
}

/**
 * Calculate Nafkah Iddah (Wife Maintenance, Per Month)
 * Formula: Amount per month = 0.14 × salary + 47
 * Lower range: 0.14 × salary – 3 (rounded to nearest hundred; lower bound not less than 0)
 * Upper range: 0.14 × salary + 197 (rounded to nearest hundred)
 */
export function calculateNafkahIddah(monthlySalary: number): NafkahIddahResult {
  // Business rule: If salary = 0, Iddah amount = 0
  if (monthlySalary === 0) {
    return {
      amount: 0,
      monthlyAmount: 0,
      lowerRange: 0,
      upperRange: 0,
      isHighIncome: false,
      shouldSeekLegalAdvice: false
    }
  }

  // Business rule: If salary > $4,000, do not calculate—refer to legal advice
  if (monthlySalary > HIGH_INCOME_THRESHOLD) {
    return {
      amount: 0,
      monthlyAmount: 0,
      lowerRange: 0,
      upperRange: 0,
      isHighIncome: true,
      shouldSeekLegalAdvice: true
    }
  }

  // Primary formula calculation
  const rawAmount = NAFKAH_IDDAH_COEFFICIENT * monthlySalary + NAFKAH_IDDAH_BASE
  
  // Business rule: If formula output < 0, Iddah amount = 0
  const amount = rawAmount < 0 ? 0 : rawAmount

  // Range calculations
  const rawLowerRange = NAFKAH_IDDAH_COEFFICIENT * monthlySalary + NAFKAH_IDDAH_LOWER_OFFSET
  const rawUpperRange = NAFKAH_IDDAH_COEFFICIENT * monthlySalary + NAFKAH_IDDAH_UPPER_OFFSET

  // Apply rounding and lower bound constraints
  const lowerRange = Math.max(0, roundToNearestHundred(rawLowerRange)) // Business rule: If lower range < 0, set it to 0
  const upperRange = roundToNearestHundred(rawUpperRange)

  return {
    amount: roundToNearestHundred(amount),
    monthlyAmount: roundToNearestHundred(amount),
    lowerRange,
    upperRange,
    isHighIncome: false,
    shouldSeekLegalAdvice: false
  }
}

/**
 * Calculate Mutaah (Consolatory Gift, Per Day)
 * Formula: Amount per day = 0.00096 × salary + 0.85 (rounded to nearest integer)
 * Lower range: 0.00096 × salary – 0.15 (rounded to nearest integer)
 * Upper range: 0.00096 × salary + 1.85 (rounded to nearest integer)
 */
export function calculateMutaah(monthlySalary: number): MutaahResult {
  // Business rule: If salary = 0, Mutaah amount = 0
  if (monthlySalary === 0) {
    return {
      amount: 0,
      dailyAmount: 0,
      monthlyAmount: 0,
      lowerRange: 0,
      upperRange: 0,
      isHighIncome: false,
      shouldSeekLegalAdvice: false
    }
  }

  // Business rule: If salary > $4,000, do not calculate—refer to legal advice
  if (monthlySalary > HIGH_INCOME_THRESHOLD) {
    return {
      amount: 0,
      dailyAmount: 0,
      monthlyAmount: 0,
      lowerRange: 0,
      upperRange: 0,
      isHighIncome: true,
      shouldSeekLegalAdvice: true
    }
  }

  // Primary formula calculation
  const rawDailyAmount = MUTAAH_COEFFICIENT * monthlySalary + MUTAAH_BASE
  
  // Business rule: If formula output < 0, Mutaah amount = 0
  const dailyAmount = rawDailyAmount < 0 ? 0 : roundToNearestInteger(rawDailyAmount)

  // Range calculations
  const rawLowerRange = MUTAAH_COEFFICIENT * monthlySalary + MUTAAH_LOWER_OFFSET
  const rawUpperRange = MUTAAH_COEFFICIENT * monthlySalary + MUTAAH_UPPER_OFFSET

  // Apply rounding and constraints
  const lowerRange = Math.max(0, roundToNearestInteger(rawLowerRange))
  const upperRange = roundToNearestInteger(rawUpperRange)

  // Calculate monthly equivalent (30 days)
  const monthlyAmount = dailyAmount * 30

  return {
    amount: dailyAmount,
    dailyAmount,
    monthlyAmount,
    lowerRange,
    upperRange,
    isHighIncome: false,
    shouldSeekLegalAdvice: false
  }
}

/**
 * Calculate both Nafkah Iddah and Mutaah for a given salary
 */
export function calculateBothFormulas(monthlySalary: number) {
  const nafkahIddah = calculateNafkahIddah(monthlySalary)
  const mutaah = calculateMutaah(monthlySalary)

  return {
    salary: monthlySalary,
    nafkahIddah,
    mutaah,
    totalMonthlySupport: nafkahIddah.monthlyAmount + mutaah.monthlyAmount,
    isHighIncome: monthlySalary > HIGH_INCOME_THRESHOLD,
    shouldSeekLegalAdvice: monthlySalary > HIGH_INCOME_THRESHOLD
  }
}

/**
 * Validate if a salary falls within acceptable calculation range
 */
export function isValidSalaryForCalculation(monthlySalary: number): {
  isValid: boolean
  reason?: string
} {
  if (monthlySalary < 0) {
    return { isValid: false, reason: 'Salary cannot be negative' }
  }
  
  if (monthlySalary > HIGH_INCOME_THRESHOLD) {
    return { isValid: false, reason: 'High income case (>$4,000) - refer to legal advice' }
  }

  return { isValid: true }
}

/**
 * Format currency for Singapore Dollar
 */
export function formatSGD(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Generate formula explanation text
 */
export function getFormulaExplanation(type: 'nafkah' | 'mutaah'): string {
  if (type === 'nafkah') {
    return `Nafkah Iddah = 0.14 × monthly salary + 47 (rounded to nearest hundred)
Lower bound: 0.14 × salary - 3 (minimum 0)
Upper bound: 0.14 × salary + 197
Note: No calculation for salary > $4,000 (seek legal advice)`
  } else {
    return `Mutaah = 0.00096 × monthly salary + 0.85 (rounded to nearest integer)
Lower bound: 0.00096 × salary - 0.15
Upper bound: 0.00096 × salary + 1.85
Note: No calculation for salary > $4,000 (seek legal advice)`
  }
}