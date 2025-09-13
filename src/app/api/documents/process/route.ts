/**
 * Document Processing API Endpoint
 * 
 * Handles document upload, processing, and validation for eBantu+ legal automation.
 * Integrates with the advanced document processing pipeline.
 */

import { NextRequest, NextResponse } from 'next/server'
import { documentProcessor } from '@/lib/document-processor'
import { z } from 'zod'
import { prisma } from '@/lib/db'

// Request validation schema
const ProcessDocumentSchema = z.object({
  enableOCR: z.boolean().optional().default(true),
  enableAI: z.boolean().optional().default(true),
  templateMatching: z.boolean().optional().default(true),
  strictValidation: z.boolean().optional().default(false)
})

/**
 * POST /api/documents/process
 * Process uploaded document and extract legal data
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const options = formData.get('options') ? 
      JSON.parse(formData.get('options') as string) : {}

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Supported types: PDF, DOCX, TXT, JPG, PNG' },
        { status: 400 }
      )
    }

    // Validate processing options
    const validatedOptions = ProcessDocumentSchema.parse(options)

    // Process document
    const startTime = Date.now()
    const processedDocument = await documentProcessor.processDocument(file, validatedOptions)
    const processingTime = Date.now() - startTime

    // Log processing metrics
    console.log('Document processed:', {
      fileName: processedDocument.fileName,
      fileSize: processedDocument.fileSize,
      processingTime,
      confidence: processedDocument.confidence.overall,
      extractedFields: Object.keys(processedDocument.extractedData).length,
      validationFlags: processedDocument.validationFlags.length
    })

    // Get form data for case creation
    const title = formData.get('title') as string || processedDocument.fileName
    const caseNumber = formData.get('caseNumber') as string || ''

    // Create or get default LAB officer user
    let user = await prisma.user.findFirst({
      where: { email: 'lab.officer@ebantu.sg' }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'lab.officer@ebantu.sg',
          name: 'LAB Officer',
          role: 'LAB_OFFICER'
        }
      })
    }

    // Create case in database
    const newCase = await prisma.case.create({
      data: {
        title,
        caseNumber: caseNumber || null,
        fileUrl: `/uploads/${processedDocument.fileName}`, // Demo file storage path
        fileName: processedDocument.fileName,
        fileSize: processedDocument.fileSize,
        status: 'EXTRACTED',
        husbandIncome: processedDocument.extractedData.husbandIncome || null,
        nafkahIddah: processedDocument.extractedData.nafkahIddahAmount || null,
        mutaah: processedDocument.extractedData.mutaahAmount || null,
        marriageDuration: processedDocument.extractedData.marriageDuration || null,
        extractedText: `Case: ${processedDocument.extractedData.caseNumber || 'N/A'}\nHusband: ${processedDocument.extractedData.husbandName || 'N/A'}\nWife: ${processedDocument.extractedData.wifeName || 'N/A'}\nIncome: $${processedDocument.extractedData.husbandIncome || 0}\nNafkah Iddah: $${processedDocument.extractedData.nafkahIddahAmount || 0}\nMutaah: $${processedDocument.extractedData.mutaahAmount || 0}`,
        aiExtraction: {
          extractedData: processedDocument.extractedData,
          metadata: processedDocument.metadata,
          confidence: processedDocument.confidence,
          validationFlags: processedDocument.validationFlags
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        confidence: processedDocument.confidence.overall,
        isConsentOrder: processedDocument.extractedData.isConsentOrder || false,
        isHighIncome: (processedDocument.extractedData.husbandIncome || 0) > 5000,
        isOutlier: processedDocument.confidence.overall < 0.7,
        uploadedById: user.id
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('Case created in database:', newCase.id)

        // Return processed document with additional metadata
    return NextResponse.json({
      success: true,
      document: {
        ...processedDocument,
        processingTime,
        api: {
          version: '2.0',
          timestamp: new Date().toISOString(),
          processingNode: 'primary'
        }
      },
      case: {
        id: newCase.id,
        title: newCase.title,
        caseNumber: newCase.caseNumber,
        status: newCase.status,
        uploadedBy: newCase.uploadedBy
      }
    })

  } catch (error) {
    console.error('Document processing error:', error)
    
    return NextResponse.json(
      { 
        error: 'Document processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}