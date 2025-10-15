# Quick Start Checklist for Shopify App

## ✅ What's Been Done

Your app has been converted into a professional Shopify app! Here's what's ready:

- ✅ Shopify Polaris UI components
- ✅ App Bridge integration for embedded experience
- ✅ OAuth authentication flow
- ✅ Backend OAuth handlers (Supabase Edge Functions)
- ✅ Database schema for OAuth tokens
- ✅ Flow action extension configuration
- ✅ Installation page
- ✅ Dashboard with tabs
- ✅ Complete setup documentation

## 🚀 Next Steps (Do These Now)

### 1. Install New Dependencies
```bash
npm install
```

### 2. Create Shopify App in Partner Dashboard

1. Go to https://partners.shopify.com/
2. Click **Apps** → **Create app** → **Create app manually**
3. Fill in:
   - App name: `Inventory Monitor`
   - App URL: `http://localhost:5173` (change later for production)
   - Allowed redirection URLs: 
     ```
     https://YOUR-PROJECT.supabase.co/functions/v1/shopify-auth/callback
     ```

4. **Save these values** (you'll need them next):
   - API key (Client ID)
   - API secret key (Client Secret)

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase
VITE_SHOPIFY_API_KEY=YOUR-API-KEY-FROM-STEP-2
VITE_APP_URL=http://localhost:5173
```

### 4. Set Supabase Secrets

```bash
supabase secrets set SHOPIFY_API_KEY=YOUR-API-KEY
supabase secrets set SHOPIFY_API_SECRET=YOUR-API-SECRET
supabase secrets set APP_URL=http://localhost:5173
```

### 5. Run Database Migration

```bash
supabase db push
```

### 6. Deploy Edge Functions

```bash
supabase functions deploy shopify-auth
supabase functions deploy shopify-flow-trigger
```

### 7. Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## 📋 Testing the OAuth Flow

### Option A: Using ngrok (Recommended for Local Testing)

1. Install ngrok: https://ngrok.com/
2. Start ngrok:
   ```bash
   ngrok http 5173
   ```
3. Update your Shopify app settings:
   - App URL: `https://YOUR-NGROK-URL.ngrok.io`
   - Redirect URL: Keep the Supabase one
   - Update `.env`: `VITE_APP_URL=https://YOUR-NGROK-URL.ngrok.io`
   - Update Supabase secret: `supabase secrets set APP_URL=https://YOUR-NGROK-URL.ngrok.io`

4. Visit your ngrok URL and test installation!

### Option B: Deploy to Production First

1. Deploy frontend to Vercel/Netlify
2. Update Shopify app URLs to production URLs
3. Update environment variables to production values
4. Test on production

## 🧪 Testing Checklist

- [ ] Visit install page - shows "Install App" button
- [ ] Enter store domain and click install
- [ ] Redirected to Shopify authorization page
- [ ] After authorizing, redirected back to dashboard
- [ ] Dashboard shows "App installed successfully!" banner
- [ ] Can access different tabs (Test Trigger, Shop Setup, Documentation)
- [ ] Test Flow Trigger works with valid product ID
- [ ] Shows pricing information correctly

## 📱 Using in Shopify Flow

Once installed on a store:

1. Go to Shopify Admin → **Settings** → **Apps and sales channels** → **Flow**
2. Create new workflow
3. **Trigger**: "Inventory level changed" (or any product trigger)
4. **Action**: Search for "Check Inventory"
5. Configure product input
6. **Condition**: Use output `in_stock_count` for logic
7. Save and test!

## 🎨 What Changed

### New Files Created:
- `src/components/ShopifyAppProvider.tsx` - App Bridge wrapper
- `src/components/InstallPage.tsx` - OAuth installation page
- `src/components/Dashboard.tsx` - Main dashboard
- `src/components/ShopSetupPolaris.tsx` - Polaris version of shop setup
- `src/components/FlowTesterPolaris.tsx` - Polaris version of tester
- `supabase/functions/shopify-auth/index.ts` - OAuth handler
- `supabase/migrations/20251015120000_add_oauth_support.sql` - OAuth schema
- `extensions/inventory-monitor-action/` - Flow action config
- `SHOPIFY_APP_SETUP.md` - Complete setup guide
- `README.md` - Updated project docs

### Updated Files:
- `package.json` - Added Shopify dependencies
- `src/App.tsx` - Now handles routing and Polaris integration

### Old Files (Still Available):
- Original Tailwind components are still there if you need them
- Located in `src/components/`:
  - `ShopSetup.tsx`
  - `FlowTester.tsx`
  - `QuickStart.tsx`
  - `Documentation.tsx`

## 🆘 Troubleshooting

### "Module not found" errors
```bash
npm install
```

### OAuth redirect not working
- Check redirect URL exactly matches in Shopify app settings
- Include `/callback` at the end
- Use HTTPS for production

### App not loading in Shopify admin
- Verify VITE_SHOPIFY_API_KEY matches your app
- Check browser console for errors
- Ensure app URL uses HTTPS in production

### Flow action not appearing
- Flow actions need to be registered in Shopify Partner Dashboard
- Check extensions/inventory-monitor-action/shopify.extension.toml
- Contact Shopify Partner support if needed

## 📚 Documentation

- **Complete Setup**: See `SHOPIFY_APP_SETUP.md`
- **Project Overview**: See `README.md`
- **Shopify Partner Docs**: https://shopify.dev/docs/apps

## 🎉 You're Ready!

Follow the steps above and you'll have a professional Shopify app running in no time!

Need help? Check the detailed guides:
- `SHOPIFY_APP_SETUP.md` - Step-by-step instructions
- `README.md` - Architecture and API docs

