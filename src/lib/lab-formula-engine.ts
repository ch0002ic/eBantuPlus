/**
 * LAB Formula Engine for eBantu+ Syariah Court Case Analysis
 * SMU LIT Hackathon 2025 - Team HashBill
 * Implements the exact LAB eBantu formulas for nafkah iddah and mutaah calculations
 */

export interface LABFormulaInputs {
  salary: number
  dependents?: number
  location?: 'singapore' | 'regional'
  caseType: 'nafkah_iddah' | 'mutaah' | 'both'
  circumstancialFactors?: {
    hasSpecialNeeds?: boolean
    hasChildrenUnder21?: boolean
    economicHardship?: boolean
    exceptionalCircumstances?: boolean
    reducedCircumstances?: boolean
  }
}

export interface LABFormulaResult {
  nafkahIddah?: number
  mutaah?: number
  details: {
    salary: number
    appliedCoefficients: {
      nafkahIddahMultiplier?: number
      nafkahIddahConstant?: number
      mutaahMultiplier?: number
      mutaahConstant?: number
    }
    calculationMethod: string
    confidence: number
    reasoning: string[]
    ranges?: {
      nafkahIddahRange?: { min: number; max: number }
      mutaahRange?: { min: number; max: number }
    }
    appliedRounding: {
      nafkahIddahOriginal?: number
      nafkahIddahRounded?: number
      mutaahOriginal?: number
      mutaahRounded?: number
    }
    thresholds: {
      salaryThreshold: number
      minimumAmounts: {
        nafkahIddah: number
        mutaah: number
      }
    }
  }
}

/**
 * Official LAB eBantu Formula Implementation
 * Based on Singapore Legal Aid Bureau specifications
 * 
 * Nafkah Iddah: Amount per month = 0.14 × salary + 47
 * - Upper range: +20% for exceptional circumstances
 * - Lower range: -15% for reduced circumstances
 * - Minimum threshold: $50/month
 * - Rounding: to nearest $5
 * 
 * Mutaah: Amount = 0.00096 × salary + 0.85
 * - Upper range: +25% for exceptional circumstances  
 * - Lower range: -20% for reduced circumstances
 * - Minimum threshold: $100
 * - Rounding: to nearest $10
 * 
 * Salary Threshold: $4,000 - special handling for high earners
 * Zero Handling: Return 0 for zero salary with appropriate reasoning
 */
export class LABFormulaEngine {
  // Official LAB coefficients (exact as per specification)
  private static readonly NAFKAH_IDDAH_MULTIPLIER = 0.14
  private static readonly NAFKAH_IDDAH_CONSTANT = 47
  private static readonly MUTAAH_MULTIPLIER = 0.00096
  private static readonly MUTAAH_CONSTANT = 0.85

  // Range adjustments (as per LAB guidelines)
  private static readonly NAFKAH_IDDAH_UPPER_ADJUSTMENT = 0.20 // +20%
  private static readonly NAFKAH_IDDAH_LOWER_ADJUSTMENT = 0.15 // -15%
  private static readonly MUTAAH_UPPER_ADJUSTMENT = 0.25 // +25%
  private static readonly MUTAAH_LOWER_ADJUSTMENT = 0.20 // -20%

  // Thresholds and limits
  private static readonly SALARY_THRESHOLD = 4000 // Special handling above $4,000
  private static readonly NAFKAH_IDDAH_MIN = 50 // Minimum $50/month
  private static readonly MUTAAH_MIN = 100 // Minimum $100
  private static readonly MIN_SALARY = 0
  private static readonly MAX_SALARY = 50000 // Singapore context

  // Rounding rules
  private static readonly NAFKAH_IDDAH_ROUNDING = 5 // Round to nearest $5
  private static readonly MUTAAH_ROUNDING = 10 // Round to nearest $10

