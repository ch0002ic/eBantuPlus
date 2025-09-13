import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse, CaseStatus } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as CaseStatus | null
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = status ? { status } : {}

    const cases = await prisma.case.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        validations: {
          include: {
            validator: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      take: limit,
      skip: offset,
    })

    const total = await prisma.case.count({ where })

    const response: ApiResponse = {
      success: true,
      data: {
        cases,
        total,
        limit,
        offset,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cases',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, fileUrl, fileName, fileSize, uploadedById, caseNumber } = body

    // Validate required fields
    if (!title || !fileUrl || !fileName || !fileSize || !uploadedById) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'title, fileUrl, fileName, fileSize, and uploadedById are required'
        },
        { status: 400 }
      )
    }

    const newCase = await prisma.case.create({
      data: {
        title,
        fileUrl,
        fileName,
        fileSize,
        uploadedById,
        caseNumber,
        status: CaseStatus.UPLOADED,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    const response: ApiResponse = {
      success: true,
      data: newCase,
      message: 'Case uploaded successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating case:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create case',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}