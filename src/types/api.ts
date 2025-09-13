// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Document Upload Types
export interface UploadResponse {
  documentId: string
  fileName: string
  fileSize: number
  uploadedAt: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// Case Types
export interface CaseResponse {
  id: string
  title: string
  caseNumber: string
  status: string
  uploadedAt: string
  husbandIncome: number
  nafkahIddah: number
  mutaah: number
  confidence: number
  uploadedBy: {
    name: string
  }
  extractedText: string
  marriageDuration: number
  fileName?: string
  fileSize?: number
}

export interface CasesListResponse {
  cases: CaseResponse[]
  total: number
  limit: number
  offset: number
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: unknown
}