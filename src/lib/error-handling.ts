/**
 * Enhanced Error Handling for eBantu+ Legal Aid Application
 * SMU LIT Hackathon 2025 - Team HashBill
 * 
 * Comprehensive error management for legal data processing,
 * AI extraction, and formula validation with audit trails.
 */

export class LegalProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'LegalProcessingError'
  }
}

export class AIExtractionError extends Error {
  constructor(
    message: string,
    public confidence: number,
    public extractedData?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AIExtractionError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown,
    public expectedRange?: [number, number]
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export interface ErrorContext {
  caseId?: string
  userId?: string
  timestamp: Date
  operation: string
  metadata?: Record<string, unknown>
}

export class ErrorLogger {
  private static instance: ErrorLogger
  private errors: Array<ErrorContext & { error: Error }> = []

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  log(error: Error, context: ErrorContext): void {
    const entry = {
      error,
      ...context,
      timestamp: new Date()
    }
    
    this.errors.push(entry)
    
    // In production, send to monitoring service
    console.error('[eBantu+ Error]', {
      name: error.name,
      message: error.message,
      context
    })
  }

  getErrors(filter?: Partial<ErrorContext>): Array<ErrorContext & { error: Error }> {
    if (!filter) return this.errors
    
    return this.errors.filter(entry => {
      return Object.keys(filter).every(key => 
        entry[key as keyof ErrorContext] === filter[key as keyof ErrorContext]
      )
    })
  }

  clearErrors(): void {
    this.errors = []
  }
}

export const errorLogger = ErrorLogger.getInstance()

/**
 * Enhanced error handler for LAB formula validation
 */
export function validateLabFormula(
  income: number,
  nafkahIddah: number,
  mutaah: number
): { isValid: boolean; errors: ValidationError[]; warnings: string[] } {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  // Income validation
  if (income < 0) {
    errors.push(new ValidationError(
      'Income cannot be negative',
      'husbandIncome',
      income
    ))
  }

  if (income > 50000) {
    warnings.push('Extremely high income detected - verify accuracy')
  }

  // LAB formula validation
  const expectedNafkahIddah = Math.round((0.14 * income + 47) / 100) * 100
  const expectedMutaah = Math.round(0.00096 * income + 0.85)

  const nafkahDeviation = Math.abs(nafkahIddah - expectedNafkahIddah) / expectedNafkahIddah
  const mutaahDeviation = Math.abs(mutaah - expectedMutaah) / expectedMutaah

  if (nafkahDeviation > 0.2) { // 20% deviation threshold
    errors.push(new ValidationError(
      `Nafkah iddah deviates significantly from LAB formula. Expected: $${expectedNafkahIddah}, Got: $${nafkahIddah}`,
      'nafkahIddah',
      nafkahIddah,
      [expectedNafkahIddah * 0.8, expectedNafkahIddah * 1.2]
    ))
  }

  if (mutaahDeviation > 0.3) { // 30% deviation threshold
    errors.push(new ValidationError(
      `Mutaah deviates significantly from LAB formula. Expected: $${expectedMutaah}, Got: $${mutaah}`,
      'mutaah',
      mutaah,
      [expectedMutaah * 0.7, expectedMutaah * 1.3]
    ))
  }

  // High income flagging
  if (income > 4000) {
    warnings.push('High income case (>$4,000) - requires senior review')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Centralized error recovery for AI processing
 */
export async function withErrorRecovery<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: ErrorContext
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    errorLogger.log(error as Error, context)
    
    // Attempt recovery based on error type
    if (error instanceof AIExtractionError) {
      console.warn('AI extraction failed, using fallback data')
      return fallback
    }
    
    if (error instanceof ValidationError) {
      console.warn('Validation failed, flagging for human review')
      // In production, add to review queue
    }
    
    throw error // Re-throw if no recovery possible
  }
}

/**
 * Singapore legal compliance validator
 */
export function validateSingaporeLegalCompliance(caseData: {
  extractedText?: string
  marriageDuration?: number
  husbandIncome?: number
}): {
  compliant: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []

  // Check for consent order indicators
  const text = caseData.extractedText?.toLowerCase() || ''
  if (text.includes('consent') || text.includes('parties agree')) {
    issues.push('Potential consent order detected - exclude from formula calculation')
    recommendations.push('Verify if this is a consent order before including in dataset')
  }

  // Marriage duration validation
  if (caseData.marriageDuration && caseData.marriageDuration < 3) {
    issues.push('Very short marriage duration - verify accuracy')
  }

  // Currency validation
  if (caseData.husbandIncome && caseData.husbandIncome < 1000) {
    recommendations.push('Income seems low - verify if this is net or gross income')
  }

  return {
    compliant: issues.length === 0,
    issues,
    recommendations
  }
}