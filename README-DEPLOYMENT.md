# Vercel Deployment Setup

## 🚨 CRITICAL SECURITY ISSUE FOUND

The current `.env.local` file contains a **SERVICE ROLE KEY** which should NEVER be exposed to the frontend. This key has admin privileges and poses a serious security risk.

## Required Environment Variables for Vercel

### 1. Get the Correct Supabase Keys

Go to your Supabase project dashboard at: https://dqfemavcxskjjbnictjt.supabase.co

Navigate to **Settings > API** and get:
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL (already correct)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The **anon/public** key (NOT the service_role key!)

### 2. Set Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://dqfemavcxskjjbnictjt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[GET_THE_CORRECT_ANON_KEY_FROM_SUPABASE]
```

### 3. Optional Environment Variables

```
MAILCHIMP_API_KEY=[your_mailchimp_api_key]
MAILCHIMP_AUDIENCE_ID=[your_mailchimp_audience_id]
MAILCHIMP_API_SERVER=[your_mailchimp_server_prefix]
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=[your_recaptcha_site_key]
NEXT_PUBLIC_AMAZON_AFFILIATE_ID=[your_amazon_associate_id]
```

## Deployment Steps

1. **Fix the security issue first** - Replace the service role key with the anon key
2. Push code to GitHub repository
3. Connect repository to Vercel
4. Add environment variables in Vercel dashboard
5. Deploy

## Supabase Database Setup

Make sure your Supabase database has:
1. All migrations applied
2. Row Level Security (RLS) policies configured
3. Proper user roles and permissions

## Next.js Configuration

The app is already configured for Vercel deployment with:
- Next.js 15 App Router
- Server actions enabled
- Image optimization configured for BoardGameGeek images
- TypeScript build errors ignored (should be fixed eventually)
