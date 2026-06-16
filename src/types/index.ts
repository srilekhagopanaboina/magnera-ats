export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'

export type WorkAuthorization =
  | 'US_CITIZEN'
  | 'PERMANENT_RESIDENT'
  | 'H1B'
  | 'OPT'
  | 'CPT'
  | 'TN'
  | 'OTHER'

export interface Applicant {
  id: string
  createdAt: string
  updatedAt: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  linkedinUrl?: string | null
  portfolioUrl?: string | null
  currentTitle?: string | null
  currentCompany?: string | null
  yearsExperience?: number | null
  skills: string[]
  summary?: string | null
  currentSalary?: number | null
  expectedSalary?: number | null
  salaryNegotiable: boolean
  workAuthorization: WorkAuthorization
  requiresSponsorship: boolean
  availableStartDate?: string | null
  resumeUrl?: string | null
  resumeFileName?: string | null
  status: ApplicationStatus
  jobTitle?: string | null
  source?: string | null
  notes?: string | null
}

export interface StatusHistory {
  id: string
  applicantId: string
  status: ApplicationStatus
  changedBy?: string | null
  notes?: string | null
  createdAt: string
}

export interface ApplicantWithHistory extends Applicant {
  statusHistory: StatusHistory[]
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: 'bg-blue-100 text-blue-800',
  SCREENING: 'bg-yellow-100 text-yellow-800',
  INTERVIEW: 'bg-purple-100 text-purple-800',
  OFFER: 'bg-green-100 text-green-800',
  HIRED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export const WORK_AUTH_LABELS: Record<WorkAuthorization, string> = {
  US_CITIZEN: 'U.S. Citizen',
  PERMANENT_RESIDENT: 'Permanent Resident',
  H1B: 'H-1B Visa',
  OPT: 'OPT',
  CPT: 'CPT',
  TN: 'TN Visa',
  OTHER: 'Other',
}
