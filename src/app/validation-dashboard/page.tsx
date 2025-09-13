/**
 * Document Validation Page
 * 
 * Advanced validation interface for LAB officers to review processed documents
 * with sophisticated confidence scoring and human-in-the-loop validation workflows.
 */

'use client'

import ValidationDashboard from '@/components/ValidationDashboard'

export default function ValidationPage() {
  const handleValidate = async (documentId: string, validationData: unknown) => {
    console.log('Validating document:', documentId, validationData)
    
    try {
      const response = await fetch(`/api/documents/${documentId}/validate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationData),
      })
      
      if (response.ok) {
        console.log('Document validated successfully')
      } else {
        console.error('Validation failed:', await response.text())
      }
    } catch (error) {
      console.error('Validation error:', error)
    }
  }

  const handleApprove = async (documentId: string) => {
    console.log('Approving document:', documentId)
    
    try {
      const response = await fetch(`/api/documents/${documentId}/validate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalStatus: 'approved',
          validatorId: 'lab_officer_123',
          validatorName: 'LAB Officer',
          validationNotes: 'Approved for formula calculation'
        }),
      })
      
      if (response.ok) {
        console.log('Document approved successfully')
      }
    } catch (error) {
      console.error('Approval error:', error)
    }
  }

  const handleReject = async (documentId: string, reason: string) => {
    console.log('Rejecting document:', documentId, reason)
    
    try {
      const response = await fetch(`/api/documents/${documentId}/validate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalStatus: 'rejected',
          validatorId: 'lab_officer_123',
          validatorName: 'LAB Officer',
          validationNotes: `Rejected: ${reason}`
        }),
      })
      
      if (response.ok) {
        console.log('Document rejected successfully')
      }
    } catch (error) {
      console.error('Rejection error:', error)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <ValidationDashboard 
        onValidate={handleValidate}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}