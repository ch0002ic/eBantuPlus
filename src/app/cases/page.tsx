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

export default function CasesPage() {
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [incomeFilter, setIncomeFilter] = useState('ALL')
  const [customMinIncome, setCustomMinIncome] = useState('')
  const [customMaxIncome, setCustomMaxIncome] = useState('')
  const [editingCase, setEditingCase] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<CaseData>>({})
  const [casesData, setCasesData] = useState<CaseData[]>([])
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
    }
  }

  const cancelEditing = () => {
    setEditingCase(null)
    setEditFormData({})
  }

  const saveEdit = (caseId: string) => {
    const originalCase = casesData.find(c => c.id === caseId)
    if (!originalCase) return

    // Update the case data
    setCasesData(prev => prev.map(c => 
      c.id === caseId ? { ...c, ...editFormData } : c
    ))

    cancelEditing()
    alert(`✅ Case ${originalCase.caseNumber} updated successfully!`)
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

        alert(`✅ Case ${caseToDelete.caseNumber} deleted successfully!`)
      } else {
        alert(`❌ Failed to delete case: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting case:', error)
      alert('❌ Failed to delete case. Please try again.')
    }
  }

  // Filter cases based on current criteria
  const filteredCases = casesData.filter(caseItem => {
    // Status filter
    if (filterStatus !== 'ALL' && caseItem.status !== filterStatus) return false

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const searchableText = [
        caseItem.title,
        caseItem.caseNumber,
        caseItem.extractedText,
        caseItem.uploadedBy.name
      ].join(' ').toLowerCase()
      
      if (!searchableText.includes(searchLower)) return false
    }

    // Income filter
    if (incomeFilter !== 'ALL') {
      const income = caseItem.husbandIncome
      switch (incomeFilter) {
        case 'LOW':
          if (income > 2500) return false
          break
        case 'MEDIUM':
          if (income <= 2500 || income > 4000) return false
          break
        case 'HIGH':
          if (income <= 4000) return false
          break
        case 'CUSTOM':
          const min = customMinIncome ? parseInt(customMinIncome) : 0
          const max = customMaxIncome ? parseInt(customMaxIncome) : Infinity
          if (income < min || income > max) return false
          break
      }
    }

    return true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cases...</p>
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
              <Link href="/upload" className="text-gray-700 hover:text-blue-600">
                Upload
              </Link>
              <span className="text-gray-700">LAB Officer</span>
              <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Cases Management</h1>
          <p className="mt-2 text-gray-600">
            Review, validate, and manage Syariah Court case data
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="VALIDATED">Validated</option>
                <option value="EXTRACTED">Extracted</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by case number, title, income, or content..."
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Income Range</label>
              <select
                value={incomeFilter}
                onChange={(e) => setIncomeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="ALL">All Ranges</option>
                <option value="LOW">Low (≤$2,500)</option>
                <option value="MEDIUM">Medium ($2,501-$4,000)</option>
                <option value="HIGH">High (&gt;$4,000)</option>
                <option value="CUSTOM">Custom Range</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={() => {
                  setFilterStatus('ALL')
                  setSearchTerm('')
                  setIncomeFilter('ALL')
                  setCustomMinIncome('')
                  setCustomMaxIncome('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {incomeFilter === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Income</label>
                <input
                  type="number"
                  value={customMinIncome}
                  onChange={(e) => setCustomMinIncome(e.target.value)}
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Income</label>
                <input
                  type="number"
                  value={customMaxIncome}
                  onChange={(e) => setCustomMaxIncome(e.target.value)}
                  placeholder="Max"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Cases ({filteredCases.length})
              </h2>
              <div className="flex space-x-2">
                <Link
                  href="/upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Upload New Case
                </Link>
              </div>
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No cases found matching your criteria.</p>
              <Link href="/upload" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Upload First Case
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Financial Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{caseItem.title}</div>
                        <div className="text-sm text-gray-500">{caseItem.caseNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Income: {formatCurrency(caseItem.husbandIncome)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Nafkah: {formatCurrency(caseItem.nafkahIddah)} | Mutaah: {formatCurrency(caseItem.mutaah)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          caseItem.status === 'VALIDATED' ? 'bg-green-100 text-green-800' :
                          caseItem.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {caseItem.status}
                        </span>
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
                                onClick={() => alert(`View details for case: ${caseItem.title}`)}
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
                              <button
                                onClick={() => handleDeleteCase(caseItem.id)}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Delete
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

          {/* Pagination Info */}
          {filteredCases.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {filteredCases.length} of {casesData.length} cases
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-lg font-medium text-gray-500">Total Cases</div>
                </div>
              </div>
              <div className="mt-1 flex items-baseline">
                <div className="text-3xl font-semibold text-gray-900">{casesData.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-lg font-medium text-gray-500">Pending Validation</div>
                </div>
              </div>
              <div className="mt-1 flex items-baseline">
                <div className="text-3xl font-semibold text-gray-900">
                  {casesData.filter(c => c.status === 'PENDING').length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-lg font-medium text-gray-500">Validated</div>
                </div>
              </div>
              <div className="mt-1 flex items-baseline">
                <div className="text-3xl font-semibold text-gray-900">
                  {casesData.filter(c => c.status === 'VALIDATED').length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-lg font-medium text-gray-500">Avg Confidence</div>
                </div>
              </div>
              <div className="mt-1 flex items-baseline">
                <div className="text-3xl font-semibold text-gray-900">
                  {casesData.length > 0 ? Math.round((casesData.reduce((acc, c) => acc + c.confidence, 0) / casesData.length) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}