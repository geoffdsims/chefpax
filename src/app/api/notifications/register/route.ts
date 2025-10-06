import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function POST(req: Request) {
  try {
    const { token, userId } = await req.json();

    if (!token || !userId) {
      return NextResponse.json(
        { error: 'Token and userId are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Store or update the FCM token for the user
    await db.collection('userTokens').updateOne(
      { userId },
      { 
        $set: { 
          token,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Token registered successfully' 
    });
  } catch (error) {
    console.error('Error registering notification token:', error);
    return NextResponse.json(
      { error: 'Failed to register token' },
      { status: 500 }
    );
  }
}
