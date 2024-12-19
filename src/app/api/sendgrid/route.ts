import { NextResponse } from 'next/server';

async function validateSendGridKey(apiKey: string) {
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
    return response.status === 400;
  } catch (error) {
    console.error('Error validating SendGrid key:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'API key is required'
      }, { status: 400 });
    }

    const isValid = await validateSendGridKey(apiKey);

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