/**
 * Advanced Validation Workflow System for LAB eBantu Formula Updates
 * Implements comprehensive human-in-the-loop validation processes
 * Ensures legal compliance and accuracy for Singapore Syariah Court data
 */

import { Case, ValidationResult } from '@/types'

// Validation workflow stages
export enum ValidationStage {
  AI_EXTRACTION = 'ai_extraction',
  FINANCIAL_VALIDATION = 'financial_validation',
  LEGAL_REVIEW = 'legal_review',
  OUTLIER_ANALYSIS = 'outlier_analysis',
  FINAL_APPROVAL = 'final_approval',
  INTEGRATION_READY = 'integration_ready'
}

// Validation priority levels
export enum ValidationPriority {
  CRITICAL = 'critical',     // Potential formula-breaking cases
  HIGH = 'high',            // Significant deviations requiring attention
  MEDIUM = 'medium',        // Standard review required
  LOW = 'low'              // Routine validation
}

// LAB officer roles for validation assignment
export enum LABOfficerRole {
  DATA_ANALYST = 'data_analyst',
  LEGAL_OFFICER = 'legal_officer',
  SENIOR_COUNSEL = 'senior_counsel',
  TECHNICAL_LEAD = 'technical_lead'
}

export interface ValidationTask {
  id: string
  caseId: string
  stage: ValidationStage
  priority: ValidationPriority
  assignedTo?: LABOfficerRole
  assignedAt?: Date
  dueDate: Date
  data: Case
  aiConfidence: number
  extractedFields: ExtractedFields
  validationFlags: ValidationFlag[]
  reviewComments?: string[]
  status: 'pending' | 'in_review' | 'completed' | 'escalated' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

export interface ExtractedFields {
  husbandIncome: {
    value: number
    confidence: number
    source: string // e.g., "paragraph 3, line 2"
    validationRequired: boolean
  }
  nafkahAmount: {
    value: number
    confidence: number
    source: string
    calculationMethod?: string
  }
  mutaahAmount: {
    value: number
    confidence: number
    source: string
    calculationMethod?: string
  }
  marriageDuration: {
    value: number // in months
    confidence: number
    source: string
  }
  specialCircumstances: {
    factors: string[]
    impact: 'increase' | 'decrease' | 'neutral'
    confidence: number
  }
}

export interface ValidationFlag {
  type: 'income_outlier' | 'calculation_deviation' | 'missing_data' | 'consent_order' | 'special_circumstances' | 'data_inconsistency'
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  suggestedAction: string
  requiresHumanReview: boolean
  autoResolvable: boolean
}

export class ValidationWorkflowManager {
  private readonly validationQueues: Map<LABOfficerRole, ValidationTask[]> = new Map()
  private readonly completedValidations: ValidationTask[] = []
  private readonly escalatedCases: ValidationTask[] = []

  constructor() {
    // Initialize validation queues for each LAB officer role
    Object.values(LABOfficerRole).forEach(role => {
      this.validationQueues.set(role, [])
    })
  }

