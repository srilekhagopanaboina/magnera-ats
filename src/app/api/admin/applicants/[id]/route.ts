import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { statusUpdateSchema } from '@/lib/validations'
import { sendStatusUpdateEmail } from '@/lib/email'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
  })

  if (!applicant) {
    return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
  }

  return NextResponse.json(applicant)
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const body = await request.json()

  if (body.status) {
    const parsed = statusUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const applicant = await prisma.applicant.findUnique({ where: { id } })
    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    const updated = await prisma.applicant.update({
      where: { id },
      data: {
        status: parsed.data.status,
        notes: body.notes !== undefined ? body.notes : applicant.notes,
        statusHistory: {
          create: {
            status: parsed.data.status,
            changedBy: session.user.email ?? 'Admin',
            notes: parsed.data.notes,
          },
        },
      },
      include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
    })

    if (parsed.data.status !== applicant.status) {
      await sendStatusUpdateEmail({
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        status: parsed.data.status,
      })
    }

    return NextResponse.json(updated)
  }

  const allowedFields = ['notes', 'jobTitle', 'source']
  const updateData: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) updateData[field] = body[field]
  }

  const updated = await prisma.applicant.update({
    where: { id },
    data: updateData,
    include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  await prisma.applicant.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
