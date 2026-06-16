import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const stats = await prisma.$transaction([
    prisma.applicant.count(),
    prisma.applicant.count({ where: { status: 'APPLIED' } }),
    prisma.applicant.count({ where: { status: 'SCREENING' } }),
    prisma.applicant.count({ where: { status: 'INTERVIEW' } }),
    prisma.applicant.count({ where: { status: 'OFFER' } }),
    prisma.applicant.count({ where: { status: 'HIRED' } }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Magnera ATS</h1>
                <p className="text-xs text-gray-500">Applicant Tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">{session.user?.email}</span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Applicant Dashboard</h2>
          <p className="text-gray-500 mt-1">Manage and track all job applications</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', value: stats[0], color: 'bg-gray-100 text-gray-900' },
            { label: 'Applied', value: stats[1], color: 'bg-blue-100 text-blue-900' },
            { label: 'Screening', value: stats[2], color: 'bg-yellow-100 text-yellow-900' },
            { label: 'Interview', value: stats[3], color: 'bg-purple-100 text-purple-900' },
            { label: 'Offer', value: stats[4], color: 'bg-green-100 text-green-900' },
            { label: 'Hired', value: stats[5], color: 'bg-emerald-100 text-emerald-900' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl p-4 ${color}`}>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>

        <DashboardClient />
      </main>
    </div>
  )
}
