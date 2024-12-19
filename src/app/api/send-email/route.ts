import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    // Get request body
    const { to, subject, text } = await request.json();

    // Get SendGrid settings from Firebase
    const docRef = doc(db, 'settings/sendgrid');
    const docSnap = await getDoc(docRef);
    const settings = docSnap.exists() ? docSnap.data() : null;

    if (!settings?.apiKey || !settings?.fromEmail) {
      return NextResponse.json({
        success: false,
        message: 'SendGrid is not configured'
      }, { status: 500 });
    }

    // Configure SendGrid
    sgMail.setApiKey(settings.apiKey);

    // Send email
    await sgMail.send({
      to,
      from: settings.fromEmail,
      subject,
      text
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send email'
    }, { status: 500 });
  }
}