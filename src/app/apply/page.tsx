import type { Metadata } from 'next'
import ApplicationForm from '@/components/ApplicationForm'

export const metadata: Metadata = {
  title: 'Apply | Magnera Corporation',
  description: 'Submit your application to join the Magnera Corporation team.',
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Magnera Corporation</h1>
              <p className="text-sm text-gray-500">Careers Portal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Join Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We&apos;re always looking for talented individuals to join the Magnera Corporation family.
            Fill out the form below to apply.
          </p>
        </div>

        <ApplicationForm />
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Magnera Corporation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
