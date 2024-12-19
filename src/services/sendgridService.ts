import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const SETTINGS_DOC = 'settings/sendgrid';

export interface SendGridSettings {
  apiKey?: string;
  enabled?: boolean;
  fromEmail?: string;
  isValidated?: boolean;
}

export interface SendGridResponse {
  success: boolean;
  message?: string;
  error?: {
    code?: string;
    response?: any;
  };
}

export const sendgridService = {
  getSettings: async (): Promise<SendGridSettings> => {
    try {
      const docRef = doc(db, SETTINGS_DOC);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as SendGridSettings) : {};
    } catch (error) {
      console.error('Error fetching SendGrid settings:', error);
      return {};
    }
  },

  updateSettings: async (settings: SendGridSettings): Promise<SendGridResponse> => {
    try {
      // First save the settings
      const docRef = doc(db, SETTINGS_DOC);
      await setDoc(docRef, {
        ...settings,
        isValidated: false // Reset validation status
      });

      // Then try to validate if there's an API key
      if (settings.apiKey) {
        try {
          const validationResult = await sendgridService.validateApiKey(settings.apiKey);
          
          // Update the validation status
          await setDoc(docRef, {
            ...settings,
            isValidated: validationResult.success
          });

          if (!validationResult.success) {
            return validationResult;
          }
        } catch (error) {
          console.error('Error validating API key:', error);
          // Don't fail the save operation if validation fails
        }
      }

      return {
        success: true,
        message: 'Settings updated successfully'
      };
    } catch (error) {
      console.error('Error updating SendGrid settings:', error);
      return {
        success: false,
        message: 'Failed to update settings',
        error: {
          code: 'settings_update_failed',
          response: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  },

  validateApiKey: async (apiKey: string): Promise<SendGridResponse> => {
    if (!apiKey) {
      return {
        success: false,
        message: 'API key is required'
      };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: 'test@example.com' }]
          }],
          from: { email: 'test@example.com' },
          subject: 'API Key Validation',
          content: [{ 
            type: 'text/plain', 
            value: 'Testing API Key' 
          }]
        })
      });

      // If we get a 401, the key is invalid
      // If we get a 400, the key is valid but the email addresses are invalid (expected)
      const isValid = response.status === 400;

      return {
        success: isValid,
        message: isValid ? 'API key is valid' : 'Invalid API key'
      };
    } catch (error) {
      console.error('Error validating SendGrid key:', error);
      return {
        success: false,
        message: 'Error validating API key',
        error: {
          code: 'validation_error',
          response: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  },

  sendTestEmail: async (
    apiKey: string, 
    toEmail: string, 
    fromEmail: string
  ): Promise<SendGridResponse> => {
    if (!apiKey || !toEmail || !fromEmail) {
      return {
        success: false,
        message: 'Missing required parameters'
      };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: toEmail }]
          }],
          from: { email: fromEmail },
          subject: 'SendGrid Test Email',
          content: [{
            type: 'text/plain',
            value: 'This is a test email from your application to verify SendGrid integration.'
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return {
          success: false,
          message: 'Failed to send test email',
          error: {
            code: 'send_test_failed',
            response: errorData
          }
        };
      }

      return {
        success: true,
        message: 'Test email sent successfully'
      };
    } catch (error) {
      console.error('Error sending test email:', error);
      return {
        success: false,
        message: 'Error sending test email',
        error: {
          code: 'send_test_error',
          response: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}; 