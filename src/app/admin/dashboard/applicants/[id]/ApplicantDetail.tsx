'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ApplicantWithHistory, ApplicationStatus, STATUS_LABELS, STATUS_COLORS, WORK_AUTH_LABELS } from '@/types'
import { useRouter } from 'next/navigation'

const ALL_STATUSES: ApplicationStatus[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']

export default function ApplicantDetail({ applicant: initialApplicant }: { applicant: ApplicantWithHistory }) {
  const router = useRouter()
  const [applicant, setApplicant] = useState(initialApplicant)
  const [newStatus, setNewStatus] = useState(applicant.status)
  const [statusNote, setStatusNote] = useState('')
  const [notes, setNotes] = useState(applicant.notes ?? '')
  const [updating, setUpdating] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [message, setMessage] = useState('')

  async function updateStatus() {
    if (newStatus === applicant.status && !statusNote) return
    setUpdating(true)
    setMessage('')
    try {
      const res = await fetch(`/api/admin/applicants/${applicant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: statusNote }),
      })
      if (res.ok) {
        const updated = await res.json()
        setApplicant(updated)
        setStatusNote('')
        setMessage('Status updated successfully')
        router.refresh()
      }
    } finally {
      setUpdating(false)
    }
  }

  async function saveNotes() {
    setSavingNotes(true)
    setMessage('')
    try {
      const res = await fetch(`/api/admin/applicants/${applicant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (res.ok) {
        setMessage('Notes saved')
        router.refresh()
      }
    } finally {
      setSavingNotes(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{applicant.firstName} {applicant.lastName}</h2>
              {applicant.currentTitle && (
                <p className="text-gray-500 mt-0.5">{applicant.currentTitle}{applicant.currentCompany ? ` at ${applicant.currentCompany}` : ''}</p>
              )}
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[applicant.status]}`}>
              {STATUS_LABELS[applicant.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" value={applicant.email} link={`mailto:${applicant.email}`} />
            <Field label="Phone" value={applicant.phone} link={applicant.phone ? `tel:${applicant.phone}` : undefined} />
            <Field label="LinkedIn" value={applicant.linkedinUrl ? 'View Profile' : undefined} link={applicant.linkedinUrl ?? undefined} />
            <Field label="Portfolio" value={applicant.portfolioUrl ? 'View Portfolio' : undefined} link={applicant.portfolioUrl ?? undefined} />
            <Field label="Years of Experience" value={applicant.yearsExperience !== null && applicant.yearsExperience !== undefined ? `${applicant.yearsExperience} years` : undefined} />
            <Field label="Applied For" value={applicant.jobTitle} />
            <Field label="Current Salary" value={applicant.currentSalary ? `$${applicant.currentSalary.toLocaleString()}` : undefined} />
            <Field label="Expected Salary" value={applicant.expectedSalary ? `$${applicant.expectedSalary.toLocaleString()}` : undefined} />
            <Field label="Salary Negotiable" value={applicant.salaryNegotiable ? 'Yes' : 'No'} />
            <Field label="Work Authorization" value={WORK_AUTH_LABELS[applicant.workAuthorization]} />
            <Field label="Requires Sponsorship" value={applicant.requiresSponsorship ? 'Yes' : 'No'} />
            <Field label="Applied On" value={format(new Date(applicant.createdAt), 'MMMM d, yyyy')} />
          </div>

          {applicant.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {applicant.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {applicant.summary && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Summary</p>
              <p className="text-gray-700 text-sm leading-relaxed">{applicant.summary}</p>
            </div>
          )}

          {applicant.resumeUrl && (
            <div className="mt-4 flex gap-3">
              <a
                href={applicant.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Resume
              </a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Internal Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add internal notes about this candidate..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            {message && <p className="text-sm text-green-600">{message}</p>}
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="ml-auto px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition text-sm font-medium"
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white mb-3"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <textarea
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            rows={2}
            placeholder="Add note (optional)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none mb-3"
          />
          <button
            onClick={updateStatus}
            disabled={updating || (newStatus === applicant.status && !statusNote)}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm font-semibold"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Status History</h3>
          <div className="space-y-3">
            {applicant.statusHistory.map((history) => (
              <div key={history.id} className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[history.status]}`}>
                      {STATUS_LABELS[history.status]}
                    </span>
                  </div>
                  {history.notes && <p className="text-xs text-gray-500 mt-0.5">{history.notes}</p>}
                  {history.changedBy && <p className="text-xs text-gray-400">by {history.changedBy}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(history.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, link }: { label: string; value?: string | null; link?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-0.5 block">
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-900 mt-0.5">{value}</p>
      )}
    </div>
  )
}
