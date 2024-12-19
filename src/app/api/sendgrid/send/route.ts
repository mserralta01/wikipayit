import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { apiKey, fromEmail, to, subject, text, html } = await request.json();

    if (!apiKey || !fromEmail || !to || !subject) {
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
          to: [{ email: to }]
        }],
        from: { email: fromEmail },
        subject,
        content: [
          ...(text ? [{
            type: 'text/plain',
            value: text
          }] : []),
          ...(html ? [{
            type: 'text/html',
            value: html
          }] : [])
        ]
      })
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully'
      });
    }

    const errorData = await response.json().catch(() => null);
    return NextResponse.json({
      success: false,
      message: 'Failed to send email',
      error: {
        code: 'send_email_failed',
        response: errorData
      }
    }, { status: response.status });
  } catch (error) {
    console.error('Error in SendGrid send email route:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error sending email',
      error: {
        code: 'server_error',
        response: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}