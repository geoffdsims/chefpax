# Slack Webhook Setup Guide for ChefPax

## Overview
Slack webhooks allow ChefPax to send production notifications to your Slack workspace. This is **FREE** and takes about 5 minutes to set up.

---

## Step 1: Create a Slack Workspace (if you don't have one)

1. Go to https://slack.com/get-started
2. Click "Create a New Workspace"
3. Enter your email (geoff@chefpax.com)
4. Check your email for the verification code
5. Name your workspace (e.g., "ChefPax Production")
6. Add a channel called `#production` (or any name you prefer)

**Cost:** FREE (up to 10 apps and 90 days of message history)

---

## Step 2: Create an Incoming Webhook

### Option A: Using Slack Workflows (Recommended - No App Needed!)

1. **Open Slack** and go to your workspace
2. **Click on your workspace name** in the top-left
3. **Select "Tools & settings" → "Workflow Builder"**
4. **Click "Create"**
5. **Choose "From a webhook"**
6. **Name it**: "ChefPax Production Notifications"
7. **Add Variables** (for receiving data):
   - `text` (text)
   - `channel` (text)
8. **Add Step**: "Send a message"
   - **Channel**: Select `#production`
   - **Message**: Use the `text` variable
9. **Publish** the workflow
10. **Copy the Webhook URL** (looks like: `https://hooks.slack.com/workflows/T...`)

### Option B: Using Incoming Webhooks App (Classic Method)

1. **Go to**: https://api.slack.com/apps
2. **Click**: "Create New App"
3. **Choose**: "From scratch"
4. **App Name**: "ChefPax Production"
5. **Workspace**: Select your ChefPax workspace
6. **Click**: "Create App"

7. **In the left sidebar**, click "Incoming Webhooks"
8. **Toggle**: "Activate Incoming Webhooks" to **ON**
9. **Click**: "Add New Webhook to Workspace"
10. **Select channel**: `#production` (or create a new one)
11. **Click**: "Allow"

12. **Copy the Webhook URL** (starts with `https://hooks.slack.com/services/T...`)

---

## Step 3: Add to Environment Variables

1. **Open** `.env.local` in your project
2. **Add these lines**:

```bash
# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WEBHOOK_URL_HERE
SLACK_CHANNEL=#production
```

3. **Save the file**

---

## Step 4: Add to Vercel (Production)

1. **Go to**: https://vercel.com/geoffsims/chefpax/settings/environment-variables
2. **Add**:
   - **Key**: `SLACK_WEBHOOK_URL`
   - **Value**: Your webhook URL
   - **Environment**: Production
3. **Add**:
   - **Key**: `SLACK_CHANNEL`
   - **Value**: `#production`
   - **Environment**: Production
4. **Save**

---

## Step 5: Test the Webhook

### Option 1: From Test Page
1. Visit: http://localhost:3001/test-production
2. Click "Check Ready Tasks" or "Generate Summary"
3. Check your Slack channel for notifications

### Option 2: Using curl
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"🌱 Test notification from ChefPax!"}'
```

### Option 3: Using the Browser
Go to: https://chefpax.com/api/production/daily-summary

---

## What You'll Receive in Slack

### 🌱 Production Task Notifications
When a task is ready to run:
```
🌱 Production Task Ready: SEED

Product: Sunflower Live Tray
Quantity: 2 trays
Priority: MEDIUM
Scheduled Time: Oct 13, 2025, 10:00 AM
Notes: Broadcast 11 oz, weighted dome
```

### ✅ Task Completion Notifications
When a task is completed:
```
✅ Task Completed: SEED

Product: Sunflower Live Tray
Quantity: 2 trays
Completed At: Oct 13, 2025, 10:15 AM
Completion Notes: Seeded successfully, placed in Tier 1
```

### 🚨 Urgent Alerts
For overdue tasks:
```
🚨 URGENT: SEED task is overdue!

This task was scheduled for Oct 13, 2025, 9:00 AM 
and needs immediate attention!

Product: Pea Shoots Live Tray
Quantity: 3 trays
```

### 📊 Daily Production Summary
Every morning (or on demand):
```
📊 Daily Production Summary - Oct 13, 2025

Today's Tasks: 8
Urgent Tasks: 2
Overdue Tasks: 0
Completed Today: 5
```

---

## Automation Schedule (Optional)

You can set up automated notifications using **Vercel Cron Jobs** or **GitHub Actions**.

### Vercel Cron (Recommended)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/production/check-ready-tasks",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/production/daily-summary",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Schedule Explanation:**
- `0 * * * *` = Every hour, check for ready tasks
- `0 6 * * *` = Every day at 6:00 AM, send daily summary

---

## Troubleshooting

### "webhook_url is invalid"
- Make sure you copied the entire URL
- Check for spaces or line breaks in the URL
- URL should start with `https://hooks.slack.com/`

### "channel_not_found"
- Make sure the channel exists in your workspace
- Channel names should start with `#`
- The app needs to be invited to private channels

### No notifications appearing
1. Check that `SLACK_WEBHOOK_URL` is set
2. Verify the URL is correct
3. Check Slack channel permissions
4. Look for errors in Vercel logs

---

## MongoDB Atlas Setup

You already have MongoDB set up, but here's a quick reference:

**Current Connection String:**
```
mongodb+srv://chefpax-user:UZQTizsE3Abla1ZH@chefpax-app.3zblni9.mongodb.net/?retryWrites=true&w=majority&appName=chefpax-app
```

This is already in your `.env.local` as:
```bash
MONGODB_URI=mongodb+srv://chefpax-user:UZQTizsE3Abla1ZH@chefpax-app.3zblni9.mongodb.net/?retryWrites=true&w=majority&appName=chefpax-app
MONGODB_DB=chefpax
```

✅ **Already configured and working!**

---

## Cost Summary

| Service | Cost | Purpose |
|---------|------|---------|
| **Slack Free Plan** | $0/month | Up to 10 apps, 90-day history |
| **MongoDB Atlas (Free Tier)** | $0/month | 512 MB storage, shared cluster |
| **Vercel Hobby** | $0/month | Unlimited deployments |
| **Total** | **$0/month** | Full automation! |

---

## Next Steps

1. ✅ Set up Slack webhook (5 minutes)
2. ✅ Add to `.env.local` and Vercel
3. ✅ Test notifications
4. ✅ Wait for Twilio verification (they'll email you)
5. ✅ Wait for Facebook approval (can take 1-3 days)

**You're ready to automate production notifications! 🚀**

