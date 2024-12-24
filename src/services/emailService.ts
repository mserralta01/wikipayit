import { apiSettingsService } from './apiSettingsService'

interface EmailData {
  to: string
  subject: string
  content: string
}

export const emailService = {
  async validateSettings(): Promise<boolean> {
    try {
      const settings = await apiSettingsService.getSettings();
      console.log('Validating SendGrid settings:', {
        enabled: settings?.sendgrid?.enabled,
        hasApiKey: !!settings?.sendgrid?.apiKey,
        hasFromEmail: !!settings?.sendgrid?.fromEmail
      });
      return !!(settings?.sendgrid?.enabled && settings?.sendgrid?.apiKey && settings?.sendgrid?.fromEmail);
    } catch (error) {
      console.error('Error validating SendGrid settings:', error);
      return false;
    }
  },

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const settings = await apiSettingsService.getSettings();
      console.log('SendGrid settings:', {
        enabled: settings?.sendgrid?.enabled,
        hasApiKey: !!settings?.sendgrid?.apiKey,
        fromEmail: settings?.sendgrid?.fromEmail
      });

      if (!settings?.sendgrid?.enabled || !settings?.sendgrid?.apiKey || !settings?.sendgrid?.fromEmail) {
        throw new Error('SendGrid is not configured');
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
      });

      console.log('SendGrid API response:', response.status);
      return response.ok;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  },

  async sendTestEmail(toEmail: string): Promise<boolean> {
    return this.sendEmail({
      to: toEmail,
      subject: 'WikiPayIt Test Email',
      content: 'This is a test email from WikiPayIt. If you received this email, your SendGrid configuration is working correctly.'
    })
  }
}
