/**
 * LAB Formula Engine for eBantu+ Syariah Court Case Analysis
 * SMU LIT Hackathon 2025 - Team HashBill
 * Implements the EXACT LAB eBantu formulas as specified in requirements
 */

export interface LABFormulaInputs {
  salary: number
  caseType: 'nafkah_iddah' | 'mutaah' | 'both'
  includeRanges?: boolean
}

export interface LABFormulaResult {
  nafkahIddah?: {
    amount: number
    lowerRange: number
    upperRange: number
    isOutOfScope: boolean
    reasoning: string[]
  }
  mutaah?: {
    amount: number
    lowerRange: number
    upperRange: number
    isOutOfScope: boolean
    reasoning: string[]
  }
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
    overallReasoning: string[]
  }
}

/**
 * Official LAB eBantu Formula Implementation
 * 
 * EXACT SPECIFICATION IMPLEMENTATION:
 * 
 * Nafkah Iddah (Wife Maintenance, Per Month):
 * - Primary formula: Amount per month = 0.14 × salary + 47
 * - Lower range: 0.14 × salary – 3 (rounded to nearest hundred; lower bound not less than 0)
 * - Upper range: 0.14 × salary + 197 (rounded to nearest hundred)
 * 
 * Mutaah (Consolatory Gift, Per Day):
 * - Primary formula: Amount per day = 0.00096 × salary + 0.85 (rounded to nearest integer)
 * - Lower range: 0.00096 × salary – 0.15 (rounded to nearest integer)
 * - Upper range: 0.00096 × salary + 1.85 (rounded to nearest integer)
 * 
 * Key Business Rules:
 * - If salary = 0, Iddah amount = 0, Mutaah amount = 0
 * - If formula output < 0, amount = 0
 * - If lower range < 0, set it to 0
 * - If salary > $4,000, do not calculate—refer to legal advice ("out of scope" for LAB)
 */
export class LABFormulaEngine {
  // Official LAB coefficients (EXACT as per specification)
  private static readonly NAFKAH_IDDAH_MULTIPLIER = 0.14
  private static readonly NAFKAH_IDDAH_CONSTANT = 47
  private static readonly NAFKAH_IDDAH_LOWER_OFFSET = -3
  private static readonly NAFKAH_IDDAH_UPPER_OFFSET = 197
  
  private static readonly MUTAAH_MULTIPLIER = 0.00096
  private static readonly MUTAAH_CONSTANT = 0.85
  private static readonly MUTAAH_LOWER_OFFSET = -0.15
  private static readonly MUTAAH_UPPER_OFFSET = 1.85

  // Business rules thresholds
  private static readonly SALARY_THRESHOLD = 4000 // Above this, refer to legal advice
  private static readonly MIN_SALARY = 0

  // Rounding rules (EXACT as per specification)
  private static readonly NAFKAH_IDDAH_RANGE_ROUNDING = 100 // Round ranges to nearest $100
  private static readonly MUTAAH_ROUNDING = 1 // Round to nearest integer

  /**
   * Calculate LAB eBantu amounts using EXACT formulas per specification
   */
  static calculateAmount(inputs: LABFormulaInputs): LABFormulaResult {
    const { salary, caseType, includeRanges = true } = inputs
    const overallReasoning: string[] = []
    
    // Validate salary input
    if (salary < LABFormulaEngine.MIN_SALARY) {
      throw new Error('Salary cannot be negative')
    }

    // Handle zero salary case (Business Rule 1)
    if (salary === 0) {
      overallReasoning.push('Zero salary detected - returning zero amounts as per LAB business rules')
      return LABFormulaEngine.createZeroResult(caseType, overallReasoning)
    }

    // Handle high-income case (Business Rule 4)
    if (salary > LABFormulaEngine.SALARY_THRESHOLD) {
      overallReasoning.push(`Salary $${salary} exceeds $${LABFormulaEngine.SALARY_THRESHOLD} threshold - refer to legal advice (out of scope for LAB)`)
      return LABFormulaEngine.createOutOfScopeResult(salary, caseType, overallReasoning)
    }

    const result: LABFormulaResult = {
      details: {
        salary,
        appliedCoefficients: {},
        calculationMethod: 'Official LAB eBantu Formula (Exact Specification)',
        confidence: 1.0,
        overallReasoning
      }
    }

    // Calculate Nafkah Iddah if requested
    if (caseType === 'nafkah_iddah' || caseType === 'both') {
      const nafkahResult = LABFormulaEngine.calculateNafkahIddah(salary, includeRanges)
      result.nafkahIddah = nafkahResult
      result.details.appliedCoefficients.nafkahIddahMultiplier = LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER
      result.details.appliedCoefficients.nafkahIddahConstant = LABFormulaEngine.NAFKAH_IDDAH_CONSTANT
    }

    // Calculate Mutaah if requested
    if (caseType === 'mutaah' || caseType === 'both') {
      const mutaahResult = LABFormulaEngine.calculateMutaah(salary, includeRanges)
      result.mutaah = mutaahResult
      result.details.appliedCoefficients.mutaahMultiplier = LABFormulaEngine.MUTAAH_MULTIPLIER
      result.details.appliedCoefficients.mutaahConstant = LABFormulaEngine.MUTAAH_CONSTANT
    }

    return result
  }

