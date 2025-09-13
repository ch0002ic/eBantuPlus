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

export default function CasesPage() {
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [incomeFilter, setIncomeFilter] = useState('ALL')
  const [exclusionFilter, setExclusionFilter] = useState('ALL')
  const [customMinIncome, setCustomMinIncome] = useState('')
  const [customMaxIncome, setCustomMaxIncome] = useState('')
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null)
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
        const response = await fetch('/api/cases?limit=100&offset=0')
        const result = await response.json()
        
        if (result.success) {
          // Map API data to match the expected format
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedCases = result.data.cases.map((caseItem: any) => ({
            id: caseItem.id,
            title: caseItem.title,
            caseNumber: caseItem.caseNumber || caseItem.id,
            status: caseItem.status,
            uploadedAt: new Date(caseItem.uploadedAt),
            husbandIncome: caseItem.husbandIncome || 0,
            nafkahIddah: caseItem.nafkahIddah || 0,
            mutaah: caseItem.mutaah || 0,
            confidence: caseItem.confidence || 0,
            uploadedBy: { name: caseItem.uploadedBy?.name || 'LAB Officer' },
            extractedText: caseItem.extractedText || '',
            marriageDuration: caseItem.marriageDuration || 0,
            exclusionReason: null,
            pdfContent: {
              fileName: caseItem.fileName || 'uploaded_document.pdf',
              uploadDate: new Date(caseItem.uploadedAt),
              fileSize: `${Math.round(caseItem.fileSize / 1024)} KB`,
              pageCount: 1,
              fullText: caseItem.extractedText || 'Document content extracted.',
              keyExtracts: {
                parties: ['Processing...', 'Processing...'],
                courtDetails: `Syariah Court - Case No: ${caseItem.caseNumber || 'Processing...'}`,
                financialInfo: [`Husband Income: $${caseItem.husbandIncome || 'Processing...'}`],
                awards: [`Nafkah Iddah: $${caseItem.nafkahIddah || 'Processing...'} per month`]
              }
            }
          }))
          setCasesData(mappedCases)
        } else {
          console.error('Failed to fetch cases:', result.error)
          setCasesData([])
        }
      } catch (error) {
        console.error('Error fetching cases:', error)
        setCasesData([])
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

  // Handle case deletion
  const handleDeleteCase = async (caseId: string) => {
    const caseToDelete = casesData.find(c => c.id === caseId)
    if (!caseToDelete) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete case "${caseToDelete.title}"?\n\nThis action cannot be undone.`
    )
    
    if (!confirmDelete) return

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        // Remove case from local state
        setCasesData(prev => prev.filter(c => c.id !== caseId))
        
        // Add to edit history
        setEditHistory(prev => [...prev, {
          caseId,
          action: 'delete',
          timestamp: new Date().toISOString(),
          changes: { deleted: { from: false, to: true } },
          userId: 'LAB_Officer_' + Math.random().toString(36).substr(2, 5)
        }])

        alert(`✅ Case ${caseToDelete.caseNumber} deleted successfully!`)
      } else {
        alert(`❌ Failed to delete case: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting case:', error)
      alert('❌ Failed to delete case. Please try again.')
    }
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

  const handleViewCase = (caseItem: CaseData) => {
    setSelectedCase(caseItem)
    setViewMode('detail')
  }

  const handleBackToTable = () => {
    setSelectedCase(null)
    setViewMode('table')
  }

  const handleValidateCase = (caseItem: CaseData) => {
    // Navigate to validation page with case ID
    window.location.href = `/validation?caseId=${caseItem.id}`
  }

  const handleEditCase = (caseItem: CaseData) => {
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
                  Showing {filteredCases.length} of {casesData.length} cases
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
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {caseItem.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {caseItem.caseNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Income: {formatCurrency(caseItem.husbandIncome)}</div>
                        <div>Nafkah: {formatCurrency(caseItem.nafkahIddah)}</div>
                        <div>Mutaah: {formatCurrency(caseItem.mutaah)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status}
                      </span>
                      {caseItem.exclusionReason && (
                        <div className="text-xs text-red-600 mt-1">
                          Excluded: {caseItem.exclusionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getConfidenceColor(caseItem.confidence)}`}>
                        {Math.round(caseItem.confidence * 100)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDateTime(caseItem.uploadedAt)}</div>
                      <div>{caseItem.uploadedBy.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewCase(caseItem)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {editingCase === caseItem.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(caseItem.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditing(caseItem.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCase(caseItem.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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
                Showing {filteredCases.length} of {casesData.length} cases
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
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
              <div className="text-2xl font-semibold text-gray-900">{casesData.length}</div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Pending Validation</div>
              <div className="text-2xl font-semibold text-yellow-600">
                {casesData.filter(c => c.status === 'PENDING').length}
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Validated</div>
              <div className="text-2xl font-semibold text-green-600">
                {casesData.filter(c => c.status === 'VALIDATED').length}
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Avg Confidence</div>
              <div className="text-2xl font-semibold text-blue-600">
                {casesData.length > 0 ? Math.round((casesData.reduce((acc, c) => acc + c.confidence, 0) / casesData.length) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Debug Panel - Show current filter state */}
        {showDebug && (
          <div className="mt-6 bg-white shadow rounded-lg border-2 border-blue-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-blue-900">Debug Information</h3>
                <button
                  onClick={() => setShowDebug(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify({
                  filterStatus,
                  searchTerm,
                  incomeFilter,
                  exclusionFilter,
                  customMinIncome,
                  customMaxIncome,
                  totalCases: casesData.length,
                  filteredCases: filteredCases.length,
                  selectedCases: Array.from(selectedCases),
                  editMode,
                  editingCase
                }, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Toggle Debug Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </button>
        </div>
      </div>
    </div>
  )
}