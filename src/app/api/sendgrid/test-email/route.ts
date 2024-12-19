import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { apiKey, toEmail, fromEmail } = await request.json();

    if (!apiKey || !toEmail || !fromEmail) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters'
      }, { status: 400 });
    }

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

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully'
      });
    }

    const errorData = await response.json().catch(() => null);
    return NextResponse.json({
      success: false,
      message: 'Failed to send test email',
      error: {
        code: 'send_test_failed',
        response: errorData
      }
    }, { status: response.status });
  } catch (error) {
    console.error('Error in SendGrid test email route:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error sending test email',
      error: {
        code: 'server_error',
        response: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
} 