  /**
   * Calculate Nafkah Iddah using EXACT specification:
   * Primary: Amount per month = 0.14 × salary + 47
   * Lower range: 0.14 × salary – 3 (rounded to nearest hundred; not less than 0)
   * Upper range: 0.14 × salary + 197 (rounded to nearest hundred)
   */
  private static calculateNafkahIddah(salary: number, includeRanges: boolean): {
    amount: number
    lowerRange: number
    upperRange: number
    isOutOfScope: boolean
    reasoning: string[]
  } {
    const reasoning: string[] = []
    
    // Primary formula calculation
    const primaryAmount = (LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER * salary) + LABFormulaEngine.NAFKAH_IDDAH_CONSTANT
    reasoning.push(`Primary calculation: (${LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER} × $${salary}) + ${LABFormulaEngine.NAFKAH_IDDAH_CONSTANT} = $${primaryAmount.toFixed(2)}`)

    // Apply business rule: if output < 0, set to 0
    const finalAmount = Math.max(0, primaryAmount)
    if (finalAmount !== primaryAmount) {
      reasoning.push(`Applied business rule: negative result set to $0`)
    }

    // Calculate ranges if requested
    let lowerRange = 0
    let upperRange = 0

    if (includeRanges) {
      // Lower range: 0.14 × salary – 3 (rounded to nearest hundred; not less than 0)
      const lowerCalc = (LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER * salary) + LABFormulaEngine.NAFKAH_IDDAH_LOWER_OFFSET
      lowerRange = Math.max(0, LABFormulaEngine.roundToNearest(lowerCalc, LABFormulaEngine.NAFKAH_IDDAH_RANGE_ROUNDING))
      reasoning.push(`Lower range: (${LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER} × $${salary}) + ${LABFormulaEngine.NAFKAH_IDDAH_LOWER_OFFSET} = $${lowerCalc.toFixed(2)}, rounded to $${lowerRange}`)

      // Upper range: 0.14 × salary + 197 (rounded to nearest hundred)
      const upperCalc = (LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER * salary) + LABFormulaEngine.NAFKAH_IDDAH_UPPER_OFFSET
      upperRange = LABFormulaEngine.roundToNearest(upperCalc, LABFormulaEngine.NAFKAH_IDDAH_RANGE_ROUNDING)
      reasoning.push(`Upper range: (${LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER} × $${salary}) + ${LABFormulaEngine.NAFKAH_IDDAH_UPPER_OFFSET} = $${upperCalc.toFixed(2)}, rounded to $${upperRange}`)
    }

    return {
      amount: finalAmount,
      lowerRange,
      upperRange,
      isOutOfScope: false,
      reasoning
    }
  }

