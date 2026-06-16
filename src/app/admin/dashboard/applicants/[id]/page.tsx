import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ApplicantDetail from './ApplicantDetail'

export default async function ApplicantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
  })

  if (!applicant) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-bold text-gray-900">{applicant.firstName} {applicant.lastName}</h1>
              <p className="text-xs text-gray-500">{applicant.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApplicantDetail applicant={JSON.parse(JSON.stringify(applicant))} />
      </main>
    </div>
  )
}
