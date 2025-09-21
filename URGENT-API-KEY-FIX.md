# 🚨 URGENT: API Key Security Issue

## Problem
Your `.env.local` contains a **SERVICE ROLE KEY** which:
- ❌ Cannot be used for client-side authentication (causes 400 errors)
- ❌ Has admin privileges (major security risk)
- ❌ Should NEVER be in frontend code

## Current Key (WRONG - Service Role):
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmVtYXZjeHNrampibmljdGp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzE4ODA0NiwiZXhwIjoyMDYyNzY0MDQ2fQ.sEYB5YiUtzl8ARfxnELUW3PbKiDBb76HRLMYMYpBeao
```
(Notice "service_role" in the JWT payload)

## Required Fix
1. Go to: https://dqfemavcxskjjbnictjt.supabase.co
2. Settings > API
3. Copy the **"anon public"** key (NOT service_role)
4. Replace in .env.local:

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=[THE_CORRECT_ANON_KEY_HERE]
```

## Why This Fixes Everything
- ✅ Sign-in will work (no more 400 errors)
- ✅ Password reset will work
- ✅ All authentication features will function
- ✅ Security vulnerability eliminated

## Until Fixed
- ❌ Cannot sign in
- ❌ Cannot reset password  
- ❌ Cannot create/edit remixes
- ❌ App has major security vulnerability

**This MUST be fixed before any deployment!**
