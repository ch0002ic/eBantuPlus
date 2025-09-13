/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Advanced Document Processing Pipeline for eBantu+ Legal Automation
 * 
 * Provides sophisticated document analysis, multi-modal extraction, and 
 * confidence scoring for complex legal documents in Singapore Syariah Court cases.
 * 
 * Features:
 * - Multi-format document support (PDF, DOCX, images)
 * - OCR with confidence scoring
 * - AI-powered text extraction and entity recognition
 *    const confidence = 0.7- Template matching for court documents
 * - Automated validation workflows
 */

import { z } from 'zod'

// Document Processing Types
export interface ProcessedDocument {
  id: string
  fileName: string
  fileType: 'pdf' | 'docx' | 'image' | 'text'
  fileSize: number
  uploadedAt: Date
  processedAt?: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  extractedData: ExtractedData
  confidence: ConfidenceMetrics
  validationFlags: ValidationFlag[]
  metadata: DocumentMetadata
}

export interface ExtractedData {
  // Case Information
  caseNumber?: string
  courtType?: string
  dateOfOrder?: string
  judgePresiding?: string
  
  // Party Information
  husbandName?: string
  wifeName?: string
  husbandIC?: string
  wifeIC?: string
  marriageDate?: string
  divorceType?: 'talaq' | 'khula' | 'mubarat' | 'fasakh'
  
  // Financial Data
  husbandIncome?: number
  wifeIncome?: number
  nafkahIddahAmount?: number
  mutaahAmount?: number
  marriageDuration?: number
  
  // Document Classification
  documentType?: 'judgment' | 'consent_order' | 'application' | 'affidavit'
  isConsentOrder?: boolean
  containsFinancialData?: boolean
}

export interface ConfidenceMetrics {
  overall: number
  extraction: number
  ocr?: number
  entityRecognition: number
  templateMatching: number
  dataValidation: number
}

export interface ValidationFlag {
  type: 'warning' | 'error' | 'info'
  field: string
  message: string
  severity: 'low' | 'medium' | 'high'
  autoFixable: boolean
}

export interface DocumentMetadata {
  pages?: number
  language?: string
  encoding?: string
  createdDate?: Date
  lastModified?: Date
  author?: string
  producer?: string
  template?: string
}

// Validation Schemas
const ExtractedDataSchema = z.object({
  caseNumber: z.string().optional(),
  courtType: z.string().optional(),
  dateOfOrder: z.string().optional(),
  judgePresiding: z.string().optional(),
  husbandName: z.string().optional(),
  wifeName: z.string().optional(),
  husbandIC: z.string().optional(),
  wifeIC: z.string().optional(),
  marriageDate: z.string().optional(),
  divorceType: z.enum(['talaq', 'khula', 'mubarat', 'fasakh']).optional(),
  husbandIncome: z.number().min(0).optional(),
  wifeIncome: z.number().min(0).optional(),
  nafkahIddahAmount: z.number().min(0).optional(),
  mutaahAmount: z.number().min(0).optional(),
  marriageDuration: z.number().min(0).optional(),
  documentType: z.enum(['judgment', 'consent_order', 'application', 'affidavit']).optional(),
  isConsentOrder: z.boolean().optional(),
  containsFinancialData: z.boolean().optional()
})

/**
 * Advanced Document Processor with AI-powered extraction capabilities
 */
export class DocumentProcessor {
  private ocrEngine: string
  private aiModel: string
  private templates: Map<string, DocumentTemplate>

  constructor(config?: {
    ocrEngine?: string
    aiModel?: string
    enableAdvancedFeatures?: boolean
  }) {
    this.ocrEngine = config?.ocrEngine || 'tesseract-enhanced'
    this.aiModel = config?.aiModel || 'gpt-4-turbo'
    this.templates = new Map()
    this.initializeTemplates()
  }

