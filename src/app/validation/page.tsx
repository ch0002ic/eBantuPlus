'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  calculateNafkahIddah, 
  calculateMutaah, 
  formatSGD 
} from '@/lib/formulas'

// Mock data for validation queue
const mockValidationQueue = [
  {
    id: '2',
    title: 'SYC2025002 - Maintenance Application',
    caseNumber: 'SYC2025002',
    extractedData: {
      husbandIncome: 4200,
      nafkahIddah: 950,
      mutaah: 18,
      marriageDuration: 24
    },
    confidence: 0.87,
    aiReasoning: 'Found explicit income statement of $4,200/month. Nafkah iddah amount clearly stated as $950/month. Mutaah calculated based on court standard formula.',
    flags: ['high_income'],
    uploadedAt: '2 hours ago'
  },
  {
    id: '5',
    title: 'SYC2025005 - Financial Support',
    caseNumber: 'SYC2025005',
    extractedData: {
      husbandIncome: 2800,
      nafkahIddah: 750,
      mutaah: 14,
      marriageDuration: 18
    },
    confidence: 0.92,
    aiReasoning: 'Clear financial documentation provided. Income verified from employment letter. Maintenance amounts awarded by court.',
    flags: [],
    uploadedAt: '4 hours ago'
  }
]

export default function ValidationPage() {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0)
  const [validationData, setValidationData] = useState(mockValidationQueue[0].extractedData)
  const [comment, setComment] = useState('')
  const currentCase = mockValidationQueue[currentCaseIndex]

  const handleDataChange = (field: string, value: number) => {
    setValidationData(prev => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value
    }))
  }

    const handleValidation = (action: string) => {
    const validationResult = {
      caseId: currentCase.id,
      action,
      validatedData: validationData,
      comment,
      timestamp: new Date().toISOString(),
      userId: 'current-user' // In production, get from auth context
    }

    // In production, this would be an API call to save validation
    console.log('Validation result:', validationResult)
    
    // For now, simulate success and move to next case
    if (currentCaseIndex < mockValidationQueue.length - 1) {
      setCurrentCaseIndex(currentCaseIndex + 1)
      setValidationData(mockValidationQueue[currentCaseIndex + 1].extractedData)
      setComment('')
    } else {
      // In production, redirect to dashboard or cases list
      window.location.href = '/cases'
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Case Validation</h1>
              <p className="mt-2 text-gray-600">
                Review and validate AI-extracted data from Syariah Court cases
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="text-lg font-semibold text-blue-600">
                {currentCaseIndex + 1} of {mockValidationQueue.length}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Case Information */}
          <div className="space-y-6">
            {/* Case Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Case Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Title:</span>
                  <div className="text-sm text-gray-900">{currentCase.title}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Case Number:</span>
                  <div className="text-sm text-gray-900">{currentCase.caseNumber}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Uploaded:</span>
                  <div className="text-sm text-gray-900">{currentCase.uploadedAt}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">AI Confidence:</span>
                  <div className="text-sm font-semibold text-blue-600">
                    {Math.round(currentCase.confidence * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Extraction Reasoning</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentCase.aiReasoning}
              </p>
            </div>

            {/* Flags */}
            {currentCase.flags.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-yellow-800 mb-3">⚠️ Attention Required</h3>
                <div className="space-y-2">
                  {currentCase.flags.map((flag, index) => (
                    <div key={index} className="flex items-center text-sm text-yellow-700">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      {flag === 'high_income' && 'High income case (>$4,000/month)'}
                      {flag === 'outlier' && 'Statistical outlier detected'}
                      {flag === 'consent_order' && 'Possible consent order'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Validation Form */}
          <div className="space-y-6">
            {/* Extracted Data Validation */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Validate Extracted Data</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Husband&apos;s Monthly Income (SGD)
                  </label>
                  <input
                    type="number"
                    value={validationData.husbandIncome || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleDataChange('husbandIncome', value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nafkah Iddah (Monthly, SGD)
                  </label>
                  <input
                    type="number"
                    value={validationData.nafkahIddah || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleDataChange('nafkahIddah', value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mutaah (Daily, SGD)
                  </label>
                  <input
                    type="number"
                    value={validationData.mutaah || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleDataChange('mutaah', value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marriage Duration (Months)
                  </label>
                  <input
                    type="number"
                    value={validationData.marriageDuration || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      handleDataChange('marriageDuration', value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Comments</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add comments about the validation (optional)..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Decision</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleValidation('APPROVE')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleValidation('CORRECT')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  ✏️ Approve with Changes
                </button>
                <button
                  onClick={() => handleValidation('EXCLUDE')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 font-medium"
                >
                  ⚠️ Exclude from Formula
                </button>
                <button
                  onClick={() => handleValidation('REJECT')}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium"
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}