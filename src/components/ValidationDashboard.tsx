/**
 * Document Validation Dashboard Component
 * 
 * Provides comprehensive interface for LAB officers to review, validate, and approve
 * processed legal documents with confidence scoring and validation workflows.
 */

'use client'

import React, { useState } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  FileText, 
  Eye,
  Edit3,
  Save,
  X,
  BarChart3,
  Download
} from 'lucide-react'
import { ProcessedDocument } from '@/lib/document-processor'

// Simple UI components for the dashboard
const Card = ({ children, className = '', ...props }: { 
  children: React.ReactNode
  className?: string 
  [key: string]: unknown
}) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '', ...props }: { 
  children: React.ReactNode
  className?: string 
  [key: string]: unknown
}) => (
  <div className={`p-6 pb-4 ${className}`} {...props}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '', ...props }: { 
  children: React.ReactNode
  className?: string 
  [key: string]: unknown
}) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = '', ...props }: { 
  children: React.ReactNode
  className?: string 
  [key: string]: unknown
}) => (
  <p className={`text-sm text-gray-600 ${className}`} {...props}>
    {children}
  </p>
)

const CardContent = ({ children, className = '', ...props }: { 
  children: React.ReactNode
  className?: string 
  [key: string]: unknown
}) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
)

const Button = ({ children, variant = 'default', size = 'default', className = '', onClick, ...props }: {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  onClick?: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  }
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8'
  }
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const Badge = ({ children, variant = 'default', className = '', ...props }: {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'destructive'
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 bg-white',
    destructive: 'bg-red-100 text-red-800'
  }
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}

const Input = ({ className = '', type = 'text', ...props }: { 
  className?: string
  type?: string
  [key: string]: unknown
}) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Label = ({ children, className = '', htmlFor, ...props }: { 
  children: React.ReactNode
  className?: string
  htmlFor?: string
  [key: string]: unknown
}) => (
  <label 
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} 
    {...props}
  >
    {children}
  </label>
)

const Textarea = ({ className = '', ...props }: { 
  className?: string
  [key: string]: unknown
}) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

interface ValidationDashboardProps {
  documents?: ProcessedDocument[]
  onValidate?: (documentId: string, validationData: unknown) => void
  onApprove?: (documentId: string) => void
  onReject?: (documentId: string, reason: string) => void
}

