# 🚀 Production Deployment Checklist

## ⚡ **Quick Reference**

### **Critical Changes Needed:**
- [ ] **Update Supabase URLs** from localhost to production
- [ ] **Enable reCAPTCHA** (remove development bypass)
- [ ] **Remove hardcoded API keys** from scripts
- [ ] **Update Supabase dashboard** redirect URLs
- [ ] **Delete temporary files**

---

## 🔧 **Environment Variables**

```bash
# Update these in .env.local for production:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_real_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_real_recaptcha_secret_key
```

---

## 📁 **Files to Clean Up**

### **Delete These:**
- [ ] `lib/supabase/client-temp.ts`
- [ ] `app/api/test-env/route.ts`

### **Update These:**
- [ ] `components/submit-remix-form.tsx` - Remove reCAPTCHA bypass
- [ ] `scripts/inspect-database.ts` - Remove hardcoded keys

---

## 🌐 **Supabase Dashboard**

1. **Authentication → URL Configuration:**
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`

2. **Email Templates:**
   - Update all templates with production URLs

---

## 🧪 **Testing**

- [ ] Test authentication flows
- [ ] Verify image loading
- [ ] Test reCAPTCHA
- [ ] Check mobile responsiveness
- [ ] Verify Core Web Vitals

---

## 📋 **Deployment**

```bash
# 1. Update environment variables
# 2. Clean up temporary files
# 3. Deploy to Vercel
vercel --prod
```

---

**Status:** ✅ Ready for Production
**Priority:** High - Complete before going live
