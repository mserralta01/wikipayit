import { apiSettingsService, APISettings } from './apiSettingsService'

interface SendEmailParams {
  to: string
  subject: string
  content: string
}

interface SendGridResponse {
  ok: boolean
  status: number
  statusText: string
}

export const emailService = {
  async validateSettings(): Promise<NonNullable<APISettings['sendgrid']>> {
    const settings = await apiSettingsService.getSettings()
    if (!settings?.sendgrid?.enabled || !settings?.sendgrid?.apiKey || !settings?.sendgrid?.fromEmail) {
      throw new Error('SendGrid is not properly configured')
    }
    return settings.sendgrid
  },

  async sendEmail({ to, subject, content }: SendEmailParams): Promise<SendGridResponse> {
    const settings = await this.validateSettings()

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: settings.fromEmail },
          subject,
          content: [{
            type: 'text/plain',
            value: content
          }]
        })
      })

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return {
        ok: false,
        status: 500,
        statusText: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  },

  async sendTestEmail(toEmail: string): Promise<SendGridResponse> {
    return this.sendEmail({
      to: toEmail,
      subject: 'WikiPayIt Test Email',
      content: 'This is a test email from WikiPayIt. If you received this email, your SendGrid configuration is working correctly.'
    })
  }
}
