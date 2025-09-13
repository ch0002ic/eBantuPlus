'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

// Mock data for demonstration
const mockCases = [
  {
    id: '1',
    title: 'SYC2025001 - Divorce Proceeding',
    caseNumber: 'SYC2025001',
    status: 'VALIDATED',
    uploadedAt: new Date('2025-09-13T08:00:00'),
    husbandIncome: 3500,
    nafkahIddah: 800,
    mutaah: 15,
    confidence: 0.95,
    uploadedBy: { name: 'Officer Ahmad' }
  },
  {
    id: '2',
    title: 'SYC2025002 - Maintenance Application',
    caseNumber: 'SYC2025002',
    status: 'PENDING',
    uploadedAt: new Date('2025-09-13T10:30:00'),
    husbandIncome: 4200,
    nafkahIddah: 950,
    mutaah: 18,
    confidence: 0.87,
    uploadedBy: { name: 'Officer Siti' }
  },
  {
    id: '3',
    title: 'SYC2025003 - Financial Relief',
    caseNumber: 'SYC2025003',
    status: 'PROCESSING',
    uploadedAt: new Date('2025-09-13T12:15:00'),
    husbandIncome: 2800,
    nafkahIddah: 650,
    mutaah: 12,
    confidence: 0.92,
    uploadedBy: { name: 'Officer Rahman' }
  },
  {
    id: '4',
    title: 'SYC2025004 - Consent Order',
    caseNumber: 'SYC2025004',
    status: 'EXCLUDED',
    uploadedAt: new Date('2025-09-13T14:45:00'),
    husbandIncome: 5200,
    nafkahIddah: 1000,
    mutaah: 20,
    confidence: 0.78,
    uploadedBy: { name: 'Officer Aminah' }
  }
]

export default function CasesPage() {
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCases = mockCases.filter(caseItem => {
    const matchesStatus = filterStatus === 'ALL' || caseItem.status === filterStatus
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
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
          <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
          <p className="mt-2 text-gray-600">
            Review and manage Syariah Court cases and extracted data
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
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
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Cases Table */}
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
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {caseItem.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {caseItem.caseNumber}
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getConfidenceColor(caseItem.confidence)}`}>
                        {Math.round(caseItem.confidence * 100)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDateTime(caseItem.uploadedAt)}</div>
                      <div>by {caseItem.uploadedBy.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          View
                        </button>
                        {caseItem.status === 'PENDING' && (
                          <button className="text-green-600 hover:text-green-900">
                            Validate
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredCases.length} of {mockCases.length} cases
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
              <div className="text-2xl font-semibold text-gray-900">{mockCases.length}</div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Pending Validation</div>
              <div className="text-2xl font-semibold text-yellow-600">
                {mockCases.filter(c => c.status === 'PENDING').length}
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Validated</div>
              <div className="text-2xl font-semibold text-green-600">
                {mockCases.filter(c => c.status === 'VALIDATED').length}
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Avg Confidence</div>
              <div className="text-2xl font-semibold text-blue-600">
                {Math.round((mockCases.reduce((acc, c) => acc + c.confidence, 0) / mockCases.length) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}