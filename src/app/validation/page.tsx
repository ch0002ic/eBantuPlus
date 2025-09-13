'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  calculateNafkahIddah, 
  calculateMutaah, 
  formatSGD 
} from '@/lib/formulas'
import { LABFormulaEngine } from '@/lib/lab-formula-engine'

/**
 * LawNet Singapore Court Case References
 * Source: https://www.lawnet.com/openlaw/singapore/judgments/supreme-court?q=syariah
 * 
 * Authentic Singapore court citations used for realistic case simulation:
 * - [1996] SGHC 260: Lathibaby Bevi v Abdul Mustapha
 * - [1990] SGHC 78: Muhd Munir v Noor Hidah and other applications
 * - [1996] SGCA 32: Salijah bte Ab Latef v Mohd Irwan bin Abdullah Teo
 * - [1995] SGHC 37: Rahimah bte Hussan v Zaine bin Yusoff
 * - [1997] SGHC 239: Madiah bte Atan v Samsudin bin Budin
 * - [1995] SGHC 264: Hafiani bte Abdul Karim v Mazlan bin Redzuan
 * - [1998] SGHC 132, [2016] SGHCF 5, [1998] SGCA 29, [2016] SGHCR 9
 */

// Type definitions
type ExtractedData = {
  husbandIncome: number
  nafkahIddah: number
  mutaah: number
  marriageDuration: number
}

type ValidationQueueItem = {
  id: string
  title: string
  caseNumber: string
  extractedData: ExtractedData
  confidence: number
  uploadedBy: { name: string }
  uploadedAt: Date | string
  status: string
  extractedText: string
  flags?: string[]
  aiReasoning?: string
  originalDocument?: string
}

type ValidationHistory = {
  caseId: string
  action: string
  timestamp: string
  comment: string
  changes: Record<string, { from: string | number; to: string | number }>
}

// Realistic Singapore Syariah Court validation queue with LAB formula calculations
// Enhanced with authentic Singapore court citation references from LawNet database
const validationQueue: ValidationQueueItem[] = [
  {
    id: '2',
    title: '[2025] SGHCF 102 - Ahmad bin Abdullah v Siti Aishah (Validation Required)',
    caseNumber: 'SYC2025002',
    extractedData: {
      husbandIncome: 3800, // $3,800/month income
      nafkahIddah: 579, // LAB Formula: 0.14 × 3800 + 47 = 579
      mutaah: 4, // LAB Formula: 0.00096 × 3800 + 0.85 = 4.498 ≈ 4
      marriageDuration: 9
    },
    confidence: 0.89,
    aiReasoning: 'Extracted from judgment: "Husband earns $3,800 monthly as operations manager. Court awards nafkah iddah $579 per month for 3 months. Mutaah awarded $4 per day." Case follows established precedent from [2016] SGHCF 5 and LAB formula calculations.',
    flags: ['requires_review'],
    uploadedBy: { name: 'LAB Officer Ahmad' },
    status: 'PENDING',
    uploadedAt: '2 hours ago',
    extractedText: 'Reference to [1998] SGHC 132 and [2016] SGHCR 9 precedents. The husband is employed as Operations Manager earning $3,800 per month. The marriage lasted 9 years. Court hereby orders nafkah iddah of $579 monthly for 3 months and mutaah of $4 per day pursuant to s.113 Women\'s Charter.',
    originalDocument: 'SYC2025002_judgment.pdf'
  },
  {
    id: '5',
    title: '[2025] SGHCF 105 - Rahman bin Yusof v Fatimah (Low Confidence Extraction)',
    caseNumber: 'SYC2025005',
    extractedData: {
      husbandIncome: 2900, // $2,900/month income
      nafkahIddah: 453, // LAB Formula: 0.14 × 2900 + 47 = 453
      mutaah: 4, // LAB Formula: 0.00096 × 2900 + 0.85 = 3.634 ≈ 4
      marriageDuration: 6
    },
    confidence: 0.76,
    aiReasoning: 'Income information partially unclear in document. Extracted "$2,900" from employment section. Nafkah iddah amount matches LAB formula (0.14 × $2,900 + $47 = $453). Mutaah calculation follows [1998] SGCA 29 precedent.',
    flags: ['low_confidence', 'income_verification_needed'],
    uploadedBy: { name: 'LAB Officer Siti' },
    status: 'PENDING',
    uploadedAt: '4 hours ago',
    extractedText: 'Husband employment with monthly salary approximately $2,900. Marriage duration 6 years. Court orders nafkah iddah $453 monthly and mutaah $4 daily.',
    originalDocument: 'SYC2025005_judgment.pdf'
  },
  {
    id: '7',
    title: '[2025] SGHCF 107 - Zainul bin Hassan v Maryam (High Income Review)',
    caseNumber: 'SYC2025007',
    extractedData: {
      husbandIncome: 4800, // $4,800/month income (above $4,000 threshold)
      nafkahIddah: 719, // LAB Formula: 0.14 × 4800 + 47 = 719
      mutaah: 5, // LAB Formula: 0.00096 × 4800 + 0.85 = 5.458 ≈ 5
      marriageDuration: 14
    },
    confidence: 0.93,
    aiReasoning: 'High income case above $4,000 threshold. Income clearly stated as $4,800/month. Awards follow LAB formula but require review due to high income category. Precedent analysis from [2016] SGHCF 5 suggests careful consideration of s.114 factors.',
    flags: ['high_income', 'requires_senior_review'],
    uploadedBy: { name: 'LAB Officer Rahman' },
    status: 'PENDING',
    uploadedAt: '1 day ago',
    extractedText: 'Reference to established precedents in [1998] SGHC 132 and [2016] SGHCR 9. Husband senior manager earning $4,800 monthly. 14-year marriage. Court awards nafkah iddah $719 per month for 3 months and mutaah $5 per day pursuant to comprehensive s.114 analysis.',
    originalDocument: 'SYC2025007_judgment.pdf'
  }
]

