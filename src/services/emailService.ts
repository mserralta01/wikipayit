import { apiSettingsService } from './apiSettingsService'
import { sendgridService } from './sendgridService'

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

      if (!settings?.sendgrid?.enabled || !settings?.sendgrid?.apiKey || !settings?.sendgrid?.fromEmail) {
        return false;
      }

      return await sendgridService.validateApiKey(settings.sendgrid.apiKey, settings.sendgrid.fromEmail);
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

      console.log('Sending email via SendGrid:', {
        to: data.to,
        fromEmail: settings.sendgrid.fromEmail,
        subject: data.subject,
        timestamp: new Date().toISOString()
      });

      const success = await sendgridService.sendEmail({
        to: data.to,
        from: settings.sendgrid.fromEmail,
        subject: data.subject,
        content: data.content,
        apiKey: settings.sendgrid.apiKey
      });

      console.log('SendGrid email result:', {
        success,
        timestamp: new Date().toISOString()
      });

      return success;
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
