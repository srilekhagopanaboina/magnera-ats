'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import FileUpload from './FileUpload'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  jobTitle: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  yearsExperience: z.string().optional(),
  skills: z.string().optional(),
  summary: z.string().max(2000, 'Maximum 2000 characters').optional(),
  currentSalary: z.string().optional(),
  expectedSalary: z.string().optional(),
  salaryNegotiable: z.boolean().optional(),
  workAuthorization: z.enum(['US_CITIZEN', 'PERMANENT_RESIDENT', 'H1B', 'OPT', 'CPT', 'TN', 'OTHER']),
  requiresSponsorship: z.boolean().optional(),
  source: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const SECTIONS = ['Personal Info', 'Professional', 'Compensation', 'Work Authorization']

export default function ApplicationForm() {
  const router = useRouter()
  const [section, setSection] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const [applicantId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      workAuthorization: 'US_CITIZEN',
      salaryNegotiable: true,
      requiresSponsorship: false,
    },
  })

  const sectionFields: Record<number, (keyof FormData)[]> = {
    0: ['firstName', 'lastName', 'email', 'phone', 'linkedinUrl', 'portfolioUrl'],
    1: ['jobTitle', 'currentTitle', 'currentCompany', 'yearsExperience', 'skills', 'summary'],
    2: ['currentSalary', 'expectedSalary', 'salaryNegotiable'],
    3: ['workAuthorization', 'requiresSponsorship'],
  }

  async function handleNext() {
    const valid = await trigger(sectionFields[section])
    if (valid) setSection((s) => s + 1)
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        ...data,
        yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) : undefined,
        currentSalary: data.currentSalary ? parseInt(data.currentSalary.replace(/,/g, '')) : undefined,
        expectedSalary: data.expectedSalary ? parseInt(data.expectedSalary.replace(/,/g, '')) : undefined,
        skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        linkedinUrl: data.linkedinUrl || undefined,
        portfolioUrl: data.portfolioUrl || undefined,
      }

      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Failed to submit application')
        setSubmitting(false)
        return
      }

      router.push('/apply/success')
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  const progressPct = (section / SECTIONS.length) * 100

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          {SECTIONS.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => i < section && setSection(i)}
              className={`flex items-center gap-2 text-sm font-medium transition ${
                i === section ? 'text-blue-600' : i < section ? 'text-green-600 cursor-pointer' : 'text-gray-400'
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i === section ? 'bg-blue-600 text-white' : i < section ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < section ? '✓' : i + 1}
              </span>
              <span className="hidden sm:block">{name}</span>
            </button>
          ))}
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full">
          <div
            className="h-1.5 bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-8">
          {section === 0 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="First Name *" error={errors.firstName?.message}>
                  <input {...register('firstName')} placeholder="John" className={inputClass(!!errors.firstName)} />
                </FormField>
                <FormField label="Last Name *" error={errors.lastName?.message}>
                  <input {...register('lastName')} placeholder="Doe" className={inputClass(!!errors.lastName)} />
                </FormField>
              </div>
              <FormField label="Email Address *" error={errors.email?.message}>
                <input {...register('email')} type="email" placeholder="john@example.com" className={inputClass(!!errors.email)} />
              </FormField>
              <FormField label="Phone Number" error={errors.phone?.message}>
                <input {...register('phone')} type="tel" placeholder="+1 (555) 000-0000" className={inputClass(!!errors.phone)} />
              </FormField>
              <FormField label="LinkedIn Profile URL" error={errors.linkedinUrl?.message}>
                <input {...register('linkedinUrl')} placeholder="https://linkedin.com/in/yourprofile" className={inputClass(!!errors.linkedinUrl)} />
              </FormField>
              <FormField label="Portfolio / Website URL" error={errors.portfolioUrl?.message}>
                <input {...register('portfolioUrl')} placeholder="https://yourportfolio.com" className={inputClass(!!errors.portfolioUrl)} />
              </FormField>
            </div>
          )}

          {section === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Background</h3>
              <FormField label="Position Applying For" error={errors.jobTitle?.message}>
                <input {...register('jobTitle')} placeholder="e.g. Senior Software Engineer" className={inputClass(!!errors.jobTitle)} />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Current Job Title" error={errors.currentTitle?.message}>
                  <input {...register('currentTitle')} placeholder="Software Engineer" className={inputClass(!!errors.currentTitle)} />
                </FormField>
                <FormField label="Current Company" error={errors.currentCompany?.message}>
                  <input {...register('currentCompany')} placeholder="Acme Corp" className={inputClass(!!errors.currentCompany)} />
                </FormField>
              </div>
              <FormField label="Years of Experience" error={errors.yearsExperience?.message}>
                <select {...register('yearsExperience')} className={inputClass(!!errors.yearsExperience)}>
                  <option value="">Select...</option>
                  <option value="0">Less than 1 year</option>
                  <option value="1">1 year</option>
                  <option value="2">2 years</option>
                  <option value="3">3 years</option>
                  <option value="4">4 years</option>
                  <option value="5">5 years</option>
                  <option value="6">6 years</option>
                  <option value="7">7 years</option>
                  <option value="8">8 years</option>
                  <option value="9">9 years</option>
                  <option value="10">10+ years</option>
                </select>
              </FormField>
              <FormField label="Skills (comma-separated)" error={errors.skills?.message}>
                <input {...register('skills')} placeholder="React, TypeScript, Node.js, Python..." className={inputClass(!!errors.skills)} />
              </FormField>
              <FormField label="Professional Summary" error={errors.summary?.message}>
                <textarea
                  {...register('summary')}
                  rows={4}
                  placeholder="Brief summary of your experience and what you're looking for..."
                  className={inputClass(!!errors.summary) + ' resize-none'}
                />
              </FormField>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Resume / CV</p>
                <FileUpload
                  onUpload={({ fileName }) => {
                    setResumeFileName(fileName)
                  }}
                  applicantId={applicantId ?? undefined}
                />
                {resumeFileName && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <span>✓</span> {resumeFileName} uploaded
                  </p>
                )}
              </div>
            </div>
          )}

          {section === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Compensation Expectations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Current Salary (USD/year)" error={errors.currentSalary?.message}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input {...register('currentSalary')} type="number" min="0" placeholder="120000" className={`${inputClass(!!errors.currentSalary)} pl-7`} />
                  </div>
                </FormField>
                <FormField label="Expected Salary (USD/year)" error={errors.expectedSalary?.message}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input {...register('expectedSalary')} type="number" min="0" placeholder="150000" className={`${inputClass(!!errors.expectedSalary)} pl-7`} />
                  </div>
                </FormField>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  {...register('salaryNegotiable')}
                  type="checkbox"
                  id="salaryNegotiable"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="salaryNegotiable" className="text-sm font-medium text-gray-700">
                  Salary is negotiable
                </label>
              </div>
              <FormField label="How did you hear about us?" error={errors.source?.message}>
                <select {...register('source')} className={inputClass(!!errors.source)}>
                  <option value="">Select source...</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Indeed">Indeed</option>
                  <option value="Glassdoor">Glassdoor</option>
                  <option value="Referral">Employee Referral</option>
                  <option value="Company Website">Company Website</option>
                  <option value="Job Fair">Job Fair</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>
            </div>
          )}

          {section === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Work Authorization</h3>
              <FormField label="Work Authorization Status *" error={errors.workAuthorization?.message}>
                <select {...register('workAuthorization')} className={inputClass(!!errors.workAuthorization)}>
                  <option value="US_CITIZEN">U.S. Citizen</option>
                  <option value="PERMANENT_RESIDENT">Permanent Resident (Green Card)</option>
                  <option value="H1B">H-1B Visa</option>
                  <option value="OPT">OPT (Optional Practical Training)</option>
                  <option value="CPT">CPT (Curricular Practical Training)</option>
                  <option value="TN">TN Visa (Canada/Mexico)</option>
                  <option value="OTHER">Other</option>
                </select>
              </FormField>
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <input
                  {...register('requiresSponsorship')}
                  type="checkbox"
                  id="requiresSponsorship"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="requiresSponsorship" className="text-sm font-medium text-amber-800">
                  I will require visa sponsorship now or in the future
                </label>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Equal Opportunity Employer:</strong> Magnera Corporation is committed to creating a diverse environment and is proud to be an equal opportunity employer. All qualified applicants will receive consideration for employment.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="px-8 pb-8 flex justify-between">
          {section > 0 ? (
            <button
              type="button"
              onClick={() => setSection((s) => s - 1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {section < SECTIONS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm ${
    hasError ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
  }`
}
