import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/types/api'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params

    // Check if case exists
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId }
    })

    if (!existingCase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Case not found',
          message: `Case with ID ${caseId} does not exist`
        },
        { status: 404 }
      )
    }

    // Delete the case
    await prisma.case.delete({
      where: { id: caseId }
    })

    const response: ApiResponse = {
      success: true,
      message: 'Case deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting case:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete case',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
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

    if (!caseData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Case not found',
          message: `Case with ID ${caseId} does not exist`
        },
        { status: 404 }
      )
    }

    const response: ApiResponse = {
      success: true,
      data: caseData,
      message: 'Case retrieved successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching case:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch case',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const body = await request.json()

    // Check if case exists
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId }
    })

    if (!existingCase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Case not found',
          message: `Case with ID ${caseId} does not exist`
        },
        { status: 404 }
      )
    }

    // Update the case
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: body,
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
      data: updatedCase,
      message: 'Case updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating case:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update case',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}