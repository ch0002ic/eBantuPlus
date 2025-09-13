'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    
    // Redirect to dashboard after successful upload
    window.location.href = '/dashboard'
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
              <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Syariah Court Document</h1>
          <p className="text-lg text-gray-600">
            Upload PDF documents from Syariah Court cases for AI-powered data extraction
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Title *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., SYC2025001 - Divorce Proceeding"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Number (Optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., SYC2025001"
            />
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Court Document *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : uploadedFile 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="text-green-600">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-lg font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {Math.round(uploadedFile.size / 1024)} KB
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-lg font-medium mb-2">
                    Drop your PDF document here or click to browse
                  </p>
                  <p className="text-sm">
                    Supports: PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              {!uploadedFile && (
                <label
                  htmlFor="file-upload"
                  className="mt-4 inline-block bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Choose File
                </label>
              )}
            </div>
          </div>

          {/* Processing Options */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Processing Options</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Extract nafkah iddah amounts</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Extract mutaah amounts</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Identify husband&apos;s income</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Auto-detect consent orders</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Link
              href="/dashboard"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              onClick={handleUpload}
              disabled={!uploadedFile || isProcessing}
              className={`px-6 py-2 rounded-md font-medium ${
                !uploadedFile || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Upload & Process'
              )}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• AI will extract financial data from your document</li>
            <li>• The system will identify nafkah iddah and mutaah amounts</li>
            <li>• Cases are automatically flagged for consent orders and outliers</li>
            <li>• LAB officers can review and validate extracted data</li>
            <li>• Approved cases contribute to formula recalibration</li>
          </ul>
        </div>
      </div>
    </div>
  )
}