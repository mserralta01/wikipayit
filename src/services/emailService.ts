import { apiSettingsService } from './apiSettingsService'

interface EmailData {
  to: string
  subject: string
  content: string
}

export const emailService = {
  async validateSettings(): Promise<boolean> {
    const settings = await apiSettingsService.getSettings()
    return !!(settings?.sendgrid?.enabled && settings?.sendgrid?.apiKey && settings?.sendgrid?.fromEmail)
  },

  async sendEmail(data: EmailData): Promise<boolean> {
    const settings = await apiSettingsService.getSettings()
    if (!settings?.sendgrid?.enabled || !settings?.sendgrid?.apiKey || !settings?.sendgrid?.fromEmail) {
      throw new Error('SendGrid is not configured')
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.sendgrid.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: data.to }] }],
        from: { email: settings.sendgrid.fromEmail },
        subject: data.subject,
        content: [{ type: 'text/plain', value: data.content }]
      })
    })

    return response.ok
  },

  async sendTestEmail(toEmail: string): Promise<boolean> {
    return this.sendEmail({
      to: toEmail,
      subject: 'WikiPayIt Test Email',
      content: 'This is a test email from WikiPayIt. If you received this email, your SendGrid configuration is working correctly.'
    })
  }
}
