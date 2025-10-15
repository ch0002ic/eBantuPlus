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

import { Buffer } from 'buffer'
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
type PdfParseFn = (dataBuffer: Buffer | Uint8Array, options?: unknown) => Promise<{
  text: string
  info?: unknown
  metadata?: unknown
  numpages?: number
  numrender?: number
}>

let pdfParseLoader: Promise<PdfParseFn> | null = null

const getPdfParse = async (): Promise<PdfParseFn> => {
  if (!pdfParseLoader) {
    pdfParseLoader = import('pdf-parse/lib/pdf-parse.js').then((mod) => {
      const parseFn = (mod.default ?? mod) as PdfParseFn
      return parseFn
    })
  }
  return pdfParseLoader
}

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
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const parsePdf = await getPdfParse()
      const pdfData = await parsePdf(buffer)
      const extractedText = (pdfData.text || '').trim()

      if (extractedText.length > 0) {
        return extractedText
      }

      if (enableOCR) {
        console.warn(`Empty PDF text extracted from ${file.name}, falling back to OCR`)
        return await this.performOCR(file)
      }

      return ''
    } catch (error) {
      console.error('PDF extraction failed, attempting OCR fallback', error)
      if (enableOCR) {
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
    const extractedData: Partial<ExtractedData> = {}
    const normalisedText = text.replace(/\s+/g, ' ')
    const lowerText = normalisedText.toLowerCase()

    const parseCurrency = (value: string): number | undefined => {
      const numeric = parseFloat(value.replace(/[$,\s]/g, ''))
      return Number.isFinite(numeric) ? numeric : undefined
    }

    const matchWithPatterns = (
      patterns: RegExp[],
      handler: (match: RegExpMatchArray) => number | undefined
    ): number | undefined => {
      for (const pattern of patterns) {
        const match = normalisedText.match(pattern)
        if (match) {
          const result = handler(match)
          if (result !== undefined) {
            return result
          }
        }
      }
      return undefined
    }

    // Extract case number or citation
    const casePatterns = [
      /originating\s+summons\s+no\s+([A-Za-z0-9\/-]+)/i,
      /case\s+(?:no|number)\s*[:#]?\s*([A-Za-z0-9\/-]+)/i
    ]
    for (const pattern of casePatterns) {
      const match = normalisedText.match(pattern)
      if (match?.[1]) {
        extractedData.caseNumber = match[1].trim()
        break
      }
    }

    if (!extractedData.caseNumber) {
      const citationMatch = normalisedText.match(/\[\d{4}\]\s+SGSYC\s+\d+/i)
      if (citationMatch) {
        extractedData.caseNumber = citationMatch[0].trim()
      }
    }

    // Extract nafkah iddah monthly amount
    const nafkahAmount = matchWithPatterns([
      /nafkah\s+iddah[^$]{0,120}\$\s*([\d,.]+(?:\.\d{2})?)/i,
      /nafkah\s+iddah[^\d]{0,80}([\d,.]+(?:\.\d{2})?)/i
    ], (match) => parseCurrency(match[1]))

    if (nafkahAmount !== undefined) {
      extractedData.nafkahIddahAmount = nafkahAmount
    }

    // Extract mutaah daily amount. Prefer per-day references, otherwise derive average per day from lump sum by dividing by 30.
    let mutaahAmount = matchWithPatterns([
      /mutaah[^$]{0,120}\$\s*([\d,.]+(?:\.\d{2})?)\s*(?:per\s+day|a\s+day)/i,
      /mutaah[^$]{0,120}\$\s*([\d,.]+(?:\.\d{2})?)\s*(?:per\s+month|monthly)/i
    ], (match) => parseCurrency(match[1]))

    if (mutaahAmount === undefined) {
      const lumpSum = matchWithPatterns([
        /mutaah[^$]{0,160}\$\s*([\d,.]+(?:\.\d{2})?)/i
      ], (match) => parseCurrency(match[1]))

      if (lumpSum !== undefined) {
        // Approximate to daily value over 180 days if no explicit period provided
        mutaahAmount = Number((lumpSum / 180).toFixed(2))
      }
    }

    if (mutaahAmount !== undefined) {
      extractedData.mutaahAmount = mutaahAmount
    }

    // Extract husband income (prefer explicit monthly references)
    let husbandIncome = matchWithPatterns([
      /husband[^$]{0,160}\$\s*([\d,.]+(?:\.\d{2})?)\s*(?:per\s+month|monthly)/i,
      /plaintiff[^$]{0,160}\$\s*([\d,.]+(?:\.\d{2})?)\s*(?:per\s+month|monthly)/i,
      /income[^$]{0,80}\$\s*([\d,.]+(?:\.\d{2})?)\s*(?:per\s+month|monthly)/i
    ], (match) => parseCurrency(match[1]))

    if (husbandIncome === undefined) {
      // Handle annual income statements
      const annualIncome = matchWithPatterns([
        /husband[^$]{0,160}\$\s*([\d,.]+(?:\.\d{2})?)\s*(?:per\s+year|annual|a\s+year)/i,
        /income[^$]{0,80}\$\s*([\d,.]+(?:\.\d{2})?)\s*(?:per\s+year|annual|a\s+year)/i
      ], (match) => parseCurrency(match[1]))

      if (annualIncome !== undefined) {
        husbandIncome = Number((annualIncome / 12).toFixed(2))
      }
    }

    if (husbandIncome === undefined) {
      // Check for statements like "about $3,183.00 per month"
      husbandIncome = matchWithPatterns([
        /about\s+\$\s*([\d,.]+(?:\.\d{2})?)\s*per\s+month/i
      ], (match) => parseCurrency(match[1]))
    }

    if (husbandIncome !== undefined) {
      extractedData.husbandIncome = husbandIncome
    }

    // Extract marriage duration when explicitly stated
    const marriageDurationMatch = normalisedText.match(/duration\s+of\s+marriage[^\d]{0,40}([\d.]+)\s*(?:years?|yrs?)/i)
    if (marriageDurationMatch?.[1]) {
      const durationValue = parseFloat(marriageDurationMatch[1])
      if (Number.isFinite(durationValue)) {
        extractedData.marriageDuration = Math.round(durationValue * 12)
      }
    }

    // Detect consent order
    extractedData.isConsentOrder = /consent\s+order|parties\s+agree|by\s+consent/i.test(lowerText)

    // Document type classification
    if (/judgment|voluntary\s+ex\s+tempore/i.test(lowerText)) {
      extractedData.documentType = 'judgment'
    } else if (/consent\s+order/i.test(lowerText)) {
      extractedData.documentType = 'consent_order'
    } else if (/application|summons/i.test(lowerText)) {
      extractedData.documentType = 'application'
    }

    // Check if contains financial data
    extractedData.containsFinancialData = Boolean(
      extractedData.husbandIncome ||
      extractedData.nafkahIddahAmount ||
      extractedData.mutaahAmount
    )

    const extractedFieldCount = [
      extractedData.husbandIncome,
      extractedData.nafkahIddahAmount,
      extractedData.mutaahAmount,
      extractedData.caseNumber,
      extractedData.marriageDuration
    ].filter((value) => value !== undefined && value !== null).length

    const confidence = Math.min(0.95, 0.6 + extractedFieldCount * 0.08)

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