import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const success = await EmailService.sendWelcomeEmail(email, name || 'Customer');

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send welcome email' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send welcome email',
      details: error.message 
    }, { status: 500 });
  }
}
