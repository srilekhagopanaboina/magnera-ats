import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('MagneraAdmin2024!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@magnera.com' },
    update: {},
    create: {
      email: 'admin@magnera.com',
      name: 'Magnera Admin',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('Admin user created:', admin.email)

  const sampleApplicants = [
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      phone: '555-0101',
      addressStreet: '123 Main St',
      addressUnit: 'N/A',
      addressCity: 'Chicago',
      addressState: 'IL',
      addressZip: '60601',
      currentTitle: 'Senior Software Engineer',
      currentCompany: 'Tech Corp',
      yearsExperience: 6,
      skills: ['React', 'TypeScript', 'Node.js'],
      expectedSalary: 150000,
      workAuthorization: 'US_CITIZEN' as const,
      status: 'SCREENING' as const,
      jobTitle: 'Lead Software Engineer',
    },
    {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@example.com',
      phone: '555-0102',
      addressStreet: '456 Oak Ave',
      addressUnit: 'Apt 2C',
      addressCity: 'San Francisco',
      addressState: 'CA',
      addressZip: '94105',
      currentTitle: 'Product Manager',
      currentCompany: 'Startup Inc',
      yearsExperience: 4,
      skills: ['Product Strategy', 'Agile', 'Analytics'],
      expectedSalary: 130000,
      workAuthorization: 'H1B' as const,
      requiresSponsorship: true,
      status: 'INTERVIEW' as const,
      jobTitle: 'Senior Product Manager',
    },
    {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@example.com',
      addressStreet: '789 Elm Blvd',
      addressUnit: 'N/A',
      addressCity: 'Austin',
      addressState: 'TX',
      addressZip: '78701',
      currentTitle: 'Data Scientist',
      currentCompany: 'Analytics Co',
      yearsExperience: 3,
      skills: ['Python', 'Machine Learning', 'SQL'],
      expectedSalary: 120000,
      workAuthorization: 'OPT' as const,
      status: 'APPLIED' as const,
      jobTitle: 'Data Scientist',
    },
  ]

  for (const applicant of sampleApplicants) {
    await prisma.applicant.create({ data: applicant }).catch(() => {})
  }

  console.log('Sample applicants created')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
