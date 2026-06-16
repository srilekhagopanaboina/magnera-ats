import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'unknown'
  const { success } = checkRateLimit(`upload:${ip}`, 5, 60000)
  if (!success) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File | null
    const applicantId = formData.get('applicantId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and Word documents are allowed' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 })
    }

    const safeFileName = `resumes/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const blob = await put(safeFileName, file, {
      access: 'public',
      contentType: file.type,
    })

    if (applicantId) {
      await prisma.applicant.update({
        where: { id: applicantId },
        data: { resumeUrl: blob.url, resumeFileName: file.name },
      })
    }

    return NextResponse.json({ success: true, url: blob.url, fileName: file.name })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