  /**
   * Create a new validation task from AI extraction results
   */
  createValidationTask(
    caseData: Case,
    extractedFields: ExtractedFields,
    aiConfidence: number
  ): ValidationTask {
    const flags = this.generateValidationFlags(caseData, extractedFields)
    const priority = this.calculatePriority(aiConfidence, flags)
    const stage = this.determineInitialStage(extractedFields, flags)
    
    const task: ValidationTask = {
      id: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      caseId: caseData.id,
      stage,
      priority,
      data: caseData,
      aiConfidence,
      extractedFields,
      validationFlags: flags,
      status: 'pending',
      dueDate: this.calculateDueDate(priority),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Auto-assign based on priority and type
    this.autoAssignTask(task)
    return task
  }

  /**
   * Generate validation flags based on extracted data
   */
  private generateValidationFlags(
    caseData: Case,
    extracted: ExtractedFields
  ): ValidationFlag[] {
    const flags: ValidationFlag[] = []

    // Income validation
    if (extracted.husbandIncome.value > 10000) {
      flags.push({
        type: 'income_outlier',
        severity: 'warning',
        message: 'High income detected - may require exclusion from formula calculation',
        suggestedAction: 'Review case details for high-income classification',
        requiresHumanReview: true,
        autoResolvable: false
      })
    }

    // Low confidence extraction
    if (extracted.husbandIncome.confidence < 0.7) {
      flags.push({
        type: 'missing_data',
        severity: 'error',
        message: 'Low confidence in income extraction',
        suggestedAction: 'Manual verification of income figures required',
        requiresHumanReview: true,
        autoResolvable: false
      })
    }

    // Calculation deviation
    const expectedNafkah = (extracted.husbandIncome.value * 0.14) + 47
    const deviation = Math.abs(extracted.nafkahAmount.value - expectedNafkah) / expectedNafkah
    
    if (deviation > 0.2) { // More than 20% deviation
      flags.push({
        type: 'calculation_deviation',
        severity: 'warning',
        message: `Nafkah amount deviates ${(deviation * 100).toFixed(1)}% from LAB formula`,
        suggestedAction: 'Review court reasoning for calculation method',
        requiresHumanReview: true,
        autoResolvable: false
      })
    }

    // Consent order detection
    if (caseData.extractedText?.toLowerCase().includes('consent') || 
        caseData.extractedText?.toLowerCase().includes('agreed')) {
      flags.push({
        type: 'consent_order',
        severity: 'critical',
        message: 'Potential consent order detected',
        suggestedAction: 'Exclude from formula calculation dataset',
        requiresHumanReview: true,
        autoResolvable: false
      })
    }

    // Special circumstances
    if (extracted.specialCircumstances.factors.length > 0) {
      flags.push({
        type: 'special_circumstances',
        severity: 'info',
        message: `Special factors identified: ${extracted.specialCircumstances.factors.join(', ')}`,
        suggestedAction: 'Consider impact on formula applicability',
        requiresHumanReview: true,
        autoResolvable: false
      })
    }

    return flags
  }

  /**
   * Calculate validation priority based on AI confidence and flags
   */
  private calculatePriority(
    aiConfidence: number,
    flags: ValidationFlag[]
  ): ValidationPriority {
    // Critical flags always take precedence
    if (flags.some(f => f.severity === 'critical')) {
      return ValidationPriority.CRITICAL
    }

    // Low AI confidence requires high priority
    if (aiConfidence < 0.6) {
      return ValidationPriority.HIGH
    }

    // Multiple warning flags
    if (flags.filter(f => f.severity === 'warning').length >= 2) {
      return ValidationPriority.HIGH
    }

    // Single warning or error
    if (flags.some(f => f.severity === 'warning' || f.severity === 'error')) {
      return ValidationPriority.MEDIUM
    }

    // High confidence, no major issues
    return ValidationPriority.LOW
  }

  /**
   * Determine the initial validation stage
   */
  private determineInitialStage(
    extracted: ExtractedFields,
    flags: ValidationFlag[]
  ): ValidationStage {
    // Critical issues go straight to legal review
    if (flags.some(f => f.severity === 'critical')) {
      return ValidationStage.LEGAL_REVIEW
    }

    // Financial data issues start with financial validation
    if (flags.some(f => f.type === 'income_outlier' || f.type === 'calculation_deviation')) {
      return ValidationStage.FINANCIAL_VALIDATION
    }

    // Low confidence extractions need AI validation first
    if (extracted.husbandIncome.confidence < 0.7) {
      return ValidationStage.AI_EXTRACTION
    }

    // Standard cases start with financial validation
    return ValidationStage.FINANCIAL_VALIDATION
  }

  /**
   * Auto-assign validation tasks based on type and priority
   */
  private autoAssignTask(task: ValidationTask): void {
    let targetRole: LABOfficerRole

    switch (task.stage) {
      case ValidationStage.AI_EXTRACTION:
        targetRole = LABOfficerRole.TECHNICAL_LEAD
        break
      case ValidationStage.FINANCIAL_VALIDATION:
        targetRole = LABOfficerRole.DATA_ANALYST
        break
      case ValidationStage.LEGAL_REVIEW:
        targetRole = task.priority === ValidationPriority.CRITICAL ? 
          LABOfficerRole.SENIOR_COUNSEL : LABOfficerRole.LEGAL_OFFICER
        break
      case ValidationStage.OUTLIER_ANALYSIS:
        targetRole = LABOfficerRole.DATA_ANALYST
        break
      default:
        targetRole = LABOfficerRole.DATA_ANALYST
    }

    task.assignedTo = targetRole
    task.assignedAt = new Date()
    
    const queue = this.validationQueues.get(targetRole)
    if (queue) {
      // Insert based on priority
      const insertIndex = this.findInsertionIndex(queue, task.priority)
      queue.splice(insertIndex, 0, task)
    }
  }

  /**
   * Find the correct insertion index to maintain priority order
   */
  private findInsertionIndex(queue: ValidationTask[], priority: ValidationPriority): number {
    const priorityOrder = {
      [ValidationPriority.CRITICAL]: 0,
      [ValidationPriority.HIGH]: 1,
      [ValidationPriority.MEDIUM]: 2,
      [ValidationPriority.LOW]: 3
    }

    for (let i = 0; i < queue.length; i++) {
      if (priorityOrder[priority] < priorityOrder[queue[i].priority]) {
        return i
      }
    }
    return queue.length
  }

  /**
   * Calculate due date based on priority
   */
  private calculateDueDate(priority: ValidationPriority): Date {
    const now = new Date()
    const hours = {
      [ValidationPriority.CRITICAL]: 4,   // 4 hours
      [ValidationPriority.HIGH]: 24,     // 1 day
      [ValidationPriority.MEDIUM]: 72,   // 3 days
      [ValidationPriority.LOW]: 168      // 1 week
    }

    return new Date(now.getTime() + hours[priority] * 60 * 60 * 1000)
  }

  /**
   * Get validation queue for a specific LAB officer role
   */
  getValidationQueue(role: LABOfficerRole): ValidationTask[] {
    return this.validationQueues.get(role) || []
  }

  /**
   * Complete a validation task and move to next stage
   */
  completeValidationTask(
    taskId: string,
    result: ValidationResult,
    comments?: string
  ): ValidationTask | null {
    // Find task across all queues
    let task: ValidationTask | undefined

    for (const [, queue] of this.validationQueues) {
      const index = queue.findIndex(t => t.id === taskId)
      if (index !== -1) {
        task = queue[index]
        queue.splice(index, 1)
        break
      }
    }

    if (!task) return null

    // Update task with results
    task.status = result.approved ? 'completed' : 'rejected'
    task.updatedAt = new Date()
    if (comments) {
      task.reviewComments = [...(task.reviewComments || []), comments]
    }

    // Determine next stage
    if (result.approved) {
      const nextStage = this.getNextValidationStage(task.stage)
      if (nextStage) {
        task.stage = nextStage
        task.status = 'pending'
        this.autoAssignTask(task)
      } else {
        // Validation complete
        task.stage = ValidationStage.INTEGRATION_READY
        this.completedValidations.push(task)
      }
    } else {
      // Rejected - needs escalation or revision
      this.escalatedCases.push(task)
    }

    return task
  }

  /**
   * Determine the next validation stage
   */
  private getNextValidationStage(currentStage: ValidationStage): ValidationStage | null {
    const stageFlow: Record<ValidationStage, ValidationStage | null> = {
      [ValidationStage.AI_EXTRACTION]: ValidationStage.FINANCIAL_VALIDATION,
      [ValidationStage.FINANCIAL_VALIDATION]: ValidationStage.LEGAL_REVIEW,
      [ValidationStage.LEGAL_REVIEW]: ValidationStage.OUTLIER_ANALYSIS,
      [ValidationStage.OUTLIER_ANALYSIS]: ValidationStage.FINAL_APPROVAL,
      [ValidationStage.FINAL_APPROVAL]: null,
      [ValidationStage.INTEGRATION_READY]: null
    }

    return stageFlow[currentStage] || null
  }

  /**
   * Get validation statistics for dashboard
   */
  getValidationStatistics(): {
    totalPending: number
    totalCompleted: number
    totalEscalated: number
    averageProcessingTime: number
    priorityBreakdown: Record<ValidationPriority, number>
    stageBreakdown: Record<ValidationStage, number>
  } {
    const allPending = Array.from(this.validationQueues.values()).flat()
    
    return {
      totalPending: allPending.length,
      totalCompleted: this.completedValidations.length,
      totalEscalated: this.escalatedCases.length,
      averageProcessingTime: this.calculateAverageProcessingTime(),
      priorityBreakdown: this.getPriorityBreakdown(allPending),
      stageBreakdown: this.getStageBreakdown(allPending)
    }
  }

  private calculateAverageProcessingTime(): number {
    if (this.completedValidations.length === 0) return 0
    
    const totalTime = this.completedValidations.reduce((sum, task) => {
      return sum + (task.updatedAt.getTime() - task.createdAt.getTime())
    }, 0)
    
    return totalTime / this.completedValidations.length / (1000 * 60 * 60) // in hours
  }

  private getPriorityBreakdown(tasks: ValidationTask[]): Record<ValidationPriority, number> {
    const breakdown = {
      [ValidationPriority.CRITICAL]: 0,
      [ValidationPriority.HIGH]: 0,
      [ValidationPriority.MEDIUM]: 0,
      [ValidationPriority.LOW]: 0
    }

    tasks.forEach(task => {
      breakdown[task.priority]++
    })

    return breakdown
  }

  private getStageBreakdown(tasks: ValidationTask[]): Record<ValidationStage, number> {
    const breakdown = {
      [ValidationStage.AI_EXTRACTION]: 0,
      [ValidationStage.FINANCIAL_VALIDATION]: 0,
      [ValidationStage.LEGAL_REVIEW]: 0,
      [ValidationStage.OUTLIER_ANALYSIS]: 0,
      [ValidationStage.FINAL_APPROVAL]: 0,
      [ValidationStage.INTEGRATION_READY]: 0
    }

    tasks.forEach(task => {
      breakdown[task.stage]++
    })

    return breakdown
  }
}

/**
 * Singleton validation workflow manager instance
 */
export const validationWorkflow = new ValidationWorkflowManager()