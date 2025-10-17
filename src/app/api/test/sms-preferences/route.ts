import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

/**
 * Test endpoint to view SMS preferences
 * GET /api/test/sms-preferences
 * GET /api/test/sms-preferences?phone=5551234567
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    let results: any = {
      timestamp: new Date().toISOString()
    };

    if (phone) {
      // Get specific phone preferences
      const normalizedPhone = phone.replace(/[\s\-\+]/g, '').replace(/^1/, '');
      
      // Check user profile
      const userProfile = await db.collection('userProfiles').findOne(
        { phone: { $regex: normalizedPhone } }
      );

      // Check guest preferences
      const guestPref = await db.collection('sms_preferences').findOne(
        { phone: normalizedPhone }
      );

      results = {
        ...results,
        phone: phone,
        normalizedPhone,
        userProfile: userProfile ? {
          userId: userProfile.userId,
          email: userProfile.email,
          phone: userProfile.phone,
          smsOptIn: userProfile.communicationPreferences?.smsOptIn,
          smsOptInDate: userProfile.communicationPreferences?.smsOptInDate,
          smsOptOutDate: userProfile.communicationPreferences?.smsOptOutDate
        } : null,
        guestPreference: guestPref ? {
          phone: guestPref.phone,
          smsOptIn: guestPref.smsOptIn,
          smsOptInDate: guestPref.smsOptInDate,
          smsOptOutDate: guestPref.smsOptOutDate,
          lastUpdated: guestPref.lastUpdated
        } : null
      };
    } else {
      // Get summary statistics
      const userProfilesCount = await db.collection('userProfiles').countDocuments({
        'communicationPreferences.smsOptIn': { $exists: true }
      });

      const optedInUsers = await db.collection('userProfiles').countDocuments({
        'communicationPreferences.smsOptIn': true
      });

      const optedOutUsers = await db.collection('userProfiles').countDocuments({
        'communicationPreferences.smsOptIn': false
      });

      const guestPrefsCount = await db.collection('sms_preferences').countDocuments();
      const guestOptedIn = await db.collection('sms_preferences').countDocuments({ smsOptIn: true });
      const guestOptedOut = await db.collection('sms_preferences').countDocuments({ smsOptIn: false });

      results = {
        ...results,
        summary: {
          userProfiles: {
            total: userProfilesCount,
            optedIn: optedInUsers,
            optedOut: optedOutUsers
          },
          guestPreferences: {
            total: guestPrefsCount,
            optedIn: guestOptedIn,
            optedOut: guestOptedOut
          },
          combined: {
            totalOptedIn: optedInUsers + guestOptedIn,
            totalOptedOut: optedOutUsers + guestOptedOut
          }
        },
        note: 'Add ?phone=5551234567 to check specific phone number'
      };
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('❌ Error checking SMS preferences:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check SMS preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