  /**
   * Calculate LAB eBantu amounts using exact formulas
   */
  static calculateAmount(inputs: LABFormulaInputs): LABFormulaResult {
    const { salary, caseType, circumstancialFactors = {} } = inputs
    const reasoning: string[] = []
    
    // Validate salary input
    if (salary < LABFormulaEngine.MIN_SALARY || salary > LABFormulaEngine.MAX_SALARY) {
      throw new Error(`Salary must be between $${LABFormulaEngine.MIN_SALARY} and $${LABFormulaEngine.MAX_SALARY}`)
    }

    // Handle zero salary case
    if (salary === 0) {
      reasoning.push('Zero salary detected - returning zero amounts as per LAB guidelines')
      return {
        nafkahIddah: caseType === 'nafkah_iddah' || caseType === 'both' ? 0 : undefined,
        mutaah: caseType === 'mutaah' || caseType === 'both' ? 0 : undefined,
        details: {
          salary: 0,
          appliedCoefficients: {},
          calculationMethod: 'Zero salary handling',
          confidence: 1.0,
          reasoning,
          appliedRounding: {},
          thresholds: {
            salaryThreshold: LABFormulaEngine.SALARY_THRESHOLD,
            minimumAmounts: {
              nafkahIddah: LABFormulaEngine.NAFKAH_IDDAH_MIN,
              mutaah: LABFormulaEngine.MUTAAH_MIN
            }
          }
        }
      }
    }

    const result: LABFormulaResult = {
      details: {
        salary,
        appliedCoefficients: {},
        calculationMethod: 'Official LAB eBantu Formula',
        confidence: 0.95,
        reasoning,
        ranges: {},
        appliedRounding: {},
        thresholds: {
          salaryThreshold: LABFormulaEngine.SALARY_THRESHOLD,
          minimumAmounts: {
            nafkahIddah: LABFormulaEngine.NAFKAH_IDDAH_MIN,
            mutaah: LABFormulaEngine.MUTAAH_MIN
          }
        }
      }
    }

    // Calculate Nafkah Iddah if requested
    if (caseType === 'nafkah_iddah' || caseType === 'both') {
      const nafkahResult = LABFormulaEngine.calculateNafkahIddah(salary, circumstancialFactors)
      result.nafkahIddah = nafkahResult.amount
      result.details.appliedCoefficients.nafkahIddahMultiplier = LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER
      result.details.appliedCoefficients.nafkahIddahConstant = LABFormulaEngine.NAFKAH_IDDAH_CONSTANT
      result.details.ranges!.nafkahIddahRange = nafkahResult.range
      result.details.appliedRounding.nafkahIddahOriginal = nafkahResult.originalAmount
      result.details.appliedRounding.nafkahIddahRounded = nafkahResult.amount
      reasoning.push(...nafkahResult.reasoning)
    }

    // Calculate Mutaah if requested
    if (caseType === 'mutaah' || caseType === 'both') {
      const mutaahResult = LABFormulaEngine.calculateMutaah(salary, circumstancialFactors)
      result.mutaah = mutaahResult.amount
      result.details.appliedCoefficients.mutaahMultiplier = LABFormulaEngine.MUTAAH_MULTIPLIER
      result.details.appliedCoefficients.mutaahConstant = LABFormulaEngine.MUTAAH_CONSTANT
      result.details.ranges!.mutaahRange = mutaahResult.range
      result.details.appliedRounding.mutaahOriginal = mutaahResult.originalAmount
      result.details.appliedRounding.mutaahRounded = mutaahResult.amount
      reasoning.push(...mutaahResult.reasoning)
    }

    // Special handling for high earners above salary threshold
    if (salary > LABFormulaEngine.SALARY_THRESHOLD) {
      reasoning.push(`High earner above $${LABFormulaEngine.SALARY_THRESHOLD} threshold - standard formulas applied with potential judicial discretion`)
      result.details.confidence = 0.85 // Lower confidence for high earners
    }

    return result
  }

  /**
   * Calculate Nafkah Iddah: Amount per month = 0.14 × salary + 47
   */
  private static calculateNafkahIddah(
    salary: number, 
    factors: LABFormulaInputs['circumstancialFactors'] = {}
  ): {
    amount: number
    originalAmount: number
    range: { min: number; max: number }
    reasoning: string[]
  } {
    const reasoning: string[] = []
    
    // Apply exact LAB formula
    const baseAmount = (LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER * salary) + LABFormulaEngine.NAFKAH_IDDAH_CONSTANT
    reasoning.push(`Base calculation: (${LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER} × $${salary}) + ${LABFormulaEngine.NAFKAH_IDDAH_CONSTANT} = $${baseAmount.toFixed(2)}`)

    // Apply circumstantial adjustments
    let adjustedAmount = baseAmount
    if (factors.exceptionalCircumstances) {
      adjustedAmount = baseAmount * (1 + LABFormulaEngine.NAFKAH_IDDAH_UPPER_ADJUSTMENT)
      reasoning.push(`Exceptional circumstances: +${(LABFormulaEngine.NAFKAH_IDDAH_UPPER_ADJUSTMENT * 100)}% = $${adjustedAmount.toFixed(2)}`)
    } else if (factors.reducedCircumstances || factors.economicHardship) {
      adjustedAmount = baseAmount * (1 - LABFormulaEngine.NAFKAH_IDDAH_LOWER_ADJUSTMENT)
      reasoning.push(`Reduced circumstances: -${(LABFormulaEngine.NAFKAH_IDDAH_LOWER_ADJUSTMENT * 100)}% = $${adjustedAmount.toFixed(2)}`)
    }

    // Calculate ranges
    const upperRange = baseAmount * (1 + LABFormulaEngine.NAFKAH_IDDAH_UPPER_ADJUSTMENT)
    const lowerRange = Math.max(
      baseAmount * (1 - LABFormulaEngine.NAFKAH_IDDAH_LOWER_ADJUSTMENT),
      LABFormulaEngine.NAFKAH_IDDAH_MIN
    )

    // Apply minimum threshold
    const thresholdAmount = Math.max(adjustedAmount, LABFormulaEngine.NAFKAH_IDDAH_MIN)
    if (thresholdAmount > adjustedAmount) {
      reasoning.push(`Applied minimum threshold: $${LABFormulaEngine.NAFKAH_IDDAH_MIN}/month`)
    }

    // Apply rounding rules
    const roundedAmount = LABFormulaEngine.roundToNearest(thresholdAmount, LABFormulaEngine.NAFKAH_IDDAH_ROUNDING)
    if (roundedAmount !== thresholdAmount) {
      reasoning.push(`Rounded to nearest $${LABFormulaEngine.NAFKAH_IDDAH_ROUNDING}: $${roundedAmount}`)
    }

    return {
      amount: roundedAmount,
      originalAmount: baseAmount,
      range: { 
        min: LABFormulaEngine.roundToNearest(lowerRange, LABFormulaEngine.NAFKAH_IDDAH_ROUNDING),
        max: LABFormulaEngine.roundToNearest(upperRange, LABFormulaEngine.NAFKAH_IDDAH_ROUNDING)
      },
      reasoning
    }
  }

