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

      const requestBody = {
        personalizations: [{ to: [{ email: data.to }] }],
        from: { email: settings.sendgrid.fromEmail },
        subject: data.subject,
        content: [{ 
          type: 'text/html', 
          value: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${data.content}</body></html>`
        }]
      };

      console.log('SendGrid API request details:', {
        endpoint: 'https://api.sendgrid.com/v3/mail/send',
        method: 'POST',
        hasApiKey: !!settings.sendgrid.apiKey,
        fromEmail: settings.sendgrid.fromEmail,
        toEmail: data.to,
        timestamp: new Date().toISOString()
      });

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.sendgrid.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      let responseData;
      try {
        responseData = await response.text();
        console.log('SendGrid API response:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          timestamp: new Date().toISOString(),
          data: responseData || '(empty response)'
        });
      } catch (error) {
        console.error('Error reading SendGrid response:', error);
        throw new Error('Failed to read SendGrid API response');
      }

      if (!response.ok) {
        console.error('SendGrid API error:', {
          status: response.status,
          statusText: response.statusText,
          response: responseData,
          timestamp: new Date().toISOString()
        });
        throw new Error(`SendGrid API error: ${response.status} ${response.statusText}`);
      }

      console.log('SendGrid email sent successfully:', {
        to: data.to,
        timestamp: new Date().toISOString()
      });

      return true;
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