  /**
   * Calculate Mutaah using EXACT specification:
   * Primary: Amount per day = 0.00096 × salary + 0.85 (rounded to nearest integer)
   * Lower range: 0.00096 × salary – 0.15 (rounded to nearest integer)
   * Upper range: 0.00096 × salary + 1.85 (rounded to nearest integer)
   */
  private static calculateMutaah(salary: number, includeRanges: boolean): {
    amount: number
    lowerRange: number
    upperRange: number
    isOutOfScope: boolean
    reasoning: string[]
  } {
    const reasoning: string[] = []
    
    // Primary formula calculation
    const primaryCalc = (LABFormulaEngine.MUTAAH_MULTIPLIER * salary) + LABFormulaEngine.MUTAAH_CONSTANT
    const primaryAmount = LABFormulaEngine.roundToNearest(primaryCalc, LABFormulaEngine.MUTAAH_ROUNDING)
    reasoning.push(`Primary calculation: (${LABFormulaEngine.MUTAAH_MULTIPLIER} × $${salary}) + ${LABFormulaEngine.MUTAAH_CONSTANT} = $${primaryCalc.toFixed(3)}, rounded to $${primaryAmount}`)

    // Apply business rule: if output < 0, set to 0
    const finalAmount = Math.max(0, primaryAmount)
    if (finalAmount !== primaryAmount) {
      reasoning.push(`Applied business rule: negative result set to $0`)
    }

    // Calculate ranges if requested
    let lowerRange = 0
    let upperRange = 0

    if (includeRanges) {
      // Lower range: 0.00096 × salary – 0.15 (rounded to nearest integer; not less than 0)
      const lowerCalc = (LABFormulaEngine.MUTAAH_MULTIPLIER * salary) + LABFormulaEngine.MUTAAH_LOWER_OFFSET
      lowerRange = Math.max(0, LABFormulaEngine.roundToNearest(lowerCalc, LABFormulaEngine.MUTAAH_ROUNDING))
      reasoning.push(`Lower range: (${LABFormulaEngine.MUTAAH_MULTIPLIER} × $${salary}) + ${LABFormulaEngine.MUTAAH_LOWER_OFFSET} = $${lowerCalc.toFixed(3)}, rounded to $${lowerRange}`)

      // Upper range: 0.00096 × salary + 1.85 (rounded to nearest integer)
      const upperCalc = (LABFormulaEngine.MUTAAH_MULTIPLIER * salary) + LABFormulaEngine.MUTAAH_UPPER_OFFSET
      upperRange = LABFormulaEngine.roundToNearest(upperCalc, LABFormulaEngine.MUTAAH_ROUNDING)
      reasoning.push(`Upper range: (${LABFormulaEngine.MUTAAH_MULTIPLIER} × $${salary}) + ${LABFormulaEngine.MUTAAH_UPPER_OFFSET} = $${upperCalc.toFixed(3)}, rounded to $${upperRange}`)
    }

    return {
      amount: finalAmount,
      lowerRange,
      upperRange,
      isOutOfScope: false,
      reasoning
    }
  }

  /**
   * Create zero result for salary = 0 case
   */
  private static createZeroResult(caseType: string, overallReasoning: string[]): LABFormulaResult {
    const result: LABFormulaResult = {
      details: {
        salary: 0,
        appliedCoefficients: {},
        calculationMethod: 'Zero salary handling (LAB Business Rule)',
        confidence: 1.0,
        overallReasoning
      }
    }

    if (caseType === 'nafkah_iddah' || caseType === 'both') {
      result.nafkahIddah = {
        amount: 0,
        lowerRange: 0,
        upperRange: 0,
        isOutOfScope: false,
        reasoning: ['Zero salary: Nafkah Iddah amount = $0 as per LAB business rules']
      }
    }

    if (caseType === 'mutaah' || caseType === 'both') {
      result.mutaah = {
        amount: 0,
        lowerRange: 0,
        upperRange: 0,
        isOutOfScope: false,
        reasoning: ['Zero salary: Mutaah amount = $0 as per LAB business rules']
      }
    }

    return result
  }