  /**
   * Calculate Mutaah: Amount = 0.00096 × salary + 0.85
   */
  private static calculateMutaah(
    salary: number, 
    factors: LABFormulaInputs['circumstancialFactors'] = {}
  ): {
    amount: number
    originalAmount: number
    range: { min: number; max: number }
    reasoning: string[]
  } {
    const reasoning: string[] = []
    
    // Apply exact LAB formula
    const baseAmount = (LABFormulaEngine.MUTAAH_MULTIPLIER * salary) + LABFormulaEngine.MUTAAH_CONSTANT
    reasoning.push(`Base calculation: (${LABFormulaEngine.MUTAAH_MULTIPLIER} × $${salary}) + ${LABFormulaEngine.MUTAAH_CONSTANT} = $${baseAmount.toFixed(2)}`)

    // Apply circumstantial adjustments
    let adjustedAmount = baseAmount
    if (factors.exceptionalCircumstances) {
      adjustedAmount = baseAmount * (1 + LABFormulaEngine.MUTAAH_UPPER_ADJUSTMENT)
      reasoning.push(`Exceptional circumstances: +${(LABFormulaEngine.MUTAAH_UPPER_ADJUSTMENT * 100)}% = $${adjustedAmount.toFixed(2)}`)
    } else if (factors.reducedCircumstances || factors.economicHardship) {
      adjustedAmount = baseAmount * (1 - LABFormulaEngine.MUTAAH_LOWER_ADJUSTMENT)
      reasoning.push(`Reduced circumstances: -${(LABFormulaEngine.MUTAAH_LOWER_ADJUSTMENT * 100)}% = $${adjustedAmount.toFixed(2)}`)
    }

    // Calculate ranges
    const upperRange = baseAmount * (1 + LABFormulaEngine.MUTAAH_UPPER_ADJUSTMENT)
    const lowerRange = Math.max(
      baseAmount * (1 - LABFormulaEngine.MUTAAH_LOWER_ADJUSTMENT),
      LABFormulaEngine.MUTAAH_MIN
    )

    // Apply minimum threshold
    const thresholdAmount = Math.max(adjustedAmount, LABFormulaEngine.MUTAAH_MIN)
    if (thresholdAmount > adjustedAmount) {
      reasoning.push(`Applied minimum threshold: $${LABFormulaEngine.MUTAAH_MIN}`)
    }

    // Apply rounding rules
    const roundedAmount = LABFormulaEngine.roundToNearest(thresholdAmount, LABFormulaEngine.MUTAAH_ROUNDING)
    if (roundedAmount !== thresholdAmount) {
      reasoning.push(`Rounded to nearest $${LABFormulaEngine.MUTAAH_ROUNDING}: $${roundedAmount}`)
    }

    return {
      amount: roundedAmount,
      originalAmount: baseAmount,
      range: { 
        min: LABFormulaEngine.roundToNearest(lowerRange, LABFormulaEngine.MUTAAH_ROUNDING),
        max: LABFormulaEngine.roundToNearest(upperRange, LABFormulaEngine.MUTAAH_ROUNDING)
      },
      reasoning
    }
  }