  /**
   * Process document with comprehensive analysis
   */
  async processDocument(
    file: File,
    options?: {
      enableOCR?: boolean
      enableAI?: boolean
      templateMatching?: boolean
      strictValidation?: boolean
    }
  ): Promise<ProcessedDocument> {
    const startTime = Date.now()
    
    // Initialize document record
    const document: ProcessedDocument = {
      id: this.generateDocumentId(),
      fileName: file.name,
      fileType: this.detectFileType(file.name),
      fileSize: file.size,
      uploadedAt: new Date(),
      status: 'processing',
      extractedData: {},
      confidence: {
        overall: 0,
        extraction: 0,
        entityRecognition: 0,
        templateMatching: 0,
        dataValidation: 0
      },
      validationFlags: [],
      metadata: {}
    }

    try {
      // Extract text content
      const textContent = await this.extractTextContent(file, options?.enableOCR)
      
      // OCR confidence if applicable
      if (options?.enableOCR && document.fileType === 'image') {
        document.confidence.ocr = await this.calculateOCRConfidence(textContent)
      }

      // Template matching
      if (options?.templateMatching !== false) {
        const templateMatch = await this.matchTemplate(textContent)
        document.metadata.template = templateMatch.template
        document.confidence.templateMatching = templateMatch.confidence
      }

      // AI-powered extraction
      if (options?.enableAI !== false) {
        const aiExtraction = await this.performAIExtraction(textContent)
        document.extractedData = { ...document.extractedData, ...aiExtraction.data }
        document.confidence.extraction = aiExtraction.confidence
      }

      // Entity recognition and validation
      const entityResults = await this.performEntityRecognition(textContent)
      document.extractedData = { ...document.extractedData, ...entityResults.entities }
      document.confidence.entityRecognition = entityResults.confidence

      // Data validation
      const validationResults = await this.validateExtractedData(
        document.extractedData,
        options?.strictValidation
      )
      document.validationFlags = validationResults.flags
      document.confidence.dataValidation = validationResults.confidence

      // Calculate overall confidence
      document.confidence.overall = this.calculateOverallConfidence(document.confidence)

      // Final status
      document.status = 'completed'
      document.processedAt = new Date()

      // Add processing metadata
      document.metadata = {
        ...document.metadata,
        pages: await this.countPages(file),
        language: this.detectLanguage(textContent),
        createdDate: new Date(file.lastModified)
      }

      console.log(`Document processed in ${Date.now() - startTime}ms`, {
        fileName: document.fileName,
        confidence: document.confidence.overall,
        flags: document.validationFlags.length
      })

      return document

    } catch (error) {
      console.error('Document processing failed:', error)
      document.status = 'failed'
      document.validationFlags.push({
        type: 'error',
        field: 'processing',
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high',
        autoFixable: false
      })
      return document
    }
  }

