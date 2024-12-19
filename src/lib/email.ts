import { sendgridService } from '../services/sendgridService';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: {
    code?: string;
    response?: any;
  };
}

export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  try {
    // Get SendGrid settings
    const settings = await sendgridService.getSettings();
    
    if (!settings.enabled || !settings.apiKey || !settings.fromEmail) {
      return {
        success: false,
        message: 'SendGrid is not properly configured'
      };
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: options.to }]
        }],
        from: { email: settings.fromEmail },
        subject: options.subject,
        content: [
          ...(options.text ? [{
            type: 'text/plain',
            value: options.text
          }] : []),
          ...(options.html ? [{
            type: 'text/html',
            value: options.html
          }] : [])
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        message: errorData?.message || `Failed to send email: ${response.statusText}`
      };
    }

    return {
      success: true,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

// Helper function to send pipeline status change notifications
export async function sendPipelineStatusChangeEmail(
  to: string,
  businessName: string,
  oldStatus: string,
  newStatus: string
): Promise<EmailResponse> {
  const subject = `Status Update: ${businessName}`;
  const text = `The status for ${businessName} has been updated from ${oldStatus} to ${newStatus}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; margin-bottom: 20px;">Status Update</h2>
      <p style="color: #666; margin-bottom: 15px;">
        The status for <strong>${businessName}</strong> has been updated:
      </p>
      <ul style="list-style: none; padding: 0; margin: 0 0 20px 0;">
        <li style="margin-bottom: 10px; padding-left: 20px; border-left: 3px solid #ccc;">
          Previous Status: ${oldStatus}
        </li>
        <li style="margin-bottom: 10px; padding-left: 20px; border-left: 3px solid #4CAF50;">
          New Status: ${newStatus}
        </li>
      </ul>
      <p style="color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
        Please log in to the system to view more details.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    text,
    html
  });
} 