function ValidationPageContent() {
  const searchParams = useSearchParams()
  const caseIdParam = searchParams.get('caseId')
  
  // Find initial case index based on URL parameter
  const getInitialCaseIndex = () => {
    if (caseIdParam) {
      const index = validationQueue.findIndex(c => c.id === caseIdParam)
      return index >= 0 ? index : 0
    }
    return 0
  }

  const [currentCaseIndex, setCurrentCaseIndex] = useState(getInitialCaseIndex())
  const [validationData, setValidationData] = useState(validationQueue[getInitialCaseIndex()].extractedData)
  const [comment, setComment] = useState('')
  const [validationHistory, setValidationHistory] = useState<ValidationHistory[]>([])
  const [showFormulaCheck, setShowFormulaCheck] = useState(true)
  const [validationStatus, setValidationStatus] = useState<'editing' | 'validating' | 'completed'>('editing')
  const [editMode, setEditMode] = useState<'basic' | 'advanced' | 'readonly'>('basic')
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [originalData, setOriginalData] = useState(validationQueue[getInitialCaseIndex()].extractedData)
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  
  const currentCase = validationQueue[currentCaseIndex]

  // Update case when URL parameter changes
  useEffect(() => {
    if (caseIdParam) {
      const index = validationQueue.findIndex(c => c.id === caseIdParam)
      if (index >= 0 && index !== currentCaseIndex) {
        setCurrentCaseIndex(index)
        setValidationData(validationQueue[index].extractedData)
        setComment('')
        setValidationStatus('editing')
      }
    }
  }, [caseIdParam, currentCaseIndex])

  const handleDataChange = (field: string, value: number | string) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    
    setValidationData(prev => {
      const newData = {
        ...prev,
        [field]: numericValue
      }
      
      // Check if there are unsaved changes
      const hasChanges = Object.keys(newData).some(key => 
        newData[key as keyof typeof newData] !== originalData[key as keyof typeof originalData]
      )
      setUnsavedChanges(hasChanges)
      
      // Auto-save if enabled
      if (autoSave && hasChanges) {
        setTimeout(() => {
          console.log('Auto-saving changes...', { field, value: numericValue })
          // In production, this would be an API call
        }, 1000)
      }
      
      return newData
    })
  }

  // Enhanced metadata editing
  const [caseMetadata, setCaseMetadata] = useState({
    title: currentCase.title,
    caseNumber: currentCase.caseNumber,
    flags: currentCase.flags,
    confidence: currentCase.confidence,
    aiReasoning: currentCase.aiReasoning
  })

  const handleMetadataChange = (field: string, value: string | string[] | number) => {
    setCaseMetadata(prev => ({
      ...prev,
      [field]: value
    }))
    setUnsavedChanges(true)
  }

  // Reset to original data
  const resetToOriginal = () => {
    setValidationData(originalData)
    setCaseMetadata({
      title: currentCase.title,
      caseNumber: currentCase.caseNumber,
      flags: currentCase.flags,
      confidence: currentCase.confidence,
      aiReasoning: currentCase.aiReasoning
    })
    setUnsavedChanges(false)
  }

  // Save changes
  const saveChanges = async () => {
    try {
      setValidationStatus('validating')
      
      // Calculate changes
      const changes: Record<string, { from: string | number; to: string | number }> = {}
      Object.keys(validationData).forEach(key => {
        if (validationData[key as keyof typeof validationData] !== originalData[key as keyof typeof originalData]) {
          changes[key] = {
            from: originalData[key as keyof typeof originalData],
            to: validationData[key as keyof typeof validationData]
          }
        }
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Saving changes:', { changes, caseId: currentCase.id })
      
      // Update original data
      setOriginalData(validationData)
      setUnsavedChanges(false)
      setValidationStatus('editing')
      
      // Add to history
      setValidationHistory(prev => [...prev, {
        caseId: currentCase.id,
        action: 'edit_save',
        timestamp: new Date().toISOString(),
        comment: 'Manual data corrections applied',
        changes
      }])
      
      alert('✅ Changes saved successfully!')
    } catch (error) {
      console.error('Save failed:', error)
      alert('❌ Failed to save changes. Please try again.')
      setValidationStatus('editing')
    }
  }

  // Calculate LAB formula results for comparison
  const getFormulaResults = () => {
    try {
      const result = LABFormulaEngine.calculateAmount({
        salary: validationData.husbandIncome,
        caseType: 'both',
        includeRanges: true
      })
      return result
    } catch (error) {
      console.error('Formula calculation error:', error)
      return null
    }
  }

  const formulaResults = getFormulaResults()

  const handleValidation = (action: string) => {
    setValidationStatus('validating')
    
    const originalData = currentCase.extractedData
    const changes: Record<string, { from: string | number; to: string | number }> = {}
    
    // Track what changed
    Object.keys(validationData).forEach(key => {
      if (validationData[key as keyof typeof validationData] !== originalData[key as keyof typeof originalData]) {
        changes[key] = {
          from: originalData[key as keyof typeof originalData],
          to: validationData[key as keyof typeof validationData]
        }
      }
    })

    const validationResult = {
      caseId: currentCase.id,
      caseNumber: currentCase.caseNumber,
      action,
      validatedData: validationData,
      comment,
      timestamp: new Date().toISOString(),
      userId: 'LAB_Officer_' + Math.random().toString(36).substr(2, 5),
      changes,
      formulaCompliance: formulaResults ? {
        nafkahIddahExpected: formulaResults.nafkahIddah?.amount || 0,
        mutaahExpected: formulaResults.mutaah?.amount || 0,
        withinScope: !formulaResults.nafkahIddah?.isOutOfScope && !formulaResults.mutaah?.isOutOfScope
      } : null
    }

    // Add to validation history
    setValidationHistory(prev => [...prev, {
      caseId: currentCase.id,
      action,
      timestamp: new Date().toISOString(),
      comment,
      changes
    }])

    // In production, this would be an API call to save validation
    if (process.env.NODE_ENV === 'development') {
      console.log('Validation result:', validationResult)
    }
    
    // Simulate API delay
    setTimeout(() => {
      setValidationStatus('completed')
      
      // Show success message and navigate options
      if (action === 'approve') {
        alert(`✅ Case ${currentCase.caseNumber} approved successfully!\n\nValidated data saved to LAB database.`)
      } else if (action === 'reject') {
        alert(`❌ Case ${currentCase.caseNumber} rejected.\n\nReason: ${comment}`)
      } else if (action === 'flag') {
        alert(`🚩 Case ${currentCase.caseNumber} flagged for further review.\n\nNotes: ${comment}`)
      }
      
      // Auto-advance to next case or return to list
      setTimeout(() => {
        if (currentCaseIndex < validationQueue.length - 1) {
          setCurrentCaseIndex(currentCaseIndex + 1)
          setValidationData(validationQueue[currentCaseIndex + 1].extractedData)
          setComment('')
          setValidationStatus('editing')
          
          // Update URL
          window.history.pushState({}, '', `/validation?caseId=${validationQueue[currentCaseIndex + 1].id}`)
        } else {
          // Return to cases page when done
          window.location.href = '/cases'
        }
      }, 2000)
    }, 1000)
  }
  const navigateCase = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentCaseIndex > 0) {
      const newIndex = currentCaseIndex - 1
      setCurrentCaseIndex(newIndex)
      setValidationData(validationQueue[newIndex].extractedData)
      setComment('')
      setValidationStatus('editing')
      window.history.pushState({}, '', `/validation?caseId=${validationQueue[newIndex].id}`)
    } else if (direction === 'next' && currentCaseIndex < validationQueue.length - 1) {
      const newIndex = currentCaseIndex + 1
      setCurrentCaseIndex(newIndex)
      setValidationData(validationQueue[newIndex].extractedData)
      setComment('')
      setValidationStatus('editing')
      window.history.pushState({}, '', `/validation?caseId=${validationQueue[newIndex].id}`)
    }
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
              <Link href="/cases" className="text-gray-700 hover:text-blue-600">
                All Cases
              </Link>
              <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Case Validation</h1>
              <p className="mt-2 text-gray-600">
                Review and validate AI-extracted data from Syariah Court cases
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="text-lg font-semibold text-blue-600">
                {currentCaseIndex + 1} of {validationQueue.length}
              </div>
            </div>
          </div>

          {/* Edit Mode Toolbar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Edit Mode:</span>
                  <select
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value as 'basic' | 'advanced' | 'readonly')}
                    className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="readonly">Read Only</option>
                    <option value="basic">Basic Edit</option>
                    <option value="advanced">Advanced Edit</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autosave"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autosave" className="text-sm text-gray-700">Auto-save</label>
                </div>

                {unsavedChanges && (
                  <div className="flex items-center text-sm text-amber-600">
                    <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                    Unsaved changes
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {unsavedChanges && (
                  <>
                    <button
                      onClick={resetToOriginal}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Reset
                    </button>
                    <button
                      onClick={saveChanges}
                      disabled={validationStatus === 'validating'}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {validationStatus === 'validating' ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowChangeHistory(!showChangeHistory)}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  History
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Case Information */}
          <div className="space-y-6">
            {/* Case Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Case Information</h3>
                {editMode === 'advanced' && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Advanced Edit Mode
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Title:</span>
                  {editMode === 'advanced' ? (
                    <input
                      type="text"
                      value={caseMetadata.title}
                      onChange={(e) => handleMetadataChange('title', e.target.value)}
                      className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{caseMetadata.title}</div>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Case Number:</span>
                  {editMode === 'advanced' ? (
                    <input
                      type="text"
                      value={caseMetadata.caseNumber}
                      onChange={(e) => handleMetadataChange('caseNumber', e.target.value)}
                      className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{caseMetadata.caseNumber}</div>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Uploaded:</span>
                  <div className="text-sm text-gray-900">{String(currentCase.uploadedAt)}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">AI Confidence:</span>
                  {editMode === 'advanced' ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={caseMetadata.confidence}
                        onChange={(e) => handleMetadataChange('confidence', parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-semibold text-blue-600 w-12">
                        {Math.round(caseMetadata.confidence * 100)}%
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-blue-600">
                      {Math.round(caseMetadata.confidence * 100)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Extraction Reasoning</h3>
              {editMode === 'advanced' ? (
                <textarea
                  value={caseMetadata.aiReasoning}
                  onChange={(e) => handleMetadataChange('aiReasoning', e.target.value)}
                  rows={4}
                  className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="AI reasoning for data extraction..."
                />
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {caseMetadata.aiReasoning}
                </p>
              )}
            </div>

            {/* Flags */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Case Flags</h3>
                {editMode === 'advanced' && (
                  <button
                    onClick={() => {
                      const newFlag = prompt('Add new flag:')
                      if (newFlag) {
                        handleMetadataChange('flags', [...(caseMetadata.flags || []), newFlag])
                      }
                    }}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Add Flag
                  </button>
                )}
              </div>
              
              {(caseMetadata.flags && caseMetadata.flags.length > 0) ? (
                <div className="space-y-2">
                  {caseMetadata.flags?.map((flag: string, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-yellow-700">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                        {flag === 'high_income' && 'High income case (>$4,000/month)'}
                        {flag === 'outlier' && 'Statistical outlier detected'}
                        {flag === 'consent_order' && 'Possible consent order'}
                        {flag === 'requires_review' && 'Requires manual review'}
                        {flag === 'requires_senior_review' && 'Requires senior review'}
                        {!['high_income', 'outlier', 'consent_order', 'requires_review', 'requires_senior_review'].includes(flag) && flag}
                      </div>
                      {editMode === 'advanced' && (
                        <button
                          onClick={() => {
                            const newFlags = caseMetadata.flags?.filter((_: string, i: number) => i !== index) || []
                            handleMetadataChange('flags', newFlags)
                          }}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No flags</div>
              )}
            </div>
          </div>

          {/* Right Column - Validation Form */}
          <div className="space-y-6">
            {/* Formula Validation Check */}
            {showFormulaCheck && formulaResults && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">LAB Formula Validation</h3>
                  <button
                    onClick={() => setShowFormulaCheck(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nafkah Iddah Comparison */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Nafkah Iddah</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Extracted:</span>
                        <span className="font-mono">${validationData.nafkahIddah.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">LAB Formula:</span>
                        <span className="font-mono">${formulaResults.nafkahIddah?.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difference:</span>
                        <span className={`font-mono ${Math.abs(validationData.nafkahIddah - (formulaResults.nafkahIddah?.amount || 0)) < 50 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(validationData.nafkahIddah - (formulaResults.nafkahIddah?.amount || 0)).toFixed(2)}
                        </span>
                      </div>
                      {formulaResults.nafkahIddah?.isOutOfScope && (
                        <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          ⚠️ Income exceeds LAB scope ($4,000)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mutaah Comparison */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Mutaah</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Extracted:</span>
                        <span className="font-mono">${validationData.mutaah.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">LAB Formula:</span>
                        <span className="font-mono">${formulaResults.mutaah?.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difference:</span>
                        <span className={`font-mono ${Math.abs(validationData.mutaah - (formulaResults.mutaah?.amount || 0)) < 50 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(validationData.mutaah - (formulaResults.mutaah?.amount || 0)).toFixed(2)}
                        </span>
                      </div>
                      {formulaResults.mutaah?.isOutOfScope && (
                        <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          ⚠️ Income exceeds LAB scope ($4,000)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Auto-correction suggestions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Quick correction suggestions:</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          if (formulaResults.nafkahIddah?.amount) {
                            setValidationData(prev => ({
                              ...prev,
                              nafkahIddah: formulaResults.nafkahIddah!.amount
                            }))
                          }
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Use LAB Nafkah
                      </button>
                      <button
                        onClick={() => {
                          if (formulaResults.mutaah?.amount) {
                            setValidationData(prev => ({
                              ...prev,
                              mutaah: formulaResults.mutaah!.amount
                            }))
                          }
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Use LAB Mutaah
                      </button>
                      <button
                        onClick={() => {
                          if (formulaResults.nafkahIddah?.amount && formulaResults.mutaah?.amount) {
                            setValidationData(prev => ({
                              ...prev,
                              nafkahIddah: formulaResults.nafkahIddah!.amount,
                              mutaah: formulaResults.mutaah!.amount
                            }))
                          }
                        }}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Use Both LAB Values
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Data Validation */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Validate Extracted Data</h3>
                {editMode === 'readonly' && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Read Only Mode
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Husband&apos;s Monthly Income (SGD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={validationData.husbandIncome || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        handleDataChange('husbandIncome', value);
                      }}
                      disabled={editMode === 'readonly'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        editMode === 'readonly' 
                          ? 'border-gray-200 bg-gray-50 text-gray-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {editMode !== 'readonly' && (
                      <div className="absolute right-2 top-2 text-xs text-gray-400">
                        Original: ${originalData.husbandIncome}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nafkah Iddah (Monthly, SGD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={validationData.nafkahIddah || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        handleDataChange('nafkahIddah', value);
                      }}
                      disabled={editMode === 'readonly'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        editMode === 'readonly' 
                          ? 'border-gray-200 bg-gray-50 text-gray-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      } ${validationData.nafkahIddah !== originalData.nafkahIddah ? 'border-amber-300 bg-amber-50' : ''}`}
                    />
                    {editMode !== 'readonly' && (
                      <div className="absolute right-2 top-2 text-xs text-gray-400">
                        Original: ${originalData.nafkahIddah}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mutaah (Daily, SGD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={validationData.mutaah || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        handleDataChange('mutaah', value);
                      }}
                      disabled={editMode === 'readonly'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        editMode === 'readonly' 
                          ? 'border-gray-200 bg-gray-50 text-gray-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      } ${validationData.mutaah !== originalData.mutaah ? 'border-amber-300 bg-amber-50' : ''}`}
                    />
                    {editMode !== 'readonly' && (
                      <div className="absolute right-2 top-2 text-xs text-gray-400">
                        Original: ${originalData.mutaah}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marriage Duration (Months)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={validationData.marriageDuration || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                        handleDataChange('marriageDuration', value);
                      }}
                      disabled={editMode === 'readonly'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        editMode === 'readonly' 
                          ? 'border-gray-200 bg-gray-50 text-gray-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      } ${validationData.marriageDuration !== originalData.marriageDuration ? 'border-amber-300 bg-amber-50' : ''}`}
                    />
                    {editMode !== 'readonly' && (
                      <div className="absolute right-2 top-2 text-xs text-gray-400">
                        Original: {originalData.marriageDuration} months
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated Ratios using LAB Formula */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">LAB Formula Calculations</h3>
              {(() => {
                const nafkahResult = calculateNafkahIddah(validationData.husbandIncome)
                const mutaahResult = calculateMutaah(validationData.husbandIncome)
                
                if (nafkahResult.shouldSeekLegalAdvice || mutaahResult.shouldSeekLegalAdvice) {
                  return (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                      <p className="text-red-800 font-medium">⚠️ High Income Case</p>
                      <p className="text-red-700 text-sm">
                        Salary &gt; $4,000 - Refer to legal advice (out of LAB scope)
                      </p>
                    </div>
                  )
                }

                return (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>Nafkah Iddah Formula:</strong> 0.14 × {formatSGD(validationData.husbandIncome)} + 47
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Calculated Amount:</span>
                        <span className="font-medium text-blue-900">
                          {formatSGD(nafkahResult.monthlyAmount)}/month
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Range:</span>
                        <span className="font-medium text-blue-900">
                          {formatSGD(nafkahResult.lowerRange)} - {formatSGD(nafkahResult.upperRange)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>Mutaah Formula:</strong> 0.00096 × {formatSGD(validationData.husbandIncome)} + 0.85
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Daily Amount:</span>
                        <span className="font-medium text-blue-900">
                          {formatSGD(mutaahResult.dailyAmount)}/day
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Monthly Equivalent:</span>
                        <span className="font-medium text-blue-900">
                          {formatSGD(mutaahResult.monthlyAmount)}/month
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3 bg-green-50 p-2 rounded">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 font-medium">Total Monthly Support:</span>
                        <span className="font-bold text-green-900">
                          {formatSGD(nafkahResult.monthlyAmount + mutaahResult.monthlyAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">vs Current Input:</span>
                        <span className="text-green-800">
                          {formatSGD(validationData.nafkahIddah + (validationData.mutaah * 30))}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Comments */}
            {/* Comments and Validation Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Comments & Actions</h3>
              
              {/* Comment/Notes Section */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Comments/Notes (Optional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={editMode === 'readonly'}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    editMode === 'readonly' 
                      ? 'border-gray-200 bg-gray-50 text-gray-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  rows={3}
                  placeholder={editMode === 'readonly' 
                    ? 'Comments disabled in read-only mode' 
                    : 'Add any validation notes, corrections made, or reasons for rejection...'
                  }
                />
              </div>

              {/* Edit Mode Controls */}
              {editMode !== 'readonly' && unsavedChanges && (
                <div className="mb-6 p-3 rounded-md bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-amber-600 mr-2">⚠️</span>
                      <span className="text-sm text-amber-700">You have unsaved changes</span>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={resetToOriginal}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                      >
                        Discard
                      </button>
                      <button
                        onClick={saveChanges}
                        disabled={validationStatus === 'validating'}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {validationStatus === 'validating' ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Display */}
              {validationStatus !== 'editing' && (
                <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
                  <div className="flex items-center">
                    {validationStatus === 'validating' && (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-blue-700">Processing validation...</span>
                      </>
                    )}
                    {validationStatus === 'completed' && (
                      <>
                        <span className="text-green-600 mr-2">✅</span>
                        <span className="text-green-700">Validation completed successfully</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {/* Validation Action Buttons */}
              <div className={`grid gap-3 ${editMode === 'readonly' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {editMode !== 'readonly' && (
                  <>
                    <button
                      onClick={() => handleValidation('approve')}
                      disabled={validationStatus !== 'editing' || unsavedChanges}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleValidation('approve_with_changes')}
                      disabled={validationStatus !== 'editing' || unsavedChanges}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ✏️ Approve with Changes
                    </button>
                    <button
                      onClick={() => handleValidation('flag')}
                      disabled={validationStatus !== 'editing' || unsavedChanges}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      🚩 Flag for Review
                    </button>
                    <button
                      onClick={() => handleValidation('reject')}
                      disabled={validationStatus !== 'editing' || unsavedChanges}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                
                {editMode === 'readonly' && (
                  <div className="text-center py-4">
                    <div className="text-gray-500 text-sm">
                      Switch to Basic or Advanced edit mode to enable validation actions
                    </div>
                    <button
                      onClick={() => setEditMode('basic')}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Enable Edit Mode
                    </button>
                  </div>
                )}
              </div>

              {/* Warning for unsaved changes */}
              {unsavedChanges && editMode !== 'readonly' && (
                <div className="mt-4 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                  <span className="font-medium">⚠️ Please save your changes before proceeding with validation actions.</span>
                  <br />
                  <span>Use the Save button above or enable auto-save to apply your edits.</span>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Case {currentCaseIndex + 1} of {validationQueue.length}
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => navigateCase('prev')}
                      disabled={currentCaseIndex === 0 || validationStatus === 'validating'}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => navigateCase('next')}
                      disabled={currentCaseIndex === validationQueue.length - 1 || validationStatus === 'validating'}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation History */}
            {validationHistory.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Validation History</h3>
                <div className="space-y-3">
                  {validationHistory.slice(-5).reverse().map((entry, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-gray-900">Case {entry.caseId}</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            entry.action === 'approve' ? 'bg-green-100 text-green-800' :
                            entry.action === 'reject' ? 'bg-red-100 text-red-800' :
                            entry.action === 'flag' ? 'bg-yellow-100 text-yellow-800' :
                            entry.action === 'edit_save' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {entry.action.charAt(0).toUpperCase() + entry.action.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {entry.comment && (
                        <p className="text-sm text-gray-600 mt-1">{entry.comment}</p>
                      )}
                      {Object.keys(entry.changes).length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Modified: {Object.keys(entry.changes).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Change History Panel */}
            {showChangeHistory && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Change History</h3>
                  <button
                    onClick={() => setShowChangeHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  {Object.keys(validationData).map(key => {
                    const currentValue = validationData[key as keyof typeof validationData]
                    const originalValue = originalData[key as keyof typeof originalData]
                    const hasChanged = currentValue !== originalValue
                    
                    if (!hasChanged) return null
                    
                    return (
                      <div key={key} className="border-l-4 border-amber-200 pl-3 py-2">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="text-red-600">Original: {originalValue}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">Current: {currentValue}</span>
                        </div>
                      </div>
                    )
                  }).filter(Boolean)}
                  
                  {Object.keys(validationData).every(key => 
                    validationData[key as keyof typeof validationData] === originalData[key as keyof typeof originalData]
                  ) && (
                    <div className="text-sm text-gray-500 italic">No changes made</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ValidationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Loading validation dashboard...</div>
    </div>}>
      <ValidationPageContent />
    </Suspense>
  )
}