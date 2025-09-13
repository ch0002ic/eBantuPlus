'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

// Enhanced case data with more realistic information
const enhancedCaseData = [
  {
    id: 'SYC2025001',
    title: '[2025] SGHCF 001 - Lathibaby Bevi v Abdul Mustapha',
    caseNumber: 'SYC2025001',
    status: 'validated' as const,
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
    originalDocument: 'SYC2025001_judgment.pdf'
  },
  {
    id: 'SYC2025002',
    title: '[2025] SGHCF 002 - Muhd Munir v Noor Hidah',
    caseNumber: 'SYC2025002',
    status: 'pending' as const,
    uploadedAt: '4 hours ago',
    uploadedBy: 'LAB Officer Siti',
    extractedData: {
      husbandIncome: 4200,
      nafkahIddah: 635,
      mutaah: 4,
      marriageDuration: 10,
      confidence: 0.87
    },
    extractedText: 'Reference: [1990] SGHC 78 Muhd Munir v Noor Hidah. Husband income $4,200 monthly. Nafkah iddah awarded $635 pursuant to established precedent...',
    originalDocument: 'SYC2025002_judgment.pdf'
  },
  {
    id: 'SYC2025003',
    title: '[2025] SGHCF 003 - Salijah bte Ab Latef v Mohd Irwan',
    caseNumber: 'SYC2025003',
    status: 'processing' as const,
    uploadedAt: '6 hours ago',
    uploadedBy: 'LAB Officer Ahmad',
    extractedData: {
      husbandIncome: 2800,
      nafkahIddah: 439,
      mutaah: 4,
      marriageDuration: 5,
      confidence: 0.91
    },
    extractedText: 'Reference: [1996] SGCA 32 Salijah bte Ab Latef v Mohd Irwan bin Abdullah Teo. Husband salary $2,800. Court consideration of s.114 factors...',
    originalDocument: 'SYC2025003_judgment.pdf'
  }
]

type CaseData = typeof enhancedCaseData[0]

