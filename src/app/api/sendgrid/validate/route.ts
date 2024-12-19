import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'API key is required'
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

    return NextResponse.json({
      success: isValid,
      message: isValid ? 'API key is valid' : 'Invalid API key'
    });
  } catch (error) {
    console.error('Error in SendGrid validation route:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error validating API key',
      error: {
        code: 'server_error',
        response: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
} 