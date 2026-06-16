import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { applicationSchema } from '@/lib/validations'
import { sendApplicationConfirmation, sendNewApplicationAlert } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'unknown'
  const { success } = checkRateLimit(`apply:${ip}`, 3, 60000)
  if (!success) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const parsed = applicationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const applicant = await prisma.applicant.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? null,
        linkedinUrl: data.linkedinUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        currentTitle: data.currentTitle ?? null,
        currentCompany: data.currentCompany ?? null,
        yearsExperience: data.yearsExperience ?? null,
        skills: data.skills ?? [],
        summary: data.summary ?? null,
        currentSalary: data.currentSalary ?? null,
        expectedSalary: data.expectedSalary ?? null,
        salaryNegotiable: data.salaryNegotiable,
        workAuthorization: data.workAuthorization,
        requiresSponsorship: data.requiresSponsorship,
        jobTitle: data.jobTitle ?? null,
        source: data.source ?? null,
        statusHistory: {
          create: {
            status: 'APPLIED',
            notes: 'Application submitted',
          },
        },
      },
    })

    await Promise.all([
      sendApplicationConfirmation({ firstName: applicant.firstName, lastName: applicant.lastName, email: applicant.email, jobTitle: applicant.jobTitle }),
      sendNewApplicationAlert({ firstName: applicant.firstName, lastName: applicant.lastName, email: applicant.email, jobTitle: applicant.jobTitle, id: applicant.id }),
    ])

    return NextResponse.json({ success: true, id: applicant.id }, { status: 201 })
  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
