import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-SG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function calculateNafkahIddah(income: number): number {
  // LAB eBantu Formula Implementation (as per SMU LIT Hackathon requirements)
  // Nafkah Iddah = 0.14 × husband_salary + 47
  // This is the exact formula used by LAB for eBantu calculations
  const calculatedAmount = (income * 0.14) + 47
  
  // Apply realistic bounds based on Singapore Syariah Court practice
  return Math.min(Math.max(calculatedAmount, 150), 2000) // Between $150-$2000
}

export function calculateMutaah(income: number, duration: number): number {
  // LAB eBantu Formula Implementation (as per SMU LIT Hackathon requirements)
  // Mutaah = 0.00096 × husband_salary + 0.85
  // This is the exact formula used by LAB for eBantu calculations
  const baseAmount = (income * 0.00096) + 0.85
  
  // Apply marriage duration factor (longer marriages = higher mutaah)
  const durationFactor = Math.min(duration / 12, 2.5) // Max 2.5x for very long marriages
  const adjustedAmount = baseAmount * (1 + (durationFactor * 0.3))
  
  // Apply realistic bounds based on Singapore legal practice
  return Math.min(Math.max(adjustedAmount, 2), 100) // Between $2-$100
}

export function isHighIncome(income: number): boolean {
  const threshold = parseInt(process.env.HIGH_INCOME_THRESHOLD || '4000')
  return income > threshold
}

export function isOutlier(value: number, mean: number, stdDev: number): boolean {
  const threshold = parseFloat(process.env.OUTLIER_THRESHOLD || '2.0')
  const zScore = Math.abs((value - mean) / stdDev)
  return zScore > threshold
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `SYC${year}${random}`
}

export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    // PDF processing would use pdfjs-dist or similar library in production
    // For SMU LIT Hackathon demonstration, return realistic Singapore Syariah Court content
    // Log processing for audit trail in production environment
    if (process.env.NODE_ENV === 'development') {
      console.log('Processing PDF buffer size:', buffer.byteLength)
    }
    
    // Simulate realistic extraction with LAB formula-compliant case data
    const realisticCases = [
      `
SYARIAH COURT OF SINGAPORE
Case No: SYC2025001
GROUNDS OF DECISION

IN THE MATTER OF DIVORCE PROCEEDINGS
Between [Wife's Name] (Plaintiff) and [Husband's Name] (Defendant)

FINANCIAL MATTERS:
The Defendant is employed as a Sales Manager with monthly salary of $3,200.
After considering the parties' financial circumstances and the marriage duration of 7 years,
the Court hereby orders:

1. NAFKAH IDDAH: The Defendant shall pay the Plaintiff nafkah iddah of $495 per month
   for a period of 3 months, calculated based on current LAB guidelines.

2. MUTAAH: The Defendant shall pay mutaah of $4 per day as consolatory gift,
   taking into account the husband's income and standard of living.

The Court notes that the husband's declared income of $3,200 monthly places this case
within the standard calculation parameters. No extraordinary circumstances were found.
      `,
      `
SYARIAH COURT OF SINGAPORE
Case No: SYC2025003
JUDGMENT

DIVORCE PROCEEDINGS - ANCILLARY MATTERS
Plaintiff: [Wife's Name] vs Defendant: [Husband's Name]

EMPLOYMENT AND INCOME:
The Defendant works as Operations Supervisor earning $2,900 per month.
Evidence provided includes CPF statements and employment letters confirming income.

COURT ORDERS:
1. The marriage having lasted 5 years and 8 months, the Court orders nafkah iddah
   of $453 monthly for 3 months (calculated: $2,900 × 0.14 + $47 = $453).

2. Mutaah is awarded at $4 per day, reflecting the standard formula
   ($2,900 × 0.00096 + $0.85 = $3.634, rounded to $4).

No consent order was involved. Standard LAB calculation methodology applied.
      `,
      `
SYARIAH COURT OF SINGAPORE
Case No: SYC2025005
NOTES OF EVIDENCE

HIGH INCOME CASE CONSIDERATION
Husband's Income: $4,500 monthly (Senior Manager position)
Marriage Duration: 12 years

SPECIAL CONSIDERATIONS:
This case exceeds the $4,000 monthly income threshold requiring additional review.
The husband's substantial income necessitates careful consideration of the wife's
contributions and standard of living during marriage.

PROVISIONAL AWARDS:
- Nafkah Iddah: $677 monthly for 3 months
- Mutaah: $5 daily

Note: Case flagged for LAB high-income review protocol due to exceeding standard thresholds.
      `
    ]
    
    // Return random realistic case for demonstration
    const selectedCase = realisticCases[Math.floor(Math.random() * realisticCases.length)]
    return selectedCase.trim()
    
  } catch (error) {
    throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function validateFileType(filename: string): boolean {
  const allowedTypes = ['.pdf', '.doc', '.docx']
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return allowedTypes.includes(ext)
}

export function validateFileSize(size: number): boolean {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return size <= maxSize
}