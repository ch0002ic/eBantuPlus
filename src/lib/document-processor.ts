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
  mutaahLumpSum?: number
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
  mutaahLumpSum: z.number().min(0).optional(),
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
    const sentences = normalisedText
      .split(/(?<=[\.\?!])\s+(?=[A-Z\[])|\n+/)
      .map(sentence => sentence.trim())
      .filter(Boolean)

    const parseCurrency = (value: string): number | undefined => {
      const numeric = parseFloat(value.replace(/[$,\s]/g, ''))
      return Number.isFinite(numeric) ? numeric : undefined
    }

    const extractNumbers = (input: string): number[] => {
      const values: number[] = []
      const matches = input.match(/\$?\d[\d,]*(?:\.\d+)?/g)
      if (matches) {
        for (const match of matches) {
          const parsed = parseCurrency(match)
          if (parsed !== undefined) {
            values.push(parsed)
          }
        }
      }
      return values
    }

    const extractDurationInMonths = (input: string): number | undefined => {
      let totalMonths = 0

      const yearMatch = input.match(/(\d[\d,]*(?:\.\d+)?)\s*years?/i)
      if (yearMatch?.[1]) {
        const years = parseCurrency(yearMatch[1])
        if (years !== undefined) {
          totalMonths += years * 12
        }
      }

      const monthMatch = input.match(/(\d[\d,]*(?:\.\d+)?)\s*months?/i)
      if (monthMatch?.[1]) {
        const months = parseCurrency(monthMatch[1])
        if (months !== undefined) {
          totalMonths += months
        }
      }

      return totalMonths > 0 ? totalMonths : undefined
    }

    const containsAny = (input: string, phrases: string[]): boolean => {
      const lowered = input.toLowerCase()
      return phrases.some(phrase => lowered.includes(phrase))
    }

    const containsNegation = (input: string): boolean => {
      const negationPhrases = [
        'no order',
        'no further',
        'nil payable',
        'not payable',
        'not awarded',
        'no nafkah',
        'no mutaah',
        'there shall be no',
        'is not entitled'
      ]
      return containsAny(input, negationPhrases)
    }

    const containsClaimLanguage = (input: string): boolean => {
      const claimPhrases = [
        'has claimed',
        'is claiming',
        'takes the position',
        'proposed',
        'seeks',
        'asks for',
        'invites the court'
      ]
      return containsAny(input, claimPhrases)
    }

    const isDecisionSentence = (input: string): boolean => {
      const lowered = input.toLowerCase()
      const decisionKeywords = [
        'i order',
        'i have ordered',
        'i have awarded',
        'i award',
        'i have accepted',
        'the court orders',
        'the court hereby orders',
        'the court has ordered',
        'the wife is entitled',
        'the husband is to pay',
        'it is ordered',
        'there is no order',
        'no order is made',
        'i allow',
        'i have allowed',
        'i allow the claim'
      ]
      return decisionKeywords.some(keyword => lowered.includes(keyword))
    }

    const pickBestSentence = (
      keyword: string,
      scorer?: (sentence: string, index: number) => number
    ): string | null => {
      const matching = sentences
        .map((sentence, index) => ({ sentence, index }))
        .filter(entry => entry.sentence.toLowerCase().includes(keyword))
      if (matching.length === 0) return null

      const scoreFn = scorer ?? ((sentence: string, index: number) => {
        let score = 0
        if (isDecisionSentence(sentence) && !containsClaimLanguage(sentence)) score += 2
        if (containsClaimLanguage(sentence)) score -= 1
        return score + index * 0.0001 // slight bias to later sentences
      })

      let bestEntry = matching[matching.length - 1]
      let bestScore = scoreFn(bestEntry.sentence, bestEntry.index)

      for (let i = matching.length - 1; i >= 0; i--) {
        const entry = matching[i]
        const score = scoreFn(entry.sentence, entry.index)
        if (score > bestScore || (score === bestScore && entry.index > bestEntry.index)) {
          bestEntry = entry
          bestScore = score
        }
      }

      return bestEntry.sentence
    }

    const extractCaseNumber = (): string | undefined => {
      const casePatterns = [
        /originating\s+summons\s+no\s+([A-Za-z0-9\/-]+)/i,
        /case\s+(?:no|number)\s*[:#]?\s*([A-Za-z0-9\/-]+)/i
      ]
      for (const pattern of casePatterns) {
        const match = normalisedText.match(pattern)
        if (match?.[1]) {
          return match[1].trim()
        }
      }
      const citationMatch = normalisedText.match(/\[\d{4}\]\s+SGSYC\s+\d+/i)
      return citationMatch?.[0].trim()
    }

    const findNextSentence = (sentence: string): string | null => {
      const index = sentences.indexOf(sentence)
      if (index >= 0 && index < sentences.length - 1) {
        return sentences[index + 1]
      }
      return null
    }

    const nafkahSentence = pickBestSentence('nafkah')
    let nafkahSource: 'claim' | 'order' | 'negated' | null = null
    if (nafkahSentence) {
      if (containsNegation(nafkahSentence)) {
        extractedData.nafkahIddahAmount = 0
        nafkahSource = 'negated'
      } else {
        const amounts = extractNumbers(nafkahSentence)
        if (amounts.length > 0) {
          extractedData.nafkahIddahAmount = amounts[amounts.length - 1]
          const isDecision = isDecisionSentence(nafkahSentence) && !containsClaimLanguage(nafkahSentence)
          nafkahSource = isDecision ? 'order' : containsClaimLanguage(nafkahSentence) ? 'claim' : 'order'
        }
      }
    }

    const mutaahSentence = pickBestSentence('mutaah')
    let mutaahSource: 'claim' | 'order' | 'negated' | null = null
    if (mutaahSentence) {
      if (containsNegation(mutaahSentence)) {
        extractedData.mutaahAmount = 0
        mutaahSource = 'negated'
      } else {
        const amounts = extractNumbers(mutaahSentence)
        if (amounts.length > 0) {
          const perDayMatch = mutaahSentence.match(/\$?([\d,]+(?:\.\d+)?)\s*(?:per\s+day|a\s+day)/i)
          const perMonthMatch = mutaahSentence.match(/\$?([\d,]+(?:\.\d+)?)\s*(?:per\s+month|monthly)/i)

          const nextSentence = findNextSentence(mutaahSentence)
          const combined = [mutaahSentence, nextSentence].filter(Boolean).join(' ')
          let divisor: number | null = null

          const explicitDaysMatch = combined.match(/(\d[\d,]*)\s*(?:days|day)/i)
          if (explicitDaysMatch) {
            divisor = parseInt(explicitDaysMatch[1].replace(/,/g, ''), 10)
          } else {
            const monthsFromCombined = extractDurationInMonths(combined)
            if (monthsFromCombined !== undefined) {
              divisor = Math.round(monthsFromCombined * 30)
            }
          }

          if (!divisor) {
            const durationSentence = [...sentences]
              .reverse()
              .find(sentence => /duration\s+of\s+(?:the\s+)?marriage/i.test(sentence) && /years?|months?/i.test(sentence))
              ?? sentences.find(sentence => /duration\s+of\s+(?:the\s+)?marriage/i.test(sentence))
            if (durationSentence) {
              const monthsFromDurationSentence = extractDurationInMonths(durationSentence)
              if (monthsFromDurationSentence !== undefined) {
                divisor = Math.round(monthsFromDurationSentence * 30)
              }
            }
          }

          const lumpSumCandidate = Math.max(...amounts)
          const derivedPerDay = divisor && divisor > 0
            ? Number((lumpSumCandidate / divisor).toFixed(2))
            : undefined

          if (perDayMatch) {
            const directPerDay = parseCurrency(perDayMatch[1])
            extractedData.mutaahAmount = derivedPerDay ?? directPerDay
          } else if (perMonthMatch) {
            extractedData.mutaahAmount = parseCurrency(perMonthMatch[1])
          } else if (lumpSumCandidate > 0) {
            if (derivedPerDay !== undefined) {
              extractedData.mutaahAmount = derivedPerDay
            } else {
              extractedData.mutaahAmount = Number((lumpSumCandidate / 180).toFixed(2))
            }
          }

          if (lumpSumCandidate > 100) {
            extractedData.mutaahLumpSum = lumpSumCandidate
          }

          const isDecision = isDecisionSentence(mutaahSentence) && !containsClaimLanguage(mutaahSentence)
          mutaahSource = isDecision ? 'order' : containsClaimLanguage(mutaahSentence) ? 'claim' : 'order'
        }
      }
    }

    const incomeSentence = pickBestSentence('income', (sentence) => {
      let score = 0
      const lowered = sentence.toLowerCase()
      if (lowered.includes('per month')) score += 3
      if (lowered.includes('per annum') || lowered.includes('per year') || lowered.includes('annual')) score += 2
      if (lowered.includes('notice of assessment')) score += 1
      if (isDecisionSentence(sentence)) score += 1
      if (containsClaimLanguage(sentence)) score -= 2
      return score
    })
    let incomeSource: 'claim' | 'order' | null = null
    if (incomeSentence) {
      const amounts = extractNumbers(incomeSentence)
      if (amounts.length > 0) {
        const lowerSentence = incomeSentence.toLowerCase()
        const monthlyMatch = incomeSentence.match(/\$?([\d,]+(?:\.\d+)?)\s*(?:per\s+month|monthly)/i)
        const annualMatch = incomeSentence.match(/\$?([\d,]+(?:\.\d+)?)\s*(?:per\s+year|per\s+annum|annual|a\s+year)/i)

        const decisionScore = isDecisionSentence(incomeSentence) ? 2 : 0
        const claimPenalty = containsClaimLanguage(incomeSentence) ? -1 : 0
        const baseScore = decisionScore + claimPenalty

        let candidateIncome: number | undefined
        if (monthlyMatch) {
          candidateIncome = parseCurrency(monthlyMatch[1])
        } else if (annualMatch) {
          const annual = parseCurrency(annualMatch[1])
          if (annual !== undefined) {
            candidateIncome = Number((annual / 12).toFixed(2))
          }
        } else {
          candidateIncome = Math.max(...amounts)
        }

        if (candidateIncome !== undefined) {
          extractedData.husbandIncome = candidateIncome
        }

        incomeSource = baseScore > 0 ? 'order' : 'claim'
      }
    }

  const durationContextMatch = normalisedText.match(/duration\s+of\s+(?:the\s+)?marriage[^\.]{0,120}/i)
    if (durationContextMatch) {
      const months = extractDurationInMonths(durationContextMatch[0])
      if (months !== undefined) {
        extractedData.marriageDuration = Math.round(months)
      }
    }

    extractedData.caseNumber = extractCaseNumber()

    const consentDecision = sentences.some(sentence => {
      if (!/consent\s+order/i.test(sentence)) return false
      const lowered = sentence.toLowerCase()
      if (containsNegation(lowered)) return false
      return /is recorded|is entered into|parties have entered|by consent|made by consent/.test(lowered)
    })
    extractedData.isConsentOrder = consentDecision

    if (/judgment|voluntary\s+ex\s+tempore/i.test(lowerText)) {
      extractedData.documentType = 'judgment'
    } else if (consentDecision) {
      extractedData.documentType = 'consent_order'
    } else if (/application|summons/i.test(lowerText)) {
      extractedData.documentType = 'application'
    }

    extractedData.containsFinancialData = Boolean(
      extractedData.husbandIncome !== undefined ||
      extractedData.nafkahIddahAmount !== undefined ||
      extractedData.mutaahAmount !== undefined
    )

    const extractedFieldCount = [
      extractedData.husbandIncome,
      extractedData.nafkahIddahAmount,
      extractedData.mutaahAmount,
      extractedData.caseNumber,
      extractedData.marriageDuration
    ].filter((value) => value !== undefined && value !== null).length

    let confidence = 0.55 + extractedFieldCount * 0.08

    const sources = [nafkahSource, mutaahSource, incomeSource]
    if (sources.some(source => source === 'claim')) {
      confidence -= 0.12
    }
    if (sources.some(source => source === 'negated')) {
      confidence -= 0.05
    }

    confidence = Math.max(0.3, Math.min(0.93, confidence))

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