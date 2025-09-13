/**
 * Simple in-memory storage for cases
 * In production, this would be replaced with a proper database
 */

interface CaseData {
  id: string
  title: string
  caseNumber?: string
  status: 'pending' | 'processing' | 'validated' | 'approved' | 'rejected'
  uploadedAt: string
  uploadedBy: string
  extractedData: {
    husbandIncome?: number | null
    nafkahIddah?: number | null
    mutaah?: number | null
    marriageDuration?: number | null
    confidence: number
  }
  extractedText: string
  originalDocument: string
  pdfContent: {
    fileName: string
    uploadDate: Date
    fileSize: string
    pageCount: number
    fullText: string
    keyExtracts: {
      parties: string[]
      courtDetails: string
      financialInfo: string[]
      awards: string[]
    }
  }
}

// In-memory storage (will be replaced with database)
const casesStorage: CaseData[] = [
  {
    id: 'SYC2025001',
    title: '[2025] SGHCF 001 - Lathibaby Bevi v Abdul Mustapha',
    caseNumber: 'SYC2025001',
    status: 'validated',
    uploadedAt: '2 hours ago',
    uploadedBy: 'LAB Officer Rahman',
    extractedData: {
      husbandIncome: 3500,
      nafkahIddah: 537,
      mutaah: 4,
      marriageDuration: 8,
      confidence: 0.95
    },
    extractedText: 'Reference: Similar to [1996] SGHC 260 Lathibaby Bevi v Abdul Mustapha. Husband monthly salary $3,500. Court awarded nafkah iddah $537 for 3 months pursuant to s.113 Women\'s Charter...',
    originalDocument: 'SYC2025001_judgment.pdf',
    pdfContent: {
      fileName: 'SYC2025001_Judgment.pdf',
      uploadDate: new Date('2025-09-13T08:00:00'),
      fileSize: '2.3 MB',
      pageCount: 12,
      fullText: 'SYARIAH COURT JUDGMENT - Case No: SYC2025001 - Between LATHIBABY BEVI and ABDUL MUSTAPHA BIN HASSAN...',
      keyExtracts: {
        parties: ['LATHIBABY BEVI (Plaintiff)', 'ABDUL MUSTAPHA BIN HASSAN (Defendant)'],
        courtDetails: 'Syariah Court of Singapore - Case No: SYC2025001',
        financialInfo: ['Defendant monthly income: $3,500', 'Employment: Singapore Technologies Engineering Ltd'],
        awards: ['Nafkah iddah: $537 per month for 3 months', 'Mutaah: $4 per day']
      }
    }
  },
  {
    id: 'SYC2025002',
    title: '[2025] SGHCF 002 - Muhd Munir v Noor Hidah',
    caseNumber: 'SYC2025002',
    status: 'pending',
    uploadedAt: '4 hours ago',
    uploadedBy: 'LAB Officer Siti',
    extractedData: {
      husbandIncome: 4200,
      nafkahIddah: 635,
      mutaah: 4,
      marriageDuration: 10,
      confidence: 0.87
    },
    extractedText: 'In the matter of Muhd Munir v Noor Hidah. Court finds husband has monthly income of $4,200 as IT Professional. Nafkah iddah awarded at $635 per month...',
    originalDocument: 'SYC2025002_order.pdf',
    pdfContent: {
      fileName: 'SYC2025002_Court_Order.pdf',
      uploadDate: new Date('2025-09-13T06:30:00'),
      fileSize: '1.8 MB',
      pageCount: 8,
      fullText: 'SYARIAH COURT ORDER - Case No: SYC2025002 - Between MUHD MUNIR BIN ABDULLAH and NOOR HIDAH BINTE OMAR...',
      keyExtracts: {
        parties: ['MUHD MUNIR BIN ABDULLAH (Petitioner)', 'NOOR HIDAH BINTE OMAR (Respondent)'],
        courtDetails: 'Syariah Court of Singapore - Case No: SYC2025002',
        financialInfo: ['Petitioner monthly income: $4,200', 'Employment: Senior Software Engineer, GovTech Singapore'],
        awards: ['Nafkah iddah: $635 per month for 3 months', 'Mutaah: $4 per day for marriage duration']
      }
    }
  }
]

export function getAllCases(): CaseData[] {
  return casesStorage
}

export function addCase(caseData: Omit<CaseData, 'id'>): CaseData {
  const newId = `SYC2025${String(casesStorage.length + 1).padStart(3, '0')}`
  const newCase: CaseData = {
    id: newId,
    ...caseData
  }
  
  casesStorage.unshift(newCase) // Add to beginning for most recent first
  return newCase
}

export function getCaseById(id: string): CaseData | undefined {
  return casesStorage.find(caseItem => caseItem.id === id)
}

export function updateCase(id: string, updates: Partial<CaseData>): CaseData | null {
  const index = casesStorage.findIndex(caseItem => caseItem.id === id)
  if (index === -1) return null
  
  casesStorage[index] = { ...casesStorage[index], ...updates }
  return casesStorage[index]
}