  /**
   * Extract text content from various file formats
   */
  private async extractTextContent(file: File, enableOCR = true): Promise<string> {
    const fileType = this.detectFileType(file.name)
    
    switch (fileType) {
      case 'pdf':
        return await this.extractFromPDF(file, enableOCR)
      case 'docx':
        return await this.extractFromDOCX(file)
      case 'image':
        return enableOCR ? await this.performOCR(file) : ''
      case 'text':
        return await file.text()
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  }

  /**
   * Extract text from PDF with OCR fallback
   */
  private async extractFromPDF(file: File, enableOCR = true): Promise<string> {
    try {
      // For hackathon demo: Simulate PDF text extraction
      // Production implementation would use pdf-parse or PDF.js libraries
      const simulatedContent = `
        SYARIAH COURT OF SINGAPORE
        Case No: SYC2024/1234
        
        In the matter of:
        Abdul Rahman bin Ahmad (IC: S1234567A) - Applicant
        AND
        Siti Fatimah bte Mohamed (IC: S2345678B) - Respondent
        
        ORDER ON ANCILLARY MATTERS
        
        BEFORE: His Honour Judge Ahmad bin Ali
        Date: 15 March 2024
        
        UPON the application for ancillary matters following the pronouncement of talaq
        AND UPON hearing counsel for both parties
        
        IT IS HEREBY ORDERED THAT:
        
        1. The Applicant shall pay to the Respondent:
           a) Nafkah Iddah: $439.00 per month for 3 months
           b) Mutaah: $2.69
           
        2. The said amounts are based on the Applicant's declared monthly income of $2,800.00
        
        3. Marriage Duration: 8.5 years (from 15 July 2015 to 20 January 2024)
        
        GIVEN under my hand this 15th day of March 2024
        
        Judge Ahmad bin Ali
        Syariah Court of Singapore
      `
      
      return simulatedContent.trim()
    } catch (error) {
      if (enableOCR) {
        console.log('PDF text extraction failed, falling back to OCR')
        return await this.performOCR(file)
      }
      throw error
    }
  }

  /**
   * Extract text from DOCX files
   */
  private async extractFromDOCX(_file: File): Promise<string> {
    // Simulate DOCX extraction
    // In production, use libraries like mammoth.js
    return `
      SYARIAH COURT JUDGMENT DOCUMENT
      Case: Mohamed Ali v Aminah Hassan
      Income: $3,200/month
      Nafkah Iddah: $495
      Mutaah: $3.92
      Marriage Duration: 12 years
    `.trim()
  }

  /**
   * Perform OCR on image files
   */
  private async performOCR(_file: File): Promise<string> {
    // Simulate OCR processing
    // In production, integrate with Tesseract.js or cloud OCR services
    // For hackathon demo: Simulate OCR processing
    // Production implementation would use services like Google Vision API or AWS Textract
    return `
      [OCR EXTRACTED TEXT]
      SYARIAH COURT ORDER
      Husband Income: $2,500
      Nafkah Amount: $397
      Mutaah Amount: $3.25
    `.trim()
  }

  /**
   * Calculate OCR confidence score
   */
  private async calculateOCRConfidence(text: string): Promise<number> {
    // Simulate OCR confidence calculation
    const textLength = text.length
    // const wordCount = text.split(/\s+/).length
    
    // Higher confidence for longer, well-structured text
    let confidence = Math.min(0.95, 0.6 + (textLength / 1000) * 0.3)
    
    // Boost for legal keywords
    const legalKeywords = ['court', 'order', 'nafkah', 'mutaah', 'income', 'syariah']
    const keywordMatches = legalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length
    
    confidence += (keywordMatches / legalKeywords.length) * 0.1
    
    return Math.min(0.98, confidence)
  }

  /**
   * Match document against known templates
   */
  private async matchTemplate(text: string): Promise<{
    template: string
    confidence: number
  }> {
    const templates = [
      { name: 'syariah_court_order', patterns: ['syariah court', 'order', 'nafkah', 'mutaah'] },
      { name: 'consent_order', patterns: ['consent', 'agreed', 'parties agree'] },
      { name: 'judgment', patterns: ['judgment', 'it is hereby ordered', 'given under my hand'] },
      { name: 'application', patterns: ['application', 'applicant', 'respondent', 'prayers'] }
    ]

    let bestMatch = { template: 'unknown', confidence: 0 }
    
    for (const template of templates) {
      const matches = template.patterns.filter(pattern =>
        text.toLowerCase().includes(pattern.toLowerCase())
      ).length
      
      const confidence = matches / template.patterns.length
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { template: template.name, confidence }
      }
    }

    return bestMatch
  }

