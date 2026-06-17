import { z } from 'zod'

export const applicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  addressStreet: z.string().min(1, 'Street address is required').max(200),
  addressUnit: z.string().min(1, 'Unit / apartment number is required (enter N/A if not applicable)').max(50),
  addressCity: z.string().min(1, 'City is required').max(100),
  addressState: z.string().min(1, 'State / province is required').max(100),
  addressZip: z.string().min(1, 'ZIP / postal code is required').max(20),
  linkedinUrl: z.string().url('Valid LinkedIn URL required').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Valid portfolio URL required').optional().or(z.literal('')),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  skills: z.array(z.string()).optional(),
  summary: z.string().max(2000).optional(),
  currentSalary: z.number().int().min(0).optional(),
  expectedSalary: z.number().int().min(0).optional(),
  salaryNegotiable: z.boolean().default(true),
  workAuthorization: z.enum(['US_CITIZEN', 'PERMANENT_RESIDENT', 'H1B', 'OPT', 'CPT', 'TN', 'OTHER']),
  requiresSponsorship: z.boolean().default(false),
  jobTitle: z.string().optional(),
  source: z.string().optional(),
})

export type ApplicationInput = z.infer<typeof applicationSchema>

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
})

export const statusUpdateSchema = z.object({
  status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']),
  notes: z.string().optional(),
})

export const searchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'ALL']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})