export default function Dashboard() {
  const [cases, setCases] = useState(enhancedCaseData)
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit' | 'view'>('list')
  const [editFormData, setEditFormData] = useState<Partial<CaseData['extractedData']>>({})
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [actionFeedback, setActionFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const handleViewCase = (caseData: CaseData) => {
    setSelectedCase(caseData)
    setViewMode('view')
  }

  const handleEditCase = (caseData: CaseData) => {
    setSelectedCase(caseData)
    setEditFormData(caseData.extractedData)
    setViewMode('edit')
  }

  const handleValidateCase = (caseId: string, action: 'approve' | 'reject') => {
    setCases(prev => prev.map(c => 
      c.id === caseId 
        ? { ...c, status: action === 'approve' ? 'validated' as const : 'pending' as const }
        : c
    ))
    
    setActionFeedback({
      type: 'success',
      message: `Case ${caseId} ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    })
    
    setTimeout(() => setActionFeedback(null), 3000)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveEdit = () => {
    if (!selectedCase) return
    
    setCases(prev => prev.map(c => 
      c.id === selectedCase.id 
        ? { ...c, extractedData: { ...c.extractedData, ...editFormData } }
        : c
    ))
    
    setActionFeedback({
      type: 'success',
      message: `Case ${selectedCase.id} updated successfully`
    })
    
    setViewMode('list')
    setSelectedCase(null)
    setTimeout(() => setActionFeedback(null), 3000)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCancelEdit = () => {
    setViewMode('list')
    setSelectedCase(null)
    setEditFormData({})
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
              <span className="text-gray-700">LAB Officer</span>
              <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor case processing and formula recalibration
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Cases"
            value="1,247"
            change="+12%"
            changeType="positive"
          />
          <StatCard
            title="Pending Validation"
            value="23"
            change="-5%"
            changeType="negative"
          />
          <StatCard
            title="Processed Today"
            value="45"
            change="+18%"
            changeType="positive"
          />
          <StatCard
            title="Formula Accuracy"
            value="95.2%"
            change="+2.1%"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title="Upload New Case"
            description="Upload and process Syariah Court documents"
            icon="📄"
            href="/upload"
            bgColor="bg-blue-50 border-blue-200"
          />
          <QuickActionCard
            title="Review Validations"
            description="Validate AI-extracted data from recent cases"
            icon="✅"
            href="/validation"
            bgColor="bg-green-50 border-green-200"
          />
          <QuickActionCard
            title="Update Formulas"
            description="Recalibrate nafkah iddah and mutaah formulas"
            icon="📊"
            href="/formulas"
            bgColor="bg-purple-50 border-purple-200"
          />
        </div>

        {/* Recent Cases */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {cases.slice(0, 3).map((caseData: CaseData) => (
              <CaseRow
                key={caseData.id}
                caseData={caseData}
                onView={handleViewCase}
                onEdit={handleEditCase}
                onValidate={(id: string) => handleValidateCase(id, 'approve')}
              />
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 text-center">
            <Link href="/cases" className="text-blue-600 hover:text-blue-700 font-medium">
              View All Cases →
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CaseDetailView
        caseData={selectedCase || cases[0]}
        isOpen={viewMode === 'view' && selectedCase !== null}
        onClose={() => {
          setViewMode('list')
          setSelectedCase(null)
        }}
        onEdit={handleEditCase}
      />

      <CaseEditView
        caseData={selectedCase || cases[0]}
        isOpen={viewMode === 'edit' && selectedCase !== null}
        onClose={() => {
          setViewMode('list')
          setSelectedCase(null)
        }}
        onSave={(updatedCase: CaseData) => {
          setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c))
          setViewMode('list')
          setSelectedCase(null)
          setActionFeedback({ type: 'success', message: 'Case updated successfully' })
          setTimeout(() => setActionFeedback(null), 3000)
        }}
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
}

function StatCard({ title, value, change, changeType }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-lg font-medium text-gray-500">{title}</div>
          </div>
        </div>
        <div className="mt-1 flex items-baseline">
          <div className="text-3xl font-semibold text-gray-900">{value}</div>
          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </div>
        </div>
      </div>
    </div>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  icon: string
  href: string
  bgColor: string
}

function QuickActionCard({ title, description, icon, href, bgColor }: QuickActionCardProps) {
  return (
    <Link href={href} className="group">
      <div className={`${bgColor} border-2 rounded-lg p-6 hover:shadow-md transition-shadow`}>
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  )
}

interface CaseRowProps {
  caseData: CaseData
  onView: (caseData: CaseData) => void
  onEdit: (caseData: CaseData) => void
  onValidate: (id: string) => void
}

function CaseRow({ caseData, onView, onEdit, onValidate }: CaseRowProps) {
  const statusColors = {
    validated: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="px-6 py-4 hover:bg-gray-50 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-medium text-gray-900">{caseData.title}</h4>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[caseData.status]}`}>
              {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
            </div>
          </div>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <span>{caseData.uploadedAt}</span>
            <span className="mx-2">•</span>
            <span>Income: ${caseData.extractedData.husbandIncome}</span>
            <span className="mx-2">•</span>
            <span>Nafkah: ${caseData.extractedData.nafkahIddah}</span>
            <span className="mx-2">•</span>
            <span>Mutaah: ${caseData.extractedData.mutaah}</span>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(caseData as any).courtReference && (
            <div className="mt-1 text-xs text-blue-600">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(caseData as any).courtReference}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onView(caseData)}
            className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
          <button
            onClick={() => onEdit(caseData)}
            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          {caseData.status === 'pending' && (
            <button
              onClick={() => onValidate(caseData.id)}
              className="px-3 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Validate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Modal Components
interface CaseDetailViewProps {
  caseData: CaseData
  isOpen: boolean
  onClose: () => void
  onEdit?: (caseData: CaseData) => void
}

function CaseDetailView({ caseData, isOpen, onClose, onEdit }: CaseDetailViewProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Case Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Case Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Title:</span>
                <span className="text-sm font-medium text-gray-900">{caseData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Case Number:</span>
                <span className="text-sm font-medium text-gray-900">{caseData.caseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{caseData.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uploaded:</span>
                <span className="text-sm font-medium text-gray-900">{caseData.uploadedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uploaded By:</span>
                <span className="text-sm font-medium text-gray-900">{caseData.uploadedBy}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Extracted Financial Data</h4>
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Husband Income:</span>
                <span className="text-sm font-medium text-gray-900">${caseData.extractedData.husbandIncome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nafkah Iddah:</span>
                <span className="text-sm font-medium text-gray-900">${caseData.extractedData.nafkahIddah}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mutaah:</span>
                <span className="text-sm font-medium text-gray-900">${caseData.extractedData.mutaah}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Marriage Duration:</span>
                <span className="text-sm font-medium text-gray-900">{caseData.extractedData.marriageDuration} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Confidence:</span>
                <span className="text-sm font-medium text-gray-900">{(caseData.extractedData.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Extracted Text Preview</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 line-clamp-4">
                {caseData.extractedText.substring(0, 300)}...
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          {onEdit && (
            <button
              onClick={() => {
                onEdit(caseData)
                onClose()
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Case
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

interface CaseEditViewProps {
  caseData: CaseData
  isOpen: boolean
  onClose: () => void
  onSave: (updatedData: CaseData) => void
}

function CaseEditView({ caseData, isOpen, onClose, onSave }: CaseEditViewProps) {
  const [editedData, setEditedData] = useState<CaseData>(caseData)

  useEffect(() => {
    setEditedData(caseData)
  }, [caseData])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(editedData)
    onClose()
  }

  const updateExtractedData = (field: string, value: number) => {
    setEditedData(prev => ({
      ...prev,
      extractedData: {
        ...prev.extractedData,
        [field]: value
      }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Case</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Case Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editedData.title}
                  onChange={(e) => setEditedData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                <input
                  type="text"
                  value={editedData.caseNumber}
                  onChange={(e) => setEditedData(prev => ({ ...prev, caseNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Financial Data</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Husband Income ($)</label>
                <input
                  type="number"
                  value={editedData.extractedData.husbandIncome}
                  onChange={(e) => updateExtractedData('husbandIncome', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nafkah Iddah ($)</label>
                <input
                  type="number"
                  value={editedData.extractedData.nafkahIddah}
                  onChange={(e) => updateExtractedData('nafkahIddah', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mutaah ($)</label>
                <input
                  type="number"
                  value={editedData.extractedData.mutaah}
                  onChange={(e) => updateExtractedData('mutaah', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marriage Duration (years)</label>
                <input
                  type="number"
                  value={editedData.extractedData.marriageDuration}
                  onChange={(e) => updateExtractedData('marriageDuration', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}