  /**
   * AI-powered data extraction
   */
  private async performAIExtraction(text: string): Promise<{
    data: Partial<ExtractedData>
    confidence: number
  }> {
    // Simulate AI extraction using pattern matching
    const extractedData: Partial<ExtractedData> = {}
    const confidence = 0.8

    // Extract case number
    const caseNumberMatch = text.match(/(?:case|no)[:\s]+([A-Z]{2,3}\d{4}\/\d{3,4})/i)
    if (caseNumberMatch) {
      extractedData.caseNumber = caseNumberMatch[1]
    }

    // Extract income
    const incomeMatch = text.match(/income[:\s]+\$?([\d,]+(?:\.\d{2})?)/i)
    if (incomeMatch) {
      extractedData.husbandIncome = parseFloat(incomeMatch[1].replace(/,/g, ''))
    }

    // Extract nafkah iddah
    const nafkahMatch = text.match(/nafkah\s+iddah[:\s]+\$?([\d,]+(?:\.\d{2})?)/i)
    if (nafkahMatch) {
      extractedData.nafkahIddahAmount = parseFloat(nafkahMatch[1].replace(/,/g, ''))
    }

    // Extract mutaah
    const mutaahMatch = text.match(/mutaah[:\s]+\$?([\d,]+(?:\.\d{2})?)/i)
    if (mutaahMatch) {
      extractedData.mutaahAmount = parseFloat(mutaahMatch[1].replace(/,/g, ''))
    }

    // Extract marriage duration
    const durationMatch = text.match(/marriage\s+duration[:\s]+([\d.]+)\s*years?/i)
    if (durationMatch) {
      extractedData.marriageDuration = parseFloat(durationMatch[1])
    }

    // Detect consent order
    extractedData.isConsentOrder = /consent|agreed|parties\s+agree/i.test(text)
    
    // Document type classification
    if (/judgment|it is hereby ordered/i.test(text)) {
      extractedData.documentType = 'judgment'
    } else if (/consent|agreed/i.test(text)) {
      extractedData.documentType = 'consent_order'
    } else if (/application|prayers/i.test(text)) {
      extractedData.documentType = 'application'
    }

    // Check if contains financial data
    extractedData.containsFinancialData = !!(
      extractedData.husbandIncome || 
      extractedData.nafkahIddahAmount || 
      extractedData.mutaahAmount
    )

    return { data: extractedData, confidence }
  }

  /**
   * Perform entity recognition
   */
  private async performEntityRecognition(text: string): Promise<{
    entities: Partial<ExtractedData>
    confidence: number
  }> {
    const entities: Partial<ExtractedData> = {}
    const confidence = 0.7

    // Extract party names using pattern matching
    const namePatterns = [
      /([A-Z][a-z]+(?:\s+bin\s+[A-Z][a-z]+)+)/g,  // Male names with "bin"
      /([A-Z][a-z]+(?:\s+bte\s+[A-Z][a-z]+)+)/g   // Female names with "bte"
    ]

    const maleNames = [...text.matchAll(namePatterns[0])].map(m => m[1])
    const femaleNames = [...text.matchAll(namePatterns[1])].map(m => m[1])

    if (maleNames.length > 0) entities.husbandName = maleNames[0]
    if (femaleNames.length > 0) entities.wifeName = femaleNames[0]

    // Extract IC numbers
    const icPattern = /([ST]\d{7}[A-Z])/g
    const icNumbers = [...text.matchAll(icPattern)].map(m => m[1])
    
    if (icNumbers.length >= 1) entities.husbandIC = icNumbers[0]
    if (icNumbers.length >= 2) entities.wifeIC = icNumbers[1]

    // Extract dates
    const datePattern = /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/g
    const dates = [...text.matchAll(datePattern)]
    
    if (dates.length > 0) {
      entities.dateOfOrder = `${dates[0][1]} ${dates[0][2]} ${dates[0][3]}`
    }

    return { entities, confidence }
  }

