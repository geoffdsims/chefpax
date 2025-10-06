import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

const FCM_SERVER_KEY = process.env.FIREBASE_SERVER_KEY;

export async function POST(req: Request) {
  try {
    const { title, body, userId, data } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get user's FCM token
    let fcmToken;
    if (userId) {
      const userToken = await db.collection('userTokens').findOne({ userId });
      fcmToken = userToken?.token;
    }

    if (!fcmToken) {
      return NextResponse.json(
        { error: 'No FCM token found for user' },
        { status: 404 }
      );
    }

    // Send notification via FCM
    const notification = {
      to: fcmToken,
      notification: {
        title,
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        click_action: 'https://chefpax.com'
      },
      data: data || {},
      priority: 'high'
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notification)
    });

    if (!response.ok) {
      throw new Error(`FCM request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      success: true,
      messageId: result.message_id,
      message: 'Notification sent successfully' 
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
