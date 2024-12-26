import { APISettings } from './apiSettingsService';

interface SendGridEmailData {
  to: string;
  from: string;
  subject: string;
  content: string;
  apiKey: string;
}

export const sendgridService = {
  async validateApiKey(apiKey: string, fromEmail: string): Promise<boolean> {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: fromEmail }]
          }],
          from: { email: fromEmail },
          subject: 'API Key Validation',
          content: [{
            type: 'text/plain',
            value: 'This is a test email to validate the API key.'
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API validation error:', errorData || response.statusText);
        return false;
      }

      return response.status === 202;
    } catch (error) {
      console.error('Error validating SendGrid API key:', error);
      return false;
    }
  },

  async sendEmail(data: SendGridEmailData): Promise<boolean> {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.apiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: data.to }]
          }],
          from: { email: data.from },
          subject: data.subject,
          content: [{
            type: 'text/html',
            value: data.content
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('SendGrid API error:', errorData || response.statusText);
        return false;
      }

      return response.status === 202;
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      return false;
    }
  }
}; 