  /**
   * Create out-of-scope result for high-income cases
   */
  private static createOutOfScopeResult(salary: number, caseType: string, overallReasoning: string[]): LABFormulaResult {
    const result: LABFormulaResult = {
      details: {
        salary,
        appliedCoefficients: {},
        calculationMethod: 'High-income case - Legal advice required',
        confidence: 1.0,
        overallReasoning
      }
    }

    if (caseType === 'nafkah_iddah' || caseType === 'both') {
      result.nafkahIddah = {
        amount: 0,
        lowerRange: 0,
        upperRange: 0,
        isOutOfScope: true,
        reasoning: [`Salary $${salary} > $${LABFormulaEngine.SALARY_THRESHOLD}: Refer to legal advice for Nafkah Iddah calculation`]
      }
    }

    if (caseType === 'mutaah' || caseType === 'both') {
      result.mutaah = {
        amount: 0,
        lowerRange: 0,
        upperRange: 0,
        isOutOfScope: true,
        reasoning: [`Salary $${salary} > $${LABFormulaEngine.SALARY_THRESHOLD}: Refer to legal advice for Mutaah calculation`]
      }
    }

    return result
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
      errors.push('Salary cannot be negative')
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
      primaryFormula: string
      lowerRangeFormula: string
      upperRangeFormula: string
      rounding: string
    }
    mutaah: {
      primaryFormula: string
      lowerRangeFormula: string
      upperRangeFormula: string
      rounding: string
    }
    businessRules: string[]
    salaryThreshold: number
  } {
    return {
      nafkahIddah: {
        primaryFormula: `${LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER} × salary + ${LABFormulaEngine.NAFKAH_IDDAH_CONSTANT}`,
        lowerRangeFormula: `${LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER} × salary + ${LABFormulaEngine.NAFKAH_IDDAH_LOWER_OFFSET}`,
        upperRangeFormula: `${LABFormulaEngine.NAFKAH_IDDAH_MULTIPLIER} × salary + ${LABFormulaEngine.NAFKAH_IDDAH_UPPER_OFFSET}`,
        rounding: `Ranges rounded to nearest $${LABFormulaEngine.NAFKAH_IDDAH_RANGE_ROUNDING}`
      },
      mutaah: {
        primaryFormula: `${LABFormulaEngine.MUTAAH_MULTIPLIER} × salary + ${LABFormulaEngine.MUTAAH_CONSTANT}`,
        lowerRangeFormula: `${LABFormulaEngine.MUTAAH_MULTIPLIER} × salary + ${LABFormulaEngine.MUTAAH_LOWER_OFFSET}`,
        upperRangeFormula: `${LABFormulaEngine.MUTAAH_MULTIPLIER} × salary + ${LABFormulaEngine.MUTAAH_UPPER_OFFSET}`,
        rounding: `Rounded to nearest integer`
      },
      businessRules: [
        'If salary = 0, amounts = 0',
        'If formula output < 0, amounts = 0',
        'If lower range < 0, set it to 0',
        `If salary > $${LABFormulaEngine.SALARY_THRESHOLD}, refer to legal advice (out of scope for LAB)`
      ],
      salaryThreshold: LABFormulaEngine.SALARY_THRESHOLD
    }
  }

  /**
   * Generate test cases for validation with EXACT expected outputs
   */
  static generateTestCases(): Array<{
    input: LABFormulaInputs
    expectedOutput: {
      nafkahIddah?: { amount: number; lowerRange: number; upperRange: number }
      mutaah?: { amount: number; lowerRange: number; upperRange: number }
      description: string
    }
  }> {
    return [
      {
        input: { salary: 0, caseType: 'both' },
        expectedOutput: {
          nafkahIddah: { amount: 0, lowerRange: 0, upperRange: 0 },
          mutaah: { amount: 0, lowerRange: 0, upperRange: 0 },
          description: 'Zero salary handling - both amounts = 0'
        }
      },
      {
        input: { salary: 1000, caseType: 'nafkah_iddah' },
        expectedOutput: {
          nafkahIddah: { amount: 187, lowerRange: 100, upperRange: 300 }, // 0.14*1000+47=187, ranges: 137→100, 337→300
          description: 'Standard nafkah iddah calculation with range rounding'
        }
      },
      {
        input: { salary: 2000, caseType: 'mutaah' },
        expectedOutput: {
          mutaah: { amount: 3, lowerRange: 2, upperRange: 4 }, // 0.00096*2000+0.85=2.77→3, ranges: 1.77→2, 4.77→5
          description: 'Standard mutaah calculation with integer rounding'
        }
      },
      {
        input: { salary: 3000, caseType: 'both' },
        expectedOutput: {
          nafkahIddah: { amount: 467, lowerRange: 400, upperRange: 600 }, // 0.14*3000+47=467, ranges: 417→400, 617→600
          mutaah: { amount: 4, lowerRange: 3, upperRange: 6 }, // 0.00096*3000+0.85=3.73→4, ranges: 2.73→3, 5.73→6
          description: 'Both calculations for mid-range salary'
        }
      },
      {
        input: { salary: 5000, caseType: 'both' },
        expectedOutput: {
          description: 'High salary - out of scope, refer to legal advice'
        }
      }
    ]
  }
}

// Export for backward compatibility
export default LABFormulaEngine