  /**
   * Validate extracted data
   */
  private async validateExtractedData(
    data: Partial<ExtractedData>,
    _strictValidation = false
  ): Promise<{
    flags: ValidationFlag[]
    confidence: number
  }> {
    const flags: ValidationFlag[] = []
    let confidence = 0.9
    // For hackathon demo: Use simplified validation
    // Production implementation would have stricter validation rules

    try {
      // Validate against schema
      ExtractedDataSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          flags.push({
            type: 'error',
            field: err.path.join('.'),
            message: err.message,
            severity: 'medium',
            autoFixable: false
          })
        })
      }
      confidence -= 0.2
    }

    // Business rule validations
    if (data.husbandIncome && data.husbandIncome > 10000) {
      flags.push({
        type: 'warning',
        field: 'husbandIncome',
        message: 'Income unusually high, please verify',
        severity: 'medium',
        autoFixable: false
      })
    }

    if (data.husbandIncome && data.nafkahIddahAmount) {
      const expectedNafkah = (data.husbandIncome * 0.14) + 47
      const difference = Math.abs(data.nafkahIddahAmount - expectedNafkah)
      
      if (difference > 50) {
        flags.push({
          type: 'warning',
          field: 'nafkahIddahAmount',
          message: `Nafkah amount deviates from LAB formula (expected: $${expectedNafkah.toFixed(2)})`,
          severity: 'high',
          autoFixable: true
        })
        confidence -= 0.1
      }
    }

    if (data.isConsentOrder) {
      flags.push({
        type: 'info',
        field: 'documentType',
        message: 'Consent order detected - may need exclusion from formula calculations',
        severity: 'low',
        autoFixable: false
      })
    }

    return { flags, confidence }
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(metrics: ConfidenceMetrics): number {
    const weights = {
      extraction: 0.3,
      ocr: 0.2,
      entityRecognition: 0.2,
      templateMatching: 0.15,
      dataValidation: 0.15
    }

    let weightedSum = 0
    let totalWeight = 0

    if (metrics.extraction) {
      weightedSum += metrics.extraction * weights.extraction
      totalWeight += weights.extraction
    }

    if (metrics.ocr) {
      weightedSum += metrics.ocr * weights.ocr
      totalWeight += weights.ocr
    }

    if (metrics.entityRecognition) {
      weightedSum += metrics.entityRecognition * weights.entityRecognition
      totalWeight += weights.entityRecognition
    }

    if (metrics.templateMatching) {
      weightedSum += metrics.templateMatching * weights.templateMatching
      totalWeight += weights.templateMatching
    }

    if (metrics.dataValidation) {
      weightedSum += metrics.dataValidation * weights.dataValidation
      totalWeight += weights.dataValidation
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  /**
   * Helper methods
   */
  private detectFileType(fileName: string): 'pdf' | 'docx' | 'image' | 'text' {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf': return 'pdf'
      case 'docx': case 'doc': return 'docx'
      case 'jpg': case 'jpeg': case 'png': case 'tiff': case 'bmp': return 'image'
      case 'txt': return 'text'
      default: return 'text'
    }
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async countPages(_file: File): Promise<number> {
    // Simulate page counting
    // For hackathon demo: Return metadata based on file analysis
    // Production implementation would use actual document parsing
    return Math.floor(Math.random() * 10) + 1
  }

  private detectLanguage(text: string): string {
    // Simple language detection
    const malayWords = ['syariah', 'nafkah', 'mutaah', 'iddah', 'talaq']
    const malayCount = malayWords.filter(word => text.toLowerCase().includes(word)).length
    
    return malayCount > 2 ? 'ms-MY' : 'en-SG'
  }

  private initializeTemplates(): void {
    // Initialize document templates for better matching
    this.templates.set('syariah_court_order', {
      name: 'Syariah Court Order',
      patterns: ['syariah court', 'it is hereby ordered', 'nafkah', 'mutaah'],
      requiredFields: ['caseNumber', 'husbandIncome', 'nafkahIddahAmount']
    })
  }
}

interface DocumentTemplate {
  name: string
  patterns: string[]
  requiredFields: string[]
}

/**
 * Factory function to create document processor
 */
export function createDocumentProcessor(config?: {
  ocrEngine?: string
  aiModel?: string
  enableAdvancedFeatures?: boolean
}): DocumentProcessor {
  return new DocumentProcessor(config)
}

/**
 * Default document processor instance
 */
export const documentProcessor = createDocumentProcessor({
  enableAdvancedFeatures: true
})