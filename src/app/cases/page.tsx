'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

// Type definitions
type CaseData = {
  id: string
  title: string
  caseNumber: string
  status: string
  uploadedAt: Date
  husbandIncome: number
  nafkahIddah: number
  mutaah: number
  confidence: number
  uploadedBy: { name: string }
  extractedText: string
  marriageDuration: number
  exclusionReason: string | null
  pdfContent?: {
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

type EditHistoryItem = {
  caseId: string
  action: string
  timestamp: string
  changes: Partial<CaseData> | Record<string, { from: unknown; to: unknown }>
  userId: string
}

// Realistic Singapore Syariah Court case data for LAB eBantu demonstration
// Based on actual nafkah iddah ($200-$500/month) and mutaah ($3-$7/day) ranges
// References authentic Singapore court citation formats from LawNet database
const realisticCaseData: CaseData[] = [
  {
    id: '1',
    title: '[2025] SGHCF 001 - Lathibaby Bevi v Abdul Mustapha (Divorce Proceedings)',
    caseNumber: 'SYC2025001',
    status: 'VALIDATED',
    uploadedAt: new Date('2025-09-13T08:00:00'),
    husbandIncome: 3500, // $3,500/month income
    nafkahIddah: 537, // Using LAB formula: 0.14 × 3500 + 47 = 537
    mutaah: 4, // Using LAB formula: 0.00096 × 3500 + 0.85 = 4.21 ≈ 4
    confidence: 0.95,
    uploadedBy: { name: 'LAB Officer Rahman' },
    extractedText: 'Reference: Similar to [1996] SGHC 260 Lathibaby Bevi v Abdul Mustapha. Husband monthly salary $3,500. Court awarded nafkah iddah $537 for 3 months pursuant to s.113 Women\'s Charter...',
    marriageDuration: 8,
    exclusionReason: null,
    pdfContent: {
      fileName: 'SYC2025001_Judgment.pdf',
      uploadDate: new Date('2025-09-13T08:00:00'),
      fileSize: '2.3 MB',
      pageCount: 12,
      fullText: `IN THE SYARIAH COURT OF SINGAPORE
      
Case No: SYC2025001
Between: LATHIBABY BEVI (Plaintiff) and ABDUL MUSTAPHA BIN HASSAN (Defendant)

JUDGMENT

1. BACKGROUND
The parties were married on 15th March 2017 and have been married for approximately 8 years. The plaintiff seeks dissolution of marriage and financial relief pursuant to sections 113 and 114 of the Women's Charter (Cap. 353).

2. FINANCIAL CIRCUMSTANCES
The defendant's monthly income is established at $3,500 based on his employment with Singapore Technologies Engineering Ltd. The court has considered the parties' standard of living during the marriage and the plaintiff's reasonable needs during the iddah period.

3. NAFKAH IDDAH
Having regard to the provisions of section 113 of the Women's Charter and the guidelines established in previous cases including [1996] SGHC 260 Lathibaby Bevi v Abdul Mustapha, the court awards nafkah iddah in the sum of $537 per month for a period of 3 months.

4. MUTAAH
The court awards mutaah in the sum of $4 per day, being compensation for the dissolution of marriage as provided under Islamic law and in accordance with established precedents.

5. ORDERS
The court hereby orders:
(a) The marriage between the parties is dissolved
(b) The defendant shall pay nafkah iddah of $537 per month for 3 months
(c) The defendant shall pay mutaah of $4 per day
(d) Costs reserved

Dated this 13th day of September 2025
[Signature]
Judge of the Syariah Court`,
      keyExtracts: {
        parties: ['LATHIBABY BEVI (Plaintiff)', 'ABDUL MUSTAPHA BIN HASSAN (Defendant)'],
        courtDetails: 'Syariah Court of Singapore - Case No: SYC2025001',
        financialInfo: [
          'Defendant monthly income: $3,500',
          'Employment: Singapore Technologies Engineering Ltd',
          'Marriage duration: 8 years'
        ],
        awards: [
          'Nafkah iddah: $537 per month for 3 months',
          'Mutaah: $4 per day',
          'Legal basis: Sections 113 and 114 Women\'s Charter'
        ]
      }
    }
  },
  {
    id: '2',
    title: '[2025] SGHCF 002 - Muhd Munir v Noor Hidah (Maintenance Proceedings)',
    caseNumber: 'SYC2025002',
    status: 'PENDING',
    uploadedAt: new Date('2025-09-13T10:30:00'),
    husbandIncome: 2800, // $2,800/month income
    nafkahIddah: 439, // Using LAB formula: 0.14 × 2800 + 47 = 439
    mutaah: 4, // Using LAB formula: 0.00096 × 2800 + 0.85 = 3.54 ≈ 4
    confidence: 0.87,
    uploadedBy: { name: 'LAB Officer Siti' },
    extractedText: 'Reference: [1990] SGHC 78 Muhd Munir v Noor Hidah. Husband income $2,800 monthly. Nafkah iddah awarded $439 pursuant to established precedent...',
    marriageDuration: 5,
    exclusionReason: null,
    pdfContent: {
      fileName: 'SYC2025002_Application.pdf',
      uploadDate: new Date('2025-09-13T10:30:00'),
      fileSize: '1.8 MB',
      pageCount: 8,
      fullText: `SYARIAH COURT OF SINGAPORE
      
Application No: SYC2025002
MUHD MUNIR BIN ABDULLAH (Applicant) v NOOR HIDAH BTE SALLEH (Respondent)

APPLICATION FOR MAINTENANCE

1. PARTIES
The Applicant and Respondent were married on 22nd June 2020 and have been married for approximately 5 years. The marriage has broken down irretrievably.

2. APPLICANT'S CIRCUMSTANCES  
The Applicant is employed as a Senior Executive with DBS Bank Limited earning a monthly salary of $2,800. He has been consistently employed for the past 7 years.

3. RESPONDENT'S NEEDS
The Respondent is currently unemployed and requires maintenance for her living expenses during the iddah period. She has no independent means of income.

4. PRAYERS
The Applicant seeks:
(a) Dissolution of marriage
(b) Payment of nafkah iddah of $439 per month for 3 months
(c) Payment of mutaah of $4 per day
(d) Such other relief as the Court deems fit

SUPPORTING DOCUMENTS:
- Employment contract and salary slips
- Bank statements for past 6 months  
- Marriage certificate
- Identity cards of both parties

Filed this 13th day of September 2025
[Legal signature]
Solicitor for Applicant`,
      keyExtracts: {
        parties: ['MUHD MUNIR BIN ABDULLAH (Applicant)', 'NOOR HIDAH BTE SALLEH (Respondent)'],
        courtDetails: 'Syariah Court of Singapore - Application No: SYC2025002',
        financialInfo: [
          'Applicant monthly salary: $2,800',
          'Employment: DBS Bank Limited (Senior Executive)',
          'Marriage duration: 5 years',
          'Respondent: Currently unemployed'
        ],
        awards: [
          'Sought nafkah iddah: $439 per month for 3 months',
          'Sought mutaah: $4 per day',
          'Status: Application pending court decision'
        ]
      }
    }
  },
  {
    id: '3',
    title: '[2025] SGHCF 003 - Salijah bte Ab Latef v Mohd Irwan (Divorce with Custody)',
    caseNumber: 'SYC2025003',
    status: 'PROCESSING',
    uploadedAt: new Date('2025-09-13T12:15:00'),
    husbandIncome: 4500, // $4,500/month income (above threshold)
    nafkahIddah: 677, // Using LAB formula: 0.14 × 4500 + 47 = 677
    mutaah: 5, // Using LAB formula: 0.00096 × 4500 + 0.85 = 5.17 ≈ 5
    confidence: 0.92,
    uploadedBy: { name: 'LAB Officer Ahmad' },
    extractedText: 'Reference: [1996] SGCA 32 Salijah bte Ab Latef v Mohd Irwan bin Abdullah Teo. High income case. Husband salary $4,500. Court consideration of s.114 factors...',
    marriageDuration: 12,
    exclusionReason: 'Statistical Outlier' // Above $4,000 threshold
  },
  {
    id: '4',
    title: '[2025] SGHCF 004 - Rahimah bte Hussan v Zaine (Consent Order)',
    caseNumber: 'SYC2025004',
    status: 'EXCLUDED',
    uploadedAt: new Date('2025-09-13T14:45:00'),
    husbandIncome: 3200,
    nafkahIddah: 1000, // Mutually agreed amount (not formula-based)
    mutaah: 20, // Mutually agreed amount (not formula-based)
    confidence: 0.78,
    uploadedBy: { name: 'LAB Officer Aminah' },
    extractedText: 'Reference: [1995] SGHC 37 Rahimah bte Hussan v Zaine bin Yusoff. Parties have agreed by consent. Nafkah iddah $1,000 pursuant to mutual agreement...',
    marriageDuration: 6,
    exclusionReason: 'Consent Order'
  },
  {
    id: '5',
    title: '[2025] SGHCF 005 - Madiah bte Atan v Samsudin (Standard Maintenance)',
    caseNumber: 'SYC2025005',
    status: 'VALIDATED',
    uploadedAt: new Date('2025-09-12T16:20:00'),
    husbandIncome: 3000, // $3,000/month income
    nafkahIddah: 467, // Using LAB formula: 0.14 × 3000 + 47 = 467
    mutaah: 4, // Using LAB formula: 0.00096 × 3000 + 0.85 = 3.73 ≈ 4
    confidence: 0.94,
    uploadedBy: { name: 'LAB Officer Zainab' },
    extractedText: 'Reference: [1997] SGHC 239 Madiah bte Atan v Samsudin bin Budin. Husband monthly income $3,000. Standard case awarded per s.113 Women\'s Charter...',
    marriageDuration: 7,
    exclusionReason: null
  },
  {
    id: '6',
    title: '[2025] SGHCF 006 - Hafiani bte Abdul Karim v Mazlan (Complex Financials)',
    caseNumber: 'SYC2025006',
    status: 'FLAGGED',
    uploadedAt: new Date('2025-09-12T11:10:00'),
    husbandIncome: 2500,
    nafkahIddah: 800, // Outlier: much higher than formula prediction
    mutaah: 15, // Outlier: much higher than formula prediction
    confidence: 0.65,
    uploadedBy: { name: 'LAB Officer Rahman' },
    extractedText: 'Reference: [1995] SGHC 264 Hafiani bte Abdul Karim v Mazlan bin Redzuan. Complex case with unusual circumstances. High awards due to exceptional factors under s.114(1)(g)...',
    marriageDuration: 15,
    exclusionReason: 'Statistical Outlier'
  }
]

export default function CasesPage() {
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [incomeFilter, setIncomeFilter] = useState('ALL')
  const [exclusionFilter, setExclusionFilter] = useState('ALL')
  const [customMinIncome, setCustomMinIncome] = useState('')
  const [customMaxIncome, setCustomMaxIncome] = useState('')
  const [selectedCase, setSelectedCase] = useState<typeof realisticCaseData[0] | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'detail'>('table')
  const [showDebug, setShowDebug] = useState(false)
  
  // Edit functionality state
  const [editMode, setEditMode] = useState<'none' | 'single' | 'bulk'>('none')
  const [editingCase, setEditingCase] = useState<string | null>(null)
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set())
  const [editFormData, setEditFormData] = useState<Partial<CaseData>>({})
  const [bulkEditChanges, setBulkEditChanges] = useState<Partial<CaseData>>({})
  const [casesData, setCasesData] = useState<CaseData[]>([])
  const [showEditHistory, setShowEditHistory] = useState(false)
  const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch cases from API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/cases/simple')
        const result = await response.json()
        
        if (result.success) {
          // Map API data to match the expected format
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedCases = result.data.map((caseItem: any) => ({
            id: caseItem.id,
            title: caseItem.title,
            caseNumber: caseItem.caseNumber || caseItem.id,
            status: caseItem.status,
            uploadedAt: new Date(caseItem.pdfContent?.uploadDate || Date.now()),
            husbandIncome: caseItem.extractedData?.husbandIncome || 0,
            nafkahIddah: caseItem.extractedData?.nafkahIddah || 0,
            mutaah: caseItem.extractedData?.mutaah || 0,
            confidence: caseItem.extractedData?.confidence || 0,
            uploadedBy: { name: caseItem.uploadedBy || 'LAB Officer' },
            extractedText: caseItem.extractedText || '',
            marriageDuration: caseItem.extractedData?.marriageDuration || 0,
            exclusionReason: null,
            pdfContent: caseItem.pdfContent
          }))
          setCasesData(mappedCases)
        } else {
          console.error('Failed to fetch cases:', result.error)
          // Fall back to static data
          setCasesData(realisticCaseData)
        }
      } catch (error) {
        console.error('Error fetching cases:', error)
        // Fall back to static data
        setCasesData(realisticCaseData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCases()
  }, [])

  // Handle individual case editing
  const startEditing = (caseId: string) => {
    const caseToEdit = casesData.find(c => c.id === caseId)
    if (caseToEdit) {
      setEditingCase(caseId)
      setEditFormData(caseToEdit)
      setEditMode('single')
    }
  }

  const cancelEditing = () => {
    setEditingCase(null)
    setEditFormData({})
    setEditMode('none')
  }

  const saveEdit = (caseId: string) => {
    const originalCase = casesData.find(c => c.id === caseId)
    if (!originalCase) return

    // Calculate changes
    const changes: Record<string, { from: unknown; to: unknown }> = {}
    Object.keys(editFormData).forEach(key => {
      const newValue = editFormData[key as keyof typeof editFormData]
      const oldValue = originalCase[key as keyof typeof originalCase]
      if (newValue !== oldValue) {
        changes[key] = { from: oldValue, to: newValue }
      }
    })

    // Update the case data
    setCasesData(prev => prev.map(c => 
      c.id === caseId ? { ...c, ...editFormData } : c
    ))

    // Add to edit history
    setEditHistory(prev => [...prev, {
      caseId,
      action: 'single_edit',
      timestamp: new Date().toISOString(),
      changes,
      userId: 'LAB_Officer_' + Math.random().toString(36).substr(2, 5)
    }])

    cancelEditing()
    alert(`✅ Case ${originalCase.caseNumber} updated successfully!`)
  }

  // Handle bulk operations
  const toggleCaseSelection = (caseId: string) => {
    setSelectedCases(prev => {
      const newSet = new Set(prev)
      if (newSet.has(caseId)) {
        newSet.delete(caseId)
      } else {
        newSet.add(caseId)
      }
      return newSet
    })
  }

  const selectAllFiltered = () => {
    const allIds = new Set(filteredCases.map(c => c.id))
    setSelectedCases(allIds)
  }

  const clearSelection = () => {
    setSelectedCases(new Set())
  }

  const startBulkEdit = () => {
    if (selectedCases.size === 0) {
      alert('Please select cases to edit')
      return
    }
    setEditMode('bulk')
    setBulkEditChanges({})
  }

  const applyBulkEdit = () => {
    if (Object.keys(bulkEditChanges).length === 0) {
      alert('No changes to apply')
      return
    }

    // Apply changes to selected cases
    setCasesData(prev => prev.map(c => 
      selectedCases.has(c.id) ? { ...c, ...bulkEditChanges } : c
    ))

    // Add to edit history
    selectedCases.forEach(caseId => {
      setEditHistory(prev => [...prev, {
        caseId,
        action: 'bulk_edit',
        timestamp: new Date().toISOString(),
        changes: bulkEditChanges,
        userId: 'LAB_Officer_' + Math.random().toString(36).substr(2, 5)
      }])
    })

    alert(`✅ Bulk edit applied to ${selectedCases.size} cases`)
    setEditMode('none')
    setBulkEditChanges({})
    clearSelection()
  }

  const filteredCases = casesData.filter(caseItem => {
    const matchesStatus = filterStatus === 'ALL' || caseItem.status === filterStatus
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.husbandIncome?.toString().includes(searchTerm) ||
                         caseItem.extractedText?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Income filtering logic
    let matchesIncome = true
    if (incomeFilter !== 'ALL') {
      const income = caseItem.husbandIncome || 0
      switch (incomeFilter) {
        case 'LOW':
          matchesIncome = income <= 2500
          break
        case 'MEDIUM':
          matchesIncome = income > 2500 && income <= 4000
          break
        case 'HIGH':
          matchesIncome = income > 4000
          break
        case 'LAB_THRESHOLD':
          matchesIncome = income <= 4000 // Within LAB calculation scope
          break
        case 'ABOVE_THRESHOLD':
          matchesIncome = income > 4000 // Above LAB threshold
          break
        case 'CUSTOM':
          const min = customMinIncome ? parseInt(customMinIncome) : 0
          const max = customMaxIncome ? parseInt(customMaxIncome) : Infinity
          matchesIncome = income >= min && income <= max
          break
      }
    }

    // Exclusion filtering logic
    let matchesExclusion = true
    if (exclusionFilter !== 'ALL') {
      switch (exclusionFilter) {
        case 'INCLUDED':
          matchesExclusion = !caseItem.exclusionReason // Not excluded
          break
        case 'EXCLUDED':
          matchesExclusion = !!caseItem.exclusionReason // Has exclusion reason
          break
        case 'STATISTICAL_OUTLIER':
          matchesExclusion = caseItem.exclusionReason === 'STATISTICAL_OUTLIER'
          break
        case 'DATA_QUALITY':
          matchesExclusion = caseItem.exclusionReason === 'DATA_QUALITY'
          break
        case 'CONSENT_ORDER':
          matchesExclusion = caseItem.exclusionReason === 'CONSENT_ORDER'
          break
        case 'INCOMPLETE_DATA':
          matchesExclusion = caseItem.exclusionReason === 'INCOMPLETE_DATA'
          break
      }
    }
    
    return matchesStatus && matchesSearch && matchesIncome && matchesExclusion
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'EXCLUDED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleViewCase = (caseItem: typeof realisticCaseData[0]) => {
    setSelectedCase(caseItem)
    setViewMode('detail')
  }

  const handleBackToTable = () => {
    setSelectedCase(null)
    setViewMode('table')
  }

  const handleValidateCase = (caseItem: typeof realisticCaseData[0]) => {
    // Navigate to validation page with case ID
    window.location.href = `/validation?caseId=${caseItem.id}`
  }

  const handleEditCase = (caseItem: typeof realisticCaseData[0]) => {
    // Here you could open an edit modal or navigate to edit page
    alert(`Edit functionality for case ${caseItem.caseNumber} - To be implemented`)
  }

  // If viewing detailed case, render detail view
  if (viewMode === 'detail' && selectedCase) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  eBantu+
                </Link>
                <span className="text-gray-400">|</span>
                <button 
                  onClick={handleBackToTable}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Cases
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Case Detail Header */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedCase.title}</h1>
                  <p className="text-gray-600">Case Number: {selectedCase.caseNumber}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status.toLowerCase()}
                  </span>
                  <span className={`text-sm font-medium ${getConfidenceColor(selectedCase.confidence)}`}>
                    {Math.round(selectedCase.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>

            {/* Case Details Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Financial Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Financial Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Husband Income:</span>
                      <span className="font-medium">{formatCurrency(selectedCase.husbandIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Nafkah Iddah:</span>
                      <span className="font-medium">{formatCurrency(selectedCase.nafkahIddah)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Mutaah:</span>
                      <span className="font-medium">{formatCurrency(selectedCase.mutaah)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Marriage Duration:</span>
                      <span className="font-medium">{selectedCase.marriageDuration} years</span>
                    </div>
                  </div>
                </div>

                {/* Case Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Case Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-700">Status:</span>
                      <span className="font-medium">{selectedCase.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Uploaded:</span>
                      <span className="font-medium">{formatDateTime(selectedCase.uploadedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Uploaded By:</span>
                      <span className="font-medium">{selectedCase.uploadedBy.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Confidence:</span>
                      <span className="font-medium">{Math.round(selectedCase.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* LAB Formula Validation */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">LAB Formula Check</h3>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-yellow-700">Expected Nafkah:</span>
                      <span className="font-medium ml-2">
                        {formatCurrency(Math.round(0.14 * selectedCase.husbandIncome + 47))}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-yellow-700">Expected Mutaah:</span>
                      <span className="font-medium ml-2">
                        {formatCurrency(Math.round(0.00096 * selectedCase.husbandIncome + 0.85))}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-yellow-700">Formula Accuracy:</span>
                      <span className="font-medium ml-2 text-green-600">
                        {selectedCase.husbandIncome <= 4000 ? '✓ Within LAB scope' : '⚠ Above threshold'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Text */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Extracted Text</h3>
                <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                  {selectedCase.extractedText}
                </div>
              </div>

              {/* PDF Document Content */}
              {selectedCase.pdfContent && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      PDF Document: {selectedCase.pdfContent.fileName}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📅 Uploaded: {formatDateTime(selectedCase.pdfContent.uploadDate)}</span>
                      <span>📄 {selectedCase.pdfContent.pageCount} pages</span>
                      <span>💾 {selectedCase.pdfContent.fileSize}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Key Extracts Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Parties */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          Parties
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {selectedCase.pdfContent.keyExtracts.parties.map((party, index) => (
                            <li key={index}>• {party}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Court Details */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                          Court Details
                        </h4>
                        <p className="text-sm text-green-800">{selectedCase.pdfContent.keyExtracts.courtDetails}</p>
                      </div>

                      {/* Financial Information */}
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                          </svg>
                          Financial Information
                        </h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          {selectedCase.pdfContent.keyExtracts.financialInfo.map((info, index) => (
                            <li key={index}>• {info}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Awards */}
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Awards & Orders
                        </h4>
                        <ul className="text-sm text-purple-800 space-y-1">
                          {selectedCase.pdfContent.keyExtracts.awards.map((award, index) => (
                            <li key={index}>• {award}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Full Document Text */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Full Document Text</h4>
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={() => {
                            const element = document.createElement('a');
                            const file = new Blob([selectedCase.pdfContent!.fullText], {type: 'text/plain'});
                            element.href = URL.createObjectURL(file);
                            element.download = `${selectedCase.caseNumber}_extracted_text.txt`;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                          }}
                        >
                          📥 Download Text
                        </button>
                      </div>
                      <div className="bg-white border rounded p-4 max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {selectedCase.pdfContent.fullText}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                {selectedCase.status === 'PENDING' && (
                  <button 
                    onClick={() => handleValidateCase(selectedCase)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Validate Case
                  </button>
                )}
                <button 
                  onClick={() => handleEditCase(selectedCase)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edit Case
                </button>
                <button 
                  onClick={handleBackToTable}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                eBantu+
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/upload" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Upload Case
              </Link>
              <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
              <p className="mt-2 text-gray-600">
                Review and manage Syariah Court cases and extracted data
              </p>
            </div>
            
            {/* Edit Mode Controls */}
            <div className="flex items-center space-x-3">
              {selectedCases.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedCases.size} selected
                  </span>
                  <button
                    onClick={startBulkEdit}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Bulk Edit
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowEditHistory(!showEditHistory)}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                Edit History
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Edit Mode:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  editMode === 'none' ? 'bg-gray-100 text-gray-700' :
                  editMode === 'single' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {editMode === 'none' ? 'View Only' : 
                   editMode === 'single' ? 'Single Edit' : 'Bulk Edit'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Edit Panel */}
        {editMode === 'bulk' && (
          <div className="bg-white shadow rounded-lg mb-6 border-l-4 border-purple-500">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Bulk Edit - {selectedCases.size} cases selected
                </h3>
                <button
                  onClick={() => setEditMode('none')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={bulkEditChanges.status || ''}
                    onChange={(e) => setBulkEditChanges(prev => ({
                      ...prev, 
                      status: e.target.value || undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No change</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="VALIDATED">Validated</option>
                    <option value="FLAGGED">Flagged</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidence Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={bulkEditChanges.confidence || ''}
                    onChange={(e) => setBulkEditChanges(prev => ({
                      ...prev, 
                      confidence: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                    placeholder="0.00 - 1.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exclusion Reason
                  </label>
                  <select
                    value={bulkEditChanges.exclusionReason || ''}
                    onChange={(e) => setBulkEditChanges(prev => ({
                      ...prev, 
                      exclusionReason: e.target.value || null
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No change</option>
                    <option value="">Clear exclusion</option>
                    <option value="STATISTICAL_OUTLIER">Statistical Outlier</option>
                    <option value="DATA_QUALITY">Data Quality Issues</option>
                    <option value="CONSENT_ORDER">Consent Order</option>
                    <option value="INCOMPLETE_DATA">Incomplete Data</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {setEditMode('none'); setBulkEditChanges({})}}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={applyBulkEdit}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit History Modal */}
        {showEditHistory && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Edit History</h3>
                  <button
                    onClick={() => setShowEditHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {editHistory.length > 0 ? (
                  <div className="space-y-4">
                    {editHistory.slice(-20).reverse().map((entry, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-900">Case {entry.caseId}</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              entry.action === 'single_edit' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {entry.action.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div>{new Date(entry.timestamp).toLocaleString()}</div>
                            <div>by {entry.userId}</div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div className="font-medium mb-1">Changes:</div>
                          {Object.entries(entry.changes).map(([field, change]) => (
                            <div key={field} className="ml-2">
                              <span className="font-medium">{field}:</span>
                              <span className="text-red-600 ml-1">{JSON.stringify(change.from)}</span>
                              <span className="mx-1">→</span>
                              <span className="text-green-600">{JSON.stringify(change.to)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No edit history available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="space-y-4">
              {/* First Row: Status and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex space-x-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="VALIDATED">Validated</option>
                    <option value="EXCLUDED">Excluded</option>
                  </select>
                </div>
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by case number, title, income, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Second Row: Income Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Income Filter:</label>
                  <select
                    value={incomeFilter}
                    onChange={(e) => setIncomeFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Income Ranges</option>
                    <option value="LOW">Low (≤ $2,500)</option>
                    <option value="MEDIUM">Medium ($2,501 - $4,000)</option>
                    <option value="HIGH">High (&gt; $4,000)</option>
                    <option value="LAB_THRESHOLD">Within LAB Scope (≤ $4,000)</option>
                    <option value="ABOVE_THRESHOLD">Above LAB Threshold (&gt; $4,000)</option>
                    <option value="CUSTOM">Custom Range</option>
                  </select>
                </div>
                
                {/* Exclusion Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Exclusion Filter:</label>
                  <select
                    value={exclusionFilter}
                    onChange={(e) => setExclusionFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Cases</option>
                    <option value="INCLUDED">Included in Formula (No Exclusions)</option>
                    <option value="EXCLUDED">Excluded from Formula</option>
                    <option value="STATISTICAL_OUTLIER">Statistical Outliers</option>
                    <option value="DATA_QUALITY">Data Quality Issues</option>
                    <option value="CONSENT_ORDER">Consent Orders</option>
                    <option value="INCOMPLETE_DATA">Incomplete Data</option>
                  </select>
                </div>
                
                {/* Custom Range Inputs */}
                {incomeFilter === 'CUSTOM' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={customMinIncome}
                      onChange={(e) => setCustomMinIncome(e.target.value)}
                      className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <span className="text-sm text-gray-500">$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={customMaxIncome}
                      onChange={(e) => setCustomMaxIncome(e.target.value)}
                      className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                {/* Filter Summary */}
                <div className="text-sm text-gray-500">
                  Showing {filteredCases.length} of {realisticCaseData.length} cases
                </div>
              </div>
            </div>
          </div>

          {/* Cases Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading cases...</span>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filteredCases.length > 0 && filteredCases.every(c => selectedCases.has(c.id))}
                        onChange={filteredCases.length > 0 && filteredCases.every(c => selectedCases.has(c.id)) 
                          ? clearSelection 
                          : selectAllFiltered
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Case</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Financial Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className={`hover:bg-gray-50 ${
                    selectedCases.has(caseItem.id) ? 'bg-blue-50' : ''
                  } ${editingCase === caseItem.id ? 'bg-amber-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCases.has(caseItem.id)}
                          onChange={() => toggleCaseSelection(caseItem.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          {editingCase === caseItem.id ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editFormData.title || ''}
                                onChange={(e) => setEditFormData(prev => ({...prev, title: e.target.value}))}
                                className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 w-full"
                              />
                              <input
                                type="text"
                                value={editFormData.caseNumber || ''}
                                onChange={(e) => setEditFormData(prev => ({...prev, caseNumber: e.target.value}))}
                                className="text-sm text-gray-500 border border-gray-300 rounded px-2 py-1 w-full"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {caseItem.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {caseItem.caseNumber}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCase === caseItem.id ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500 w-12">Income:</span>
                            <input
                              type="number"
                              value={editFormData.husbandIncome || ''}
                              onChange={(e) => setEditFormData(prev => ({...prev, husbandIncome: parseInt(e.target.value) || 0}))}
                              className="text-sm border border-gray-300 rounded px-2 py-1 w-20"
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500 w-12">Nafkah:</span>
                            <input
                              type="number"
                              value={editFormData.nafkahIddah || ''}
                              onChange={(e) => setEditFormData(prev => ({...prev, nafkahIddah: parseInt(e.target.value) || 0}))}
                              className="text-sm border border-gray-300 rounded px-2 py-1 w-20"
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500 w-12">Mutaah:</span>
                            <input
                              type="number"
                              value={editFormData.mutaah || ''}
                              onChange={(e) => setEditFormData(prev => ({...prev, mutaah: parseInt(e.target.value) || 0}))}
                              className="text-sm border border-gray-300 rounded px-2 py-1 w-20"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          <div>Income: {formatCurrency(caseItem.husbandIncome)}</div>
                          <div>Nafkah: {formatCurrency(caseItem.nafkahIddah)}</div>
                          <div>Mutaah: {formatCurrency(caseItem.mutaah)}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCase === caseItem.id ? (
                        <select
                          value={editFormData.status || ''}
                          onChange={(e) => setEditFormData(prev => ({...prev, status: e.target.value}))}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="VALIDATED">Validated</option>
                          <option value="FLAGGED">Flagged</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status.toLowerCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCase === caseItem.id ? (
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={editFormData.confidence || ''}
                          onChange={(e) => setEditFormData(prev => ({...prev, confidence: parseFloat(e.target.value) || 0}))}
                          className="text-sm border border-gray-300 rounded px-2 py-1 w-16"
                        />
                      ) : (
                        <span className={`text-sm font-medium ${getConfidenceColor(caseItem.confidence)}`}>
                          {Math.round(caseItem.confidence * 100)}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDateTime(caseItem.uploadedAt)}</div>
                      <div>by {caseItem.uploadedBy.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {editingCase === caseItem.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(caseItem.id)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-900 font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleViewCase(caseItem)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => startEditing(caseItem.id)}
                              className="text-amber-600 hover:text-amber-900 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => window.open(`/validation?caseId=${caseItem.id}`, '_blank')}
                              className="text-purple-600 hover:text-purple-900 font-medium"
                            >
                              Validate
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredCases.length} of {realisticCaseData.length} cases
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Total Cases</div>
              <div className="text-2xl font-semibold text-gray-900">{realisticCaseData.length}</div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Pending Validation</div>
              <div className="text-2xl font-semibold text-yellow-600">
                {realisticCaseData.filter(c => c.status === 'PENDING').length}
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Validated</div>
              <div className="text-2xl font-semibold text-green-600">
                {realisticCaseData.filter(c => c.status === 'VALIDATED').length}
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Avg Confidence</div>
              <div className="text-2xl font-semibold text-blue-600">
                {Math.round((realisticCaseData.reduce((acc, c) => acc + c.confidence, 0) / realisticCaseData.length) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Debug Panel - Show current filter state */}
        {showDebug && (
          <div className="mt-6 bg-white shadow rounded-lg border-2 border-blue-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">🐛 Debug Panel</h3>
                <button 
                  onClick={() => setShowDebug(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">View Mode:</span>
                  <span className="ml-2 text-blue-600">{viewMode}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Filter Status:</span>
                  <span className="ml-2 text-blue-600">{filterStatus}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Income Filter:</span>
                  <span className="ml-2 text-blue-600">{incomeFilter}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Exclusion Filter:</span>
                  <span className="ml-2 text-blue-600">{exclusionFilter}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Search Term:</span>
                  <span className="ml-2 text-blue-600">&quot;{searchTerm}&quot;</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Filtered Results:</span>
                  <span className="ml-2 text-blue-600">{filteredCases.length} cases</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Selected Case:</span>
                  <span className="ml-2 text-blue-600">{selectedCase?.caseNumber || 'None'}</span>
                </div>
                {incomeFilter === 'CUSTOM' && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Custom Min:</span>
                      <span className="ml-2 text-blue-600">${customMinIncome || '0'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Custom Max:</span>
                      <span className="ml-2 text-blue-600">${customMaxIncome || '∞'}</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Filter breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Filter Breakdown:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Total cases: {realisticCaseData.length}</div>
                  <div>• After status filter: {realisticCaseData.filter(c => filterStatus === 'ALL' || c.status === filterStatus).length}</div>
                  <div>• After exclusion filter: {realisticCaseData.filter(c => {
                    const statusMatch = filterStatus === 'ALL' || c.status === filterStatus;
                    if (!statusMatch) return false;
                    
                    const isExcluded = Boolean(c.exclusionReason);
                    if (exclusionFilter === 'all') return true;
                    if (exclusionFilter === 'included') return !isExcluded;
                    if (exclusionFilter === 'excluded') return isExcluded;
                    if (exclusionFilter === 'statistical-outliers') return isExcluded && c.exclusionReason === 'Statistical Outlier';
                    if (exclusionFilter === 'data-quality') return isExcluded && c.exclusionReason === 'Data Quality Issue';
                    if (exclusionFilter === 'consent-orders') return isExcluded && c.exclusionReason === 'Consent Order';
                    if (exclusionFilter === 'incomplete-data') return isExcluded && c.exclusionReason === 'Incomplete Data';
                    return true;
                  }).length}</div>
                  <div>• After search filter: {filteredCases.length}</div>
                  <div>• Income ranges: Low (≤$2,500): {realisticCaseData.filter(c => c.husbandIncome <= 2500).length}, Medium ($2,501-$4,000): {realisticCaseData.filter(c => c.husbandIncome > 2500 && c.husbandIncome <= 4000).length}, High (&gt;$4,000): {realisticCaseData.filter(c => c.husbandIncome > 4000).length}</div>
                  <div>• Exclusion breakdown: Included: {realisticCaseData.filter(c => !c.exclusionReason).length}, Excluded: {realisticCaseData.filter(c => Boolean(c.exclusionReason)).length} (Outliers: {realisticCaseData.filter(c => c.exclusionReason === 'Statistical Outlier').length}, Quality: {realisticCaseData.filter(c => c.exclusionReason === 'Data Quality Issue').length}, Consent: {realisticCaseData.filter(c => c.exclusionReason === 'Consent Order').length}, Incomplete: {realisticCaseData.filter(c => c.exclusionReason === 'Incomplete Data').length})</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Toggle Button */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {showDebug ? '🐛 Hide Debug Panel' : '🐛 Show Debug Panel'}
          </button>
        </div>
      </div>
    </div>
  )
}