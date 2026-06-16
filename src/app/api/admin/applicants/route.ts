import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''
  const status = searchParams.get('status') ?? 'ALL'
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (status && status !== 'ALL') {
    where.status = status
  }

  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { currentTitle: { contains: query, mode: 'insensitive' } },
      { currentCompany: { contains: query, mode: 'insensitive' } },
      { jobTitle: { contains: query, mode: 'insensitive' } },
    ]
  }

  const [applicants, total] = await Promise.all([
    prisma.applicant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        currentTitle: true,
        currentCompany: true,
        yearsExperience: true,
        status: true,
        jobTitle: true,
        expectedSalary: true,
        workAuthorization: true,
        requiresSponsorship: true,
        resumeUrl: true,
        resumeFileName: true,
        skills: true,
        linkedinUrl: true,
        portfolioUrl: true,
      },
    }),
    prisma.applicant.count({ where }),
  ])

  return NextResponse.json({
    applicants,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}
