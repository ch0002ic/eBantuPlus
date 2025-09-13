// Prisma enums (defined manually until client is generated)
export enum UserRole {
  LAB_OFFICER = 'LAB_OFFICER',
  ADMIN = 'ADMIN',
  VALIDATOR = 'VALIDATOR'
}

export enum CaseStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  EXTRACTED = 'EXTRACTED',
  VALIDATED = 'VALIDATED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXCLUDED = 'EXCLUDED'
}

export enum ValidationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  CORRECT = 'CORRECT',
  EXCLUDE = 'EXCLUDE',
  FLAG_OUTLIER = 'FLAG_OUTLIER'
}

export enum FormulaType {
  NAFKAH_IDDAH = 'NAFKAH_IDDAH',
  MUTAAH = 'MUTAAH'
}

// Base database types (will be replaced by Prisma generated types)
export interface User {
  id: string
  email: string
  name?: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Case {
  id: string
  title: string
  caseNumber?: string | null
  fileUrl: string
  fileName: string
  fileSize: number
  uploadedAt: Date
  processedAt?: Date | null
  status: CaseStatus
  husbandIncome?: number | null
  nafkahIddah?: number | null
  mutaah?: number | null
  marriageDuration?: number | null
  extractedText?: string | null
  aiExtraction?: Record<string, unknown> | null
  confidence?: number | null
  isConsentOrder: boolean
  isHighIncome: boolean
  isOutlier: boolean
  isExcluded: boolean
  exclusionReason?: string | null
  uploadedById: string
}

export interface CaseValidation {
  id: string
  action: ValidationAction
  comment?: string | null
  validatedAt: Date
  originalData?: Record<string, unknown> | null
  correctedData?: Record<string, unknown> | null
  caseId: string
  validatorId: string
}

export interface Formula {
  id: string
  version: string
  type: FormulaType
  formula: string
  parameters: Record<string, unknown>
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  basedOnCases: number
  rSquared?: number | null
  confidence?: number | null
}

export interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
  userId?: string | null
  timestamp: Date
}

// Extended types for UI
export interface CaseWithValidations extends Case {
  uploadedBy: User
  validations: (CaseValidation & { validator: User })[]
}

export interface FormulaWithStats extends Formula {
  accuracy?: number
  lastUpdated: Date
  casesUsed: number
}

// AI Extraction types
export interface AIExtractionResult {
  husbandIncome?: number | null
  nafkahIddah?: number | null
  mutaah?: number | null
  marriageDuration?: number | null
  confidence: number
  reasoning: string
  extractedEntities: Array<{
    entity: string
    value: string | number
    confidence: number
  }>
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface UploadResponse {
  caseId: string
  fileName: string
  fileUrl: string
  fileSize: number
}

export interface ExtractionResponse {
  caseId: string
  extractedData: AIExtractionResult
  status: CaseStatus
}

// Form types
export interface CaseUploadForm {
  title: string
  file: File
  caseNumber?: string
}

export interface ValidationForm {
  action: ValidationAction
  comment?: string
  correctedData?: {
    husbandIncome?: number
    nafkahIddah?: number
    mutaah?: number
    marriageDuration?: number
  }
}

export interface FormulaUpdateForm {
  type: FormulaType
  description?: string
  parameters: Record<string, unknown>
}

// Dashboard types
export interface DashboardStats {
  totalCases: number
  pendingValidation: number
  processedToday: number
  averageProcessingTime: number
  formulaAccuracy: number
  lastFormulaUpdate: Date
}

export interface ChartData {
  name: string
  value: number
  percentage?: number
}

// Filter types
export interface CaseFilters {
  status?: CaseStatus[]
  dateRange?: {
    from: Date
    to: Date
  }
  incomeRange?: {
    min: number
    max: number
  }
  uploadedBy?: string[]
  excludeFlags?: boolean
}

// Legal domain types
export interface NafkahIddahCalculation {
  baseAmount: number
  adjustmentFactors: {
    income: number
    duration: number
    dependents: number
  }
  finalAmount: number
  confidence: number
}

export interface MutaahCalculation {
  baseAmount: number
  adjustmentFactors: {
    income: number
    circumstances: string[]
  }
  finalAmount: number
  confidence: number
}

// Integration types
export interface EBantuIntegration {
  formulaVersion: string
  lastSync: Date
  status: 'active' | 'pending' | 'error'
  apiEndpoint: string
}

export interface LawNetCase {
  caseId: string
  title: string
  citation: string
  date: Date
  court: string
  summary: string
  fullText?: string
}

// Error types
export interface ProcessingError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
  caseId?: string
}

// Audit types
export interface AuditEvent {
  id: string
  action: string
  entity: string
  entityId: string
  userId?: string
  timestamp: Date
  changes: {
    before: Record<string, unknown>
    after: Record<string, unknown>
  }
}

// Configuration types
export interface AppConfig {
  highIncomeThreshold: number
  outlierThreshold: number
  maxFileSize: number
  allowedFileTypes: string[]
  aiModel: string
  retentionPeriod: number
}