import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? 're_placeholder')
  return _resend
}

const FROM_EMAIL = 'noreply@magnera.com'
const ADMIN_EMAIL = 'admin@magnera.com'
const COMPANY_NAME = 'Magnera Corporation'

export async function sendApplicationConfirmation(applicant: {
  firstName: string
  lastName: string
  email: string
  jobTitle?: string | null
}) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: applicant.email,
      subject: `Application Received - ${COMPANY_NAME}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e40af; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${COMPANY_NAME}</h1>
          </div>
          <div style="padding: 32px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Application Received!</h2>
            <p style="color: #475569; font-size: 16px;">Dear ${applicant.firstName} ${applicant.lastName},</p>
            <p style="color: #475569; font-size: 16px;">
              Thank you for applying${applicant.jobTitle ? ` for the <strong>${applicant.jobTitle}</strong> position` : ''} at ${COMPANY_NAME}.
              We have received your application and will review it carefully.
            </p>
            <p style="color: #475569; font-size: 16px;">
              Our team will be in touch with you regarding next steps.
              We appreciate your interest in joining our team!
            </p>
            <div style="background: white; border-left: 4px solid #1e40af; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #1e293b; margin: 0; font-size: 14px;"><strong>What happens next?</strong></p>
              <ul style="color: #475569; font-size: 14px; margin: 8px 0 0 0;">
                <li>Our team reviews your application (1-3 business days)</li>
                <li>If selected, we'll contact you for an initial screening</li>
                <li>Final interviews with the team</li>
              </ul>
            </div>
            <p style="color: #94a3b8; font-size: 14px;">
              If you have questions, please reply to this email.
            </p>
            <p style="color: #475569;">Best regards,<br><strong>The ${COMPANY_NAME} Team</strong></p>
          </div>
          <div style="padding: 16px; text-align: center; background: #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
  }
}

export async function sendNewApplicationAlert(applicant: {
  firstName: string
  lastName: string
  email: string
  jobTitle?: string | null
  id: string
}) {
  try {
    const adminUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Application: ${applicant.firstName} ${applicant.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e40af; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Application Received</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #475569;">A new application has been submitted:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 40%;">Name</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600;">${applicant.firstName} ${applicant.lastName}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${applicant.email}</td></tr>
              ${applicant.jobTitle ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Position</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${applicant.jobTitle}</td></tr>` : ''}
            </table>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${adminUrl}/admin/dashboard/applicants/${applicant.id}"
                 style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                View Application
              </a>
            </div>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send admin alert email:', error)
  }
}

export async function sendStatusUpdateEmail(applicant: {
  firstName: string
  lastName: string
  email: string
  status: string
}) {
  const statusMessages: Record<string, string> = {
    SCREENING: 'Your application is being reviewed by our team.',
    INTERVIEW: 'Congratulations! We would like to invite you for an interview. Our team will reach out shortly to schedule.',
    OFFER: 'Congratulations! We are pleased to extend an offer to you. Our team will be in touch with details.',
    HIRED: 'Welcome to the team! We are thrilled to have you join us at Magnera Corporation.',
    REJECTED: 'After careful consideration, we have decided to move forward with other candidates. We appreciate your interest and encourage you to apply for future positions.',
  }

  const message = statusMessages[applicant.status]
  if (!message) return

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: applicant.email,
      subject: `Application Update - ${COMPANY_NAME}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e40af; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${COMPANY_NAME}</h1>
          </div>
          <div style="padding: 32px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Application Status Update</h2>
            <p style="color: #475569; font-size: 16px;">Dear ${applicant.firstName} ${applicant.lastName},</p>
            <p style="color: #475569; font-size: 16px;">${message}</p>
            <p style="color: #475569;">Best regards,<br><strong>The ${COMPANY_NAME} Team</strong></p>
          </div>
          <div style="padding: 16px; text-align: center; background: #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send status update email:', error)
  }
}
