'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

// Mock current formula data
const currentFormulas = {
  nafkahIddah: {
    baseRate: 0.22,
    incomeThresholds: [
      { min: 0, max: 2000, multiplier: 0.18 },
      { min: 2001, max: 4000, multiplier: 0.22 },
      { min: 4001, max: 6000, multiplier: 0.25 },
      { min: 6001, max: Infinity, multiplier: 0.28 }
    ],
    lastUpdated: '2024-01-15',
    casesUsed: 1247
  },
  mutaah: {
    baseRate: 15,
    marriageDurationFactors: [
      { minMonths: 0, maxMonths: 12, multiplier: 0.8 },
      { minMonths: 13, maxMonths: 36, multiplier: 1.0 },
      { minMonths: 37, maxMonths: 72, multiplier: 1.2 },
      { minMonths: 73, maxMonths: Infinity, multiplier: 1.4 }
    ],
    lastUpdated: '2024-01-15',
    casesUsed: 892
  }
}

// Mock pending recalibration data
const pendingRecalibration = {
  newCasesCount: 127,
  significantDeviations: 8,
  recommendedChanges: {
    nafkahIddah: {
      newBaseRate: 0.235,
      changePercentage: '+6.8%',
      confidence: 0.92
    },
    mutaah: {
      newBaseRate: 16.5,
      changePercentage: '+10%',
      confidence: 0.88
    }
  },
  lastCalculated: '2025-01-15T10:30:00Z'
}

export default function FormulasPage() {
  const [activeTab, setActiveTab] = useState('current')
  const [showRecalibrationModal, setShowRecalibrationModal] = useState(false)

  const handleRecalibration = () => {
    setShowRecalibrationModal(true)
  }

  const executeRecalibration = () => {
    // Simulate recalibration process
    alert('Formula recalibration initiated. This process will take 5-10 minutes.')
    setShowRecalibrationModal(false)
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Formula Management</h1>
              <p className="mt-2 text-gray-600">
                Monitor and update nafkah iddah and mutaah calculation formulas
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'current'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Current Formulas
              </button>
              <button
                onClick={() => setActiveTab('recalibration')}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'recalibration'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Recalibration
              </button>
            </div>
          </div>
        </div>

        {/* Alert for pending changes */}
        {pendingRecalibration.newCasesCount > 100 && (
          <div className="mx-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Formula Recalibration Recommended
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    {pendingRecalibration.newCasesCount} new validated cases available. 
                    Significant deviations detected in {pendingRecalibration.significantDeviations} cases.
                  </p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleRecalibration}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                  >
                    Review Recommendations
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'current' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Nafkah Iddah Formula */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Nafkah Iddah Formula</h3>
                  <p className="text-sm text-gray-500">Income-based maintenance calculation</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Base Rate</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(currentFormulas.nafkahIddah.baseRate * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">of monthly income</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">Income Thresholds</div>
                  <div className="space-y-2">
                    {currentFormulas.nafkahIddah.incomeThresholds.map((threshold, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">
                          {formatCurrency(threshold.min)} - {threshold.max === Infinity ? '∞' : formatCurrency(threshold.max)}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {Math.round(threshold.multiplier * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="text-gray-900">{currentFormulas.nafkahIddah.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Cases Used:</span>
                    <span className="text-gray-900">{currentFormulas.nafkahIddah.casesUsed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mutaah Formula */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Mutaah Formula</h3>
                  <p className="text-sm text-gray-500">Marriage duration-based compensation</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Base Rate</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(currentFormulas.mutaah.baseRate)}
                  </div>
                  <div className="text-xs text-gray-500">per day</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">Marriage Duration Factors</div>
                  <div className="space-y-2">
                    {currentFormulas.mutaah.marriageDurationFactors.map((factor, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">
                          {factor.minMonths} - {factor.maxMonths === Infinity ? '∞' : factor.maxMonths} months
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {factor.multiplier}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="text-gray-900">{currentFormulas.mutaah.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Cases Used:</span>
                    <span className="text-gray-900">{currentFormulas.mutaah.casesUsed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recalibration' && (
          <div className="space-y-8">
            {/* Recalibration Overview */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recalibration Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {pendingRecalibration.newCasesCount}
                  </div>
                  <div className="text-sm text-gray-500">New Validated Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {pendingRecalibration.significantDeviations}
                  </div>
                  <div className="text-sm text-gray-500">Significant Deviations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.min(
                      pendingRecalibration.recommendedChanges.nafkahIddah.confidence,
                      pendingRecalibration.recommendedChanges.mutaah.confidence
                    ) * 100}%
                  </div>
                  <div className="text-sm text-gray-500">Model Confidence</div>
                </div>
              </div>
            </div>

            {/* Recommended Changes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Nafkah Iddah Recommendations
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Base Rate:</span>
                    <span className="font-medium">
                      {Math.round(currentFormulas.nafkahIddah.baseRate * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recommended Rate:</span>
                    <span className="font-medium text-blue-600">
                      {Math.round(pendingRecalibration.recommendedChanges.nafkahIddah.newBaseRate * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Change:</span>
                    <span className="font-medium text-green-600">
                      {pendingRecalibration.recommendedChanges.nafkahIddah.changePercentage}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="font-medium">
                      {Math.round(pendingRecalibration.recommendedChanges.nafkahIddah.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Mutaah Recommendations
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Base Rate:</span>
                    <span className="font-medium">
                      {formatCurrency(currentFormulas.mutaah.baseRate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recommended Rate:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(pendingRecalibration.recommendedChanges.mutaah.newBaseRate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Change:</span>
                    <span className="font-medium text-green-600">
                      {pendingRecalibration.recommendedChanges.mutaah.changePercentage}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="font-medium">
                      {Math.round(pendingRecalibration.recommendedChanges.mutaah.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="flex space-x-4">
                <button
                  onClick={executeRecalibration}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  Apply Recommended Changes
                </button>
                <button className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 font-medium">
                  Download Report
                </button>
                <button className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 font-medium">
                  Schedule Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recalibration Modal */}
      {showRecalibrationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Formula Recalibration
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                This will update the active formulas based on {pendingRecalibration.newCasesCount} new validated cases. 
                The process cannot be undone, but previous formulas will be archived.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRecalibrationModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={executeRecalibration}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Confirm Recalibration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}