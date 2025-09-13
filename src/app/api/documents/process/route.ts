/**
 * Document Processing API Endpoint
 * 
 * Handles document upload, processing, and validation for eBantu+ legal automation.
 * Integrates with the advanced document processing pipeline.
 */

import { NextRequest, NextResponse } from 'next/server'
import { documentProcessor } from '@/lib/document-processor'
import { z } from 'zod'

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