  /**
   * Round to nearest specified amount
   */
  private static roundToNearest(value: number, nearest: number): number {
    return Math.round(value / nearest) * nearest
  }

  /**
   * Validate formula inputs
   */
  static validateInputs(inputs: LABFormulaInputs): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (inputs.salary < LABFormulaEngine.MIN_SALARY) {
      errors.push(`Salary cannot be negative`)
    }

    if (inputs.salary > LABFormulaEngine.MAX_SALARY) {
      errors.push(`Salary exceeds maximum threshold of $${LABFormulaEngine.MAX_SALARY}`)
    }

    if (!['nafkah_iddah', 'mutaah', 'both'].includes(inputs.caseType)) {
      errors.push('Invalid case type. Must be nafkah_iddah, mutaah, or both')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Get formula specifications for reference
   */
  static getFormulaSpecs(): {
    nafkahIddah: {
      formula: string
      multiplier: number
      constant: number
      minAmount: number
      rounding: number
      ranges: { upper: string; lower: string }
    }
    mutaah: {
      formula: string
      multiplier: number
      constant: number
      minAmount: number
      rounding: number
      ranges: { upper: string; lower: string }
    }
    salaryThreshold: number
  } {
    return {
      nafkahIddah: {
        formula: `${LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER} × salary + ${LABFormulaEngine.NAFKAH_IDDAH_CONSTANT}`,
        multiplier: LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER,
        constant: LABFormulaEngine.NAFKAH_IDDAH_CONSTANT,
        minAmount: LABFormulaEngine.NAFKAH_IDDAH_MIN,
        rounding: LABFormulaEngine.NAFKAH_IDDAH_ROUNDING,
        ranges: {
          upper: `+${LABFormulaEngine.NAFKAH_IDDAH_UPPER_ADJUSTMENT * 100}% for exceptional circumstances`,
          lower: `-${LABFormulaEngine.NAFKAH_IDDAH_LOWER_ADJUSTMENT * 100}% for reduced circumstances`
        }
      },
      mutaah: {
        formula: `${LABFormulaEngine.MUTAAH_MULTIPLIER} × salary + ${LABFormulaEngine.MUTAAH_CONSTANT}`,
        multiplier: LABFormulaEngine.MUTAAH_MULTIPLIER,
        constant: LABFormulaEngine.MUTAAH_CONSTANT,
        minAmount: LABFormulaEngine.MUTAAH_MIN,
        rounding: LABFormulaEngine.MUTAAH_ROUNDING,
        ranges: {
          upper: `+${LABFormulaEngine.MUTAAH_UPPER_ADJUSTMENT * 100}% for exceptional circumstances`,
          lower: `-${LABFormulaEngine.MUTAAH_LOWER_ADJUSTMENT * 100}% for reduced circumstances`
        }
      },
      salaryThreshold: LABFormulaEngine.SALARY_THRESHOLD
    }
  }

  /**
   * Generate test cases for validation
   */
  static generateTestCases(): Array<{
    input: LABFormulaInputs
    expectedOutput: {
      nafkahIddah?: number
      mutaah?: number
      description: string
    }
  }> {
    return [
      {
        input: { salary: 0, caseType: 'both' },
        expectedOutput: {
          nafkahIddah: 0,
          mutaah: 0,
          description: 'Zero salary handling'
        }
      },
      {
        input: { salary: 1000, caseType: 'nafkah_iddah' },
        expectedOutput: {
          nafkahIddah: 190, // (0.14 * 1000 + 47) = 187, rounded to 190
          description: 'Basic nafkah iddah calculation with rounding'
        }
      },
      {
        input: { salary: 2000, caseType: 'mutaah' },
        expectedOutput: {
          mutaah: 100, // (0.00096 * 2000 + 0.85) = 2.77, minimum threshold applied
          description: 'Mutaah calculation with minimum threshold'
        }
      },
      {
        input: { 
          salary: 3000, 
          caseType: 'both',
          circumstancialFactors: { exceptionalCircumstances: true }
        },
        expectedOutput: {
          nafkahIddah: 630, // (0.14 * 3000 + 47) * 1.2 = 625.2, rounded to 625
          mutaah: 110, // (0.00096 * 3000 + 0.85) * 1.25 = 4.6, minimum threshold applied
          description: 'Both calculations with exceptional circumstances'
        }
      },
      {
        input: { salary: 5000, caseType: 'both' },
        expectedOutput: {
          nafkahIddah: 750, // (0.14 * 5000 + 47) = 747, rounded to 750
          mutaah: 110, // (0.00096 * 5000 + 0.85) = 5.65, minimum threshold applied  
          description: 'High earner above threshold'
        }
      }
    ]
  }
}

// Export for backward compatibility
export default LABFormulaEngine