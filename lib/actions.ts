'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { InspectionStatus, DocumentType, DocumentStatus } from '@prisma/client'
import { generateAviationPDF } from './pdf-generator'
import fs from 'fs/promises'
import path from 'path'

export async function createInspection(balloonSerialNumber: string) {
  // Check if there's already an open inspection
  const openInspection = await prisma.annualInspection.findFirst({
    where: {
      balloonSerialNumber,
      status: { not: 'CLOSED' }
    }
  })

  if (openInspection) {
    throw new Error('An inspection is already open for this balloon.')
  }

  const inspection = await prisma.annualInspection.create({
    data: {
      balloonSerialNumber,
      status: 'DRAFT',
    }
  })

  revalidatePath(`/balloons/${balloonSerialNumber}`)
  redirect(`/inspections/${inspection.id}`)
}

export async function uploadWorkOrder(inspectionId: string, filePath: string) {
  await prisma.annualInspection.update({
    where: { id: inspectionId },
    data: { 
      workOrderFile: filePath,
    }
  })
  
  revalidatePath(`/inspections/${inspectionId}`)
}

export async function generateSupportingDocuments(inspectionId: string) {
  const inspection = await prisma.annualInspection.findUnique({
    where: { id: inspectionId },
    include: { balloon: true }
  })
  
  if (!inspection) throw new Error('Inspection not found')

  const types: DocumentType[] = ['TR', 'DR', 'DDL', 'ML']
  
  for (const type of types) {
    const pdfBuffer = await generateAviationPDF(type, inspection.balloon)
    const fileName = `${type}-${inspectionId}.pdf`
    const filePath = path.join(process.cwd(), 'public', 'generated-docs', fileName)
    
    await fs.writeFile(filePath, Buffer.from(pdfBuffer))

    await prisma.document.upsert({
      where: { 
        annualInspectionId_documentType: {
          annualInspectionId: inspectionId,
          documentType: type
        }
      },
      update: {
        status: 'GENERATED',
        generatedAt: new Date(),
        filePath: `/generated-docs/${fileName}`
      },
      create: {
        annualInspectionId: inspectionId,
        documentType: type,
        status: 'GENERATED',
        filePath: `/generated-docs/${fileName}`
      }
    })
  }

  await prisma.annualInspection.update({
    where: { id: inspectionId },
    data: { status: 'DOCUMENTS_GENERATED' }
  })

  revalidatePath(`/inspections/${inspectionId}`)
}

export async function markAsSigned(inspectionId: string, documentType: DocumentType) {
  await prisma.document.update({
    where: {
      annualInspectionId_documentType: {
        annualInspectionId: inspectionId,
        documentType: documentType
      }
    },
    data: {
      status: 'SIGNED',
      signedAt: new Date()
    }
  })

  // Check if all supporting docs are signed to potentially update inspection status
  const docs = await prisma.document.findMany({
    where: { annualInspectionId: inspectionId }
  })
  
  const supportingTypes: DocumentType[] = ['TR', 'DR', 'DDL', 'ML']
  const allSigned = supportingTypes.every(type => 
    docs.find(d => d.documentType === type && d.status === 'SIGNED')
  )

  if (allSigned) {
    await prisma.annualInspection.update({
      where: { id: inspectionId },
      data: { status: 'SIGNED' }
    })
  }

  revalidatePath(`/inspections/${inspectionId}`)
}

export async function finalizeInspection(inspectionId: string) {
  await prisma.annualInspection.update({
    where: { id: inspectionId },
    data: { 
      status: 'CLOSED',
      closedAt: new Date()
    }
  })

  revalidatePath(`/inspections/${inspectionId}`)
}
