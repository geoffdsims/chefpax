import { NextResponse } from "next/server";
import mailchimp from "@mailchimp/mailchimp_marketing";
import sgMail from "@sendgrid/mail";
import type { EmailListMember } from "@/lib/schema";

// Configure Mailchimp
if (process.env.MAILCHIMP_API_KEY) {
  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX || "us1",
  });
}

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Subscribe user to email marketing
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      firstName, 
      lastName, 
      tags = [], 
      source = "website",
      subscriptionTier,
      loyaltyPoints 
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailMember: EmailListMember = {
      email,
      firstName,
      lastName,
      tags: [...tags, source],
      source,
      subscriptionTier,
      loyaltyPoints,
      createdAt: new Date().toISOString(),
    };

    const results = {
      mailchimp: null,
      sendgrid: null,
    };

    // Add to Mailchimp
    if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
      try {
        const mailchimpResult = await mailchimp.lists.addListMember(
          process.env.MAILCHIMP_LIST_ID,
          {
            email_address: email,
            status: "subscribed",
            merge_fields: {
              FNAME: firstName || "",
              LNAME: lastName || "",
            },
            tags: emailMember.tags,
          }
        );
        results.mailchimp = { success: true, id: mailchimpResult.id };
      } catch (error: any) {
        console.error("Mailchimp error:", error);
        results.mailchimp = { 
          success: false, 
          error: error.response?.body?.detail || error.message 
        };
      }
    }

    // Send welcome email via SendGrid
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
      try {
        const welcomeEmail = {
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: "Welcome to ChefPax! 🌱",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4CAF50;">Welcome to ChefPax, ${firstName || 'Friend'}! 🌱</h1>
              <p>Thank you for joining our community of fresh microgreen lovers!</p>
              <p>Here's what you can expect:</p>
              <ul>
                <li>Fresh, live microgreen trays delivered to your door</li>
                <li>Exclusive subscriber discounts and promotions</li>
                <li>Delivery tips and microgreen growing advice</li>
                <li>Early access to new products and seasonal specials</li>
              </ul>
              <p>Ready to get started? <a href="${process.env.NEXT_PUBLIC_BASE_URL}/shop" style="color: #4CAF50;">Shop Now</a></p>
              <p>Best regards,<br>The ChefPax Team</p>
            </div>
          `,
        };

        await sgMail.send(welcomeEmail);
        results.sendgrid = { success: true };
      } catch (error: any) {
        console.error("SendGrid error:", error);
        results.sendgrid = { 
          success: false, 
          error: error.message 
        };
      }
    }

    return NextResponse.json({
      success: true,
      email,
      results,
    });
  } catch (error) {
    console.error("Error subscribing to email marketing:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to email marketing" },
      { status: 500 }
    );
  }
}

/**
 * Unsubscribe user from email marketing
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    const results = {
      mailchimp: null,
    };

    // Remove from Mailchimp
    if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
      try {
        await mailchimp.lists.updateListMember(
          process.env.MAILCHIMP_LIST_ID,
          email,
          { status: "unsubscribed" }
        );
        results.mailchimp = { success: true };
      } catch (error: any) {
        console.error("Mailchimp unsubscribe error:", error);
        results.mailchimp = { 
          success: false, 
          error: error.response?.body?.detail || error.message 
        };
      }
    }

    return NextResponse.json({
      success: true,
      email,
      results,
    });
  } catch (error) {
    console.error("Error unsubscribing from email marketing:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from email marketing" },
      { status: 500 }
    );
  }
}
