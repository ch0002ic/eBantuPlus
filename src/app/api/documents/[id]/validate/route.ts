/**
 * Document Validation API
 * PUT /api/documents/[id]/validate
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params
    const validationData = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }

    // Validate correction data
    const CorrectionSchema = z.object({
      extractedData: z.object({
        husbandIncome: z.number().min(0).optional(),
        nafkahIddahAmount: z.number().min(0).optional(),
        mutaahAmount: z.number().min(0).optional(),
        marriageDuration: z.number().min(0).optional(),
        isConsentOrder: z.boolean().optional()
      }).optional(),
      validatorId: z.string(),
      validatorName: z.string(),
      validationNotes: z.string().optional(),
      approvalStatus: z.enum(['approved', 'rejected', 'needs_review']).optional()
    })

    const validatedData = CorrectionSchema.parse(validationData)

    // In production, update database record
    const updatedDocument = {
      id: documentId,
      ...validatedData,
      validatedAt: new Date().toISOString(),
      validationHistory: [
        {
          timestamp: new Date().toISOString(),
          validatorId: validatedData.validatorId,
          validatorName: validatedData.validatorName,
          changes: validatedData.extractedData,
          notes: validatedData.validationNotes
        }
      ]
    }

    // Log validation action
    console.log('Document validated:', {
      documentId,
      validatorId: validatedData.validatorId,
      changes: Object.keys(validatedData.extractedData || {}).length,
      approvalStatus: validatedData.approvalStatus
    })

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      message: 'Document validation updated successfully'
    })

  } catch (error) {
    console.error('Document validation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation data invalid',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Document validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}