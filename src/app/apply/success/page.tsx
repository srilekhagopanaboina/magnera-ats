import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Application Submitted | Magnera Corporation',
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-3xl shadow-lg p-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
          <p className="text-gray-600 text-lg mb-6">
            Thank you for applying to Magnera Corporation. We&apos;ve received your application and
            will review it carefully.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
            <p className="font-semibold text-gray-800 mb-2">What happens next?</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>You&apos;ll receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">◷</span>
                <span>Our team will review your application within 1-3 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">📞</span>
                <span>If selected, we&apos;ll reach out to schedule a screening call</span>
              </li>
            </ul>
          </div>
          <Link
            href="/"
            className="inline-block text-blue-600 hover:text-blue-700 font-medium transition"
          >
            Submit another application
          </Link>
        </div>
      </div>
    </div>
  )
}
