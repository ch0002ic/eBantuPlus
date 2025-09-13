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
  // Simple formula for demonstration
  // In production, this would use the ML-generated formula
  const baseAmount = income * 0.33 // 33% of income
  return Math.min(Math.max(baseAmount, 200), 1500) // Between $200-$1500
}

export function calculateMutaah(income: number, duration: number): number {
  // Simple formula for demonstration
  const baseAmount = income * 0.1 / 30 // 10% of monthly income divided by 30 days
  const durationFactor = Math.min(duration / 12, 2) // Max 2x for long marriages
  return Math.min(Math.max(baseAmount * durationFactor, 3), 50) // Between $3-$50
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
    // PDF processing would go here - using pdfjs-dist or similar
    // For hackathon demo, return structured placeholder
    return `
      SYARIAH COURT CASE EXTRACT
      Case No: SYC2024001
      Husband's Income: $2,800/month
      Nafkah Iddah Awarded: $400/month
      Mutaah Awarded: $5/day
      Marriage Duration: 18 months
    `.trim()
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