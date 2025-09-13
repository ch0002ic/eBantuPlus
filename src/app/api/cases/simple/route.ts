/**
 * Simple Cases API for demo
 * GET /api/cases/simple - Fetch all cases
 * POST /api/cases/simple - Create new case
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllCases, addCase } from '@/lib/cases-storage'

export async function GET() {
  try {
    const cases = getAllCases()
    
    return NextResponse.json({
      success: true,
      data: cases
    })
  } catch (error) {
    console.error('Cases fetch error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch cases',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newCase = addCase({
      title: body.title || `Case ${Date.now()}`,
      caseNumber: body.caseNumber || undefined,
      status: 'pending',
      uploadedAt: 'Just now',
      uploadedBy: 'LAB Officer',
      extractedData: {
        husbandIncome: body.extractedData?.husbandIncome || null,
        nafkahIddah: body.extractedData?.nafkahIddah || null,
        mutaah: body.extractedData?.mutaah || null,
        marriageDuration: body.extractedData?.marriageDuration || null,
        confidence: body.extractedData?.confidence || 0.85
      },
      extractedText: body.extractedText || 'Document processed successfully. Financial data extracted pending validation.',
      originalDocument: body.fileName || 'uploaded_document.pdf',
      pdfContent: {
        fileName: body.fileName || 'uploaded_document.pdf',
        uploadDate: new Date(),
        fileSize: body.fileSize || 'Unknown',
        pageCount: body.pageCount || 1,
        fullText: body.fullText || 'Full document text will be available after processing.',
        keyExtracts: {
          parties: body.keyExtracts?.parties || ['Processing...', 'Processing...'],
          courtDetails: body.keyExtracts?.courtDetails || 'Processing court details...',
          financialInfo: body.keyExtracts?.financialInfo || ['Processing financial information...'],
          awards: body.keyExtracts?.awards || ['Processing award details...']
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: newCase
    })
    
  } catch (error) {
    console.error('Case creation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create case',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}