/**
 * Document Retrieval API
 * GET /api/documents/[id]
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }

    // In production, retrieve from database
    // For demo, return mock processed document
    const mockProcessedDocument = {
      id: documentId,
      fileName: 'sample-court-order.pdf',
      fileType: 'pdf',
      fileSize: 245760,
      uploadedAt: new Date('2024-01-15T10:30:00Z'),
      processedAt: new Date('2024-01-15T10:31:30Z'),
      status: 'completed',
      extractedData: {
        caseNumber: 'SYC2024/1234',
        courtType: 'Syariah Court',
        dateOfOrder: '15 March 2024',
        judgePresiding: 'Judge Ahmad bin Ali',
        husbandName: 'Abdul Rahman bin Ahmad',
        wifeName: 'Siti Fatimah bte Mohamed',
        husbandIC: 'S1234567A',
        wifeIC: 'S2345678B',
        marriageDate: '15 July 2015',
        divorceType: 'talaq',
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
        ocr: 0.88,
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
      metadata: {
        pages: 3,
        language: 'en-SG',
        encoding: 'UTF-8',
        template: 'syariah_court_order'
      }
    }

    return NextResponse.json({
      success: true,
      document: mockProcessedDocument
    })

  } catch (error) {
    console.error('Document retrieval error:', error)
    
    return NextResponse.json(
      { 
        error: 'Document retrieval failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}