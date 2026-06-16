import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (status && status !== 'ALL') {
    where.status = status
  }

  const applicants = await prisma.applicant.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'ID', 'First Name', 'Last Name', 'Email', 'Phone',
    'LinkedIn', 'Portfolio', 'Current Title', 'Current Company',
    'Years Experience', 'Skills', 'Summary',
    'Current Salary', 'Expected Salary', 'Salary Negotiable',
    'Work Authorization', 'Requires Sponsorship',
    'Job Applied For', 'Status', 'Source',
    'Resume URL', 'Applied Date', 'Last Updated',
  ]

  const rows = applicants.map((a) => [
    a.id,
    a.firstName,
    a.lastName,
    a.email,
    a.phone,
    a.linkedinUrl,
    a.portfolioUrl,
    a.currentTitle,
    a.currentCompany,
    a.yearsExperience,
    a.skills.join('; '),
    a.summary,
    a.currentSalary,
    a.expectedSalary,
    a.salaryNegotiable ? 'Yes' : 'No',
    a.workAuthorization.replace(/_/g, ' '),
    a.requiresSponsorship ? 'Yes' : 'No',
    a.jobTitle,
    a.status,
    a.source,
    a.resumeUrl,
    format(new Date(a.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    format(new Date(a.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
  ])

  const csv = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n')

  const filename = `magnera-applicants-${format(new Date(), 'yyyy-MM-dd')}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