export default function ValidationDashboard({
  documents = [],
  onValidate,
  onApprove,
  onReject
}: ValidationDashboardProps) {
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedData, setEditedData] = useState<Record<string, unknown>>({})
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('confidence')
  const [validationNotes, setValidationNotes] = useState('')
  const [incomeThreshold, setIncomeThreshold] = useState<number>(4000)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [approvedDocuments, setApprovedDocuments] = useState<Set<string>>(new Set())
  const [rejectedDocuments, setRejectedDocuments] = useState<Set<string>>(new Set())
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Mock documents if none provided
  const mockDocuments: ProcessedDocument[] = documents.length > 0 ? documents : [
    {
      id: 'doc_1',
      fileName: 'syariah-court-order-001.pdf',
      fileType: 'pdf',
      fileSize: 245760,
      uploadedAt: new Date('2024-01-15T10:30:00Z'),
      processedAt: new Date('2024-01-15T10:31:30Z'),
      status: 'completed',
      extractedData: {
        caseNumber: 'SYC2024/1234',
        husbandName: 'Abdul Rahman bin Ahmad',
        wifeName: 'Siti Fatimah bte Mohamed',
        husbandIncome: 2800,
        nafkahIddahAmount: 439,
        mutaahAmount: 2.69,
        marriageDuration: 8.5,
        documentType: 'judgment',
        isConsentOrder: false,
        containsFinancialData: true
      },
      confidence: {
        overall: 0.92,
        extraction: 0.95,
        entityRecognition: 0.90,
        templateMatching: 0.94,
        dataValidation: 0.96
      },
      validationFlags: [
        {
          type: 'info',
          field: 'marriageDuration',
          message: 'Marriage duration calculated from available dates',
          severity: 'low',
          autoFixable: false
        }
      ],
      metadata: { pages: 3, template: 'syariah_court_order' }
    },
    {
      id: 'doc_2',
      fileName: 'consent-order-002.pdf',
      fileType: 'pdf',
      fileSize: 186432,
      uploadedAt: new Date('2024-01-15T11:15:00Z'),
      processedAt: new Date('2024-01-15T11:16:45Z'),
      status: 'completed',
      extractedData: {
        caseNumber: 'SYC2024/1235',
        husbandName: 'Mohamed Ali bin Hassan',
        wifeName: 'Aminah bte Abdullah',
        husbandIncome: 3200,
        nafkahIddahAmount: 495,
        mutaahAmount: 3.92,
        marriageDuration: 12.0,
        documentType: 'consent_order',
        isConsentOrder: true,
        containsFinancialData: true
      },
      confidence: {
        overall: 0.78,
        extraction: 0.82,
        entityRecognition: 0.75,
        templateMatching: 0.80,
        dataValidation: 0.72
      },
      validationFlags: [
        {
          type: 'warning',
          field: 'isConsentOrder',
          message: 'Consent order detected - review for formula calculation exclusion',
          severity: 'medium',
          autoFixable: false
        },
        {
          type: 'error',
          field: 'nafkahIddahAmount',
          message: 'Amount deviates significantly from LAB formula',
          severity: 'high',
          autoFixable: true
        }
      ],
      metadata: { pages: 2, template: 'consent_order' }
    }
  ]

  const filteredDocuments = mockDocuments.filter(doc => {
    // Income threshold filtering
    const husbandIncome = doc.extractedData.husbandIncome as number || 0
    if (husbandIncome > incomeThreshold) return false
    
    // Status filtering
    if (filterStatus === 'all') return true
    if (filterStatus === 'high_confidence') return doc.confidence.overall >= 0.9
    if (filterStatus === 'needs_review') return doc.validationFlags.some(f => f.severity === 'high')
    if (filterStatus === 'consent_orders') return doc.extractedData.isConsentOrder
    
    return true
  }).filter(doc => {
    // Tab filtering
    if (activeTab === 'all') return true
    if (activeTab === 'approved') return approvedDocuments.has(doc.id)
    if (activeTab === 'rejected') return rejectedDocuments.has(doc.id)
    if (activeTab === 'pending') return !approvedDocuments.has(doc.id) && !rejectedDocuments.has(doc.id)
    return true
  }).sort((a, b) => {
    if (sortBy === 'confidence') return b.confidence.overall - a.confidence.overall
    if (sortBy === 'date') return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    if (sortBy === 'flags') return b.validationFlags.length - a.validationFlags.length
    return 0
  })

  const handleEdit = (document: ProcessedDocument) => {
    setSelectedDocument(document)
    setEditedData(document.extractedData as Record<string, unknown>)
    setEditMode(true)
  }

  const handleSave = () => {
    if (selectedDocument && onValidate) {
      onValidate(selectedDocument.id, {
        extractedData: editedData,
        validatorId: 'user_123',
        validatorName: 'LAB Officer',
        validationNotes
      })
    }
    setEditMode(false)
    setValidationNotes('')
  }

  const handleApprove = (document: ProcessedDocument) => {
    try {
      setApprovedDocuments(prev => new Set([...prev, document.id]))
      setRejectedDocuments(prev => {
        const newSet = new Set(prev)
        newSet.delete(document.id)
        return newSet
      })
      
      if (onApprove) {
        onApprove(document.id)
      }
      
      setActionFeedback({ type: 'success', message: `Document ${document.fileName} approved successfully` })
      setTimeout(() => setActionFeedback(null), 3000)
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to approve document' })
      setTimeout(() => setActionFeedback(null), 3000)
    }
  }

  const handleReject = (document: ProcessedDocument) => {
    const reason = prompt('Reason for rejection:')
    if (reason) {
      try {
        setRejectedDocuments(prev => new Set([...prev, document.id]))
        setApprovedDocuments(prev => {
          const newSet = new Set(prev)
          newSet.delete(document.id)
          return newSet
        })
        
        if (onReject) {
          onReject(document.id, reason)
        }
        
        setActionFeedback({ type: 'success', message: `Document ${document.fileName} rejected: ${reason}` })
        setTimeout(() => setActionFeedback(null), 3000)
      } catch {
        setActionFeedback({ type: 'error', message: 'Failed to reject document' })
        setTimeout(() => setActionFeedback(null), 3000)
      }
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-500'
    if (confidence >= 0.7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getFlagIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Validation Dashboard</h1>
          <p className="text-gray-600">Review and validate processed legal documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Action Feedback */}
      {actionFeedback && (
        <div className={`p-4 rounded-lg border ${
          actionFeedback.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {actionFeedback.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Documents', count: mockDocuments.length },
            { key: 'pending', label: 'Pending Review', count: mockDocuments.filter(d => !approvedDocuments.has(d.id) && !rejectedDocuments.has(d.id)).length },
            { key: 'approved', label: 'Approved', count: approvedDocuments.size },
            { key: 'rejected', label: 'Rejected', count: rejectedDocuments.size }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Filters and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredDocuments.length}</div>
            <div className="text-sm text-gray-600">Filtered Documents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredDocuments.length > 0 ? (filteredDocuments.reduce((acc, doc) => acc + doc.confidence.overall, 0) / filteredDocuments.length * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Confidence</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredDocuments.filter(doc => doc.validationFlags.some(f => f.severity === 'high')).length}
            </div>
            <div className="text-sm text-gray-600">Need Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">${incomeThreshold.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Income Threshold</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Status Filter:</Label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">All Documents</option>
                <option value="high_confidence">High Confidence</option>
                <option value="needs_review">Needs Review</option>
                <option value="consent_orders">Consent Orders</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Sort by:</Label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="confidence">Confidence</option>
                <option value="date">Upload Date</option>
                <option value="flags">Validation Flags</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="threshold">Income Threshold ($):</Label>
              <Input
                id="threshold"
                type="number"
                value={incomeThreshold}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncomeThreshold(parseInt(e.target.value) || 4000)}
                placeholder="4000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Quick Filters:</Label>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIncomeThreshold(4000)}
                >
                  LAB Standard
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIncomeThreshold(10000)}
                >
                  High Income
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Cards */}
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {document.fileName}
                    </CardTitle>
                    <CardDescription>
                      Case: {document.extractedData.caseNumber || 'Unknown'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedDocument(document)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(document)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Confidence Score */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getConfidenceColor(document.confidence.overall)}`}
                      style={{ width: `${document.confidence.overall * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {(document.confidence.overall * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Key Data */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>Income: ${document.extractedData.husbandIncome?.toLocaleString() || 'N/A'}</div>
                  <div>Nafkah: ${document.extractedData.nafkahIddahAmount || 'N/A'}</div>
                  <div>Mutaah: ${document.extractedData.mutaahAmount || 'N/A'}</div>
                  <div>Duration: {document.extractedData.marriageDuration || 'N/A'} years</div>
                </div>

                {/* Validation Flags */}
                {document.validationFlags.length > 0 && (
                  <div className="space-y-1">
                    {document.validationFlags.slice(0, 2).map((flag, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getFlagIcon(flag.type)}
                        <span className="truncate">{flag.message}</span>
                      </div>
                    ))}
                    {document.validationFlags.length > 2 && (
                      <div className="text-sm text-gray-500">
                        +{document.validationFlags.length - 2} more
                      </div>
                    )}
                  </div>
                )}

                {/* Document Type Badge */}
                <div className="flex gap-2 mt-3">
                  <Badge variant={document.extractedData.isConsentOrder ? 'destructive' : 'default'}>
                    {document.extractedData.documentType?.replace('_', ' ') || 'Unknown'}
                  </Badge>
                  {document.extractedData.isConsentOrder && (
                    <Badge variant="outline">Consent Order</Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleApprove(document)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleReject(document)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Panel */}
        <div>
          {selectedDocument && (
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Document Details</CardTitle>
                    <CardDescription>{selectedDocument.fileName}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedDocument(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Edit Mode Toggle */}
                {!editMode ? (
                  <>
                    {/* View Mode */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Case Number</Label>
                        <div className="text-sm">{selectedDocument.extractedData.caseNumber || 'N/A'}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Husband Income</Label>
                        <div className="text-sm">${selectedDocument.extractedData.husbandIncome?.toLocaleString() || 'N/A'}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Nafkah Iddah</Label>
                        <div className="text-sm">${selectedDocument.extractedData.nafkahIddahAmount || 'N/A'}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Mutaah</Label>
                        <div className="text-sm">${selectedDocument.extractedData.mutaahAmount || 'N/A'}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Marriage Duration</Label>
                        <div className="text-sm">{selectedDocument.extractedData.marriageDuration || 'N/A'} years</div>
                      </div>
                    </div>
                    
                    <Button onClick={() => handleEdit(selectedDocument)} className="w-full">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Data
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Edit Mode */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="income">Husband Income ($)</Label>
                        <Input
                          id="income"
                          type="number"
                          value={editedData.husbandIncome || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedData({...editedData, husbandIncome: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nafkah">Nafkah Iddah ($)</Label>
                        <Input
                          id="nafkah"
                          type="number"
                          step="0.01"
                          value={editedData.nafkahIddahAmount || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedData({...editedData, nafkahIddahAmount: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="mutaah">Mutaah ($)</Label>
                        <Input
                          id="mutaah"
                          type="number"
                          step="0.01"
                          value={editedData.mutaahAmount || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedData({...editedData, mutaahAmount: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Marriage Duration (years)</Label>
                        <Input
                          id="duration"
                          type="number"
                          step="0.1"
                          value={editedData.marriageDuration || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedData({...editedData, marriageDuration: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Validation Notes</Label>
                        <Textarea
                          id="notes"
                          value={validationNotes}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValidationNotes(e.target.value)}
                          placeholder="Enter validation notes..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </>
                )}

                {/* Validation Flags */}
                {selectedDocument.validationFlags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Validation Flags</Label>
                    <div className="space-y-2">
                      {selectedDocument.validationFlags.map((flag, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          {getFlagIcon(flag.type)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">{flag.field}</div>
                            <div className="text-sm text-gray-600">{flag.message}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {flag.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence Breakdown */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Confidence Breakdown</Label>
                  <div className="space-y-2">
                    {Object.entries(selectedDocument.confidence).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getConfidenceColor(value)}`}
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-10">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}