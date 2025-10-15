# Shopify App Setup Guide

This guide will help you convert the Inventory Monitor into a proper Shopify app with OAuth and custom Flow actions.

## Prerequisites

1. **Shopify Partner Account** (free)
   - Sign up at: https://partners.shopify.com/
   
2. **Development Store** (for testing)
   - Create one in your Partner Dashboard

## Step 1: Create Shopify App

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com/)
2. Click **Apps** > **Create app**
3. Choose **Create app manually**
4. Fill in:
   - **App name**: Inventory Monitor
   - **App URL**: `https://your-app-url.com` (your deployed frontend URL)
   - **Allowed redirection URL(s)**: 
     ```
     https://your-supabase-project.supabase.co/functions/v1/shopify-auth/callback
     ```

5. Click **Create app**

6. Note down:
   - **API key** (Client ID)
   - **API secret key** (Client Secret)

## Step 2: Configure API Scopes

In your app settings, under **API access**, add these scopes:

- `read_products` - Read product data
- `write_products` - Update product variants
- `read_inventory` - Check inventory levels
- `write_price_rules` - Manage pricing (optional)

## Step 3: Set Up Environment Variables

### Frontend (.env file)
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SHOPIFY_API_KEY=your-shopify-api-key-from-step-1
VITE_APP_URL=http://localhost:5173
```

### Backend (Supabase Secrets)
Set these in **Supabase Dashboard** > **Edge Functions** > **Secrets**:

```bash
supabase secrets set SHOPIFY_API_KEY=your-shopify-api-key
supabase secrets set SHOPIFY_API_SECRET=your-shopify-api-secret
supabase secrets set APP_URL=https://your-deployed-app-url.com
```

## Step 4: Deploy Functions

Deploy your Supabase Edge Functions:

```bash
# Deploy OAuth handler
supabase functions deploy shopify-auth

# Deploy Flow trigger handler
supabase functions deploy shopify-flow-trigger
```

## Step 5: Run Database Migrations

Apply the OAuth migration:

```bash
supabase db push
```

## Step 6: Install Dependencies

Install the new Shopify packages:

```bash
npm install
```

## Step 7: Test the App

### Local Development:
```bash
npm run dev
```

Visit `http://localhost:5173` and you should see the install page.

### Test Installation:
1. Enter your development store domain
2. Click "Install App"
3. Authorize the app in Shopify
4. You should be redirected back to the dashboard

## Step 8: Set Up Shopify Flow Extension (Custom Action)

### Create Extension Configuration

Create a file `extensions/inventory-monitor-action/shopify.extension.toml`:

```toml
api_version = "2024-01"
type = "flow_action"
name = "inventory-monitor-action"
handle = "inventory-monitor-action"

[[extensions.settings]]
key = "action_name"
value = "Check Inventory & Update Pricing"

[[extensions.settings]]
key = "description"
value = "Monitors product inventory and automatically adjusts pricing when stock is low"
```

### Create Action Definition

Create `extensions/inventory-monitor-action/action.json`:

```json
{
  "title": "Check Inventory & Update Pricing",
  "description": "Automatically updates product pricing when only 1-2 variants are in stock",
  "schema": {
    "input": {
      "type": "object",
      "properties": {
        "product": {
          "type": "string",
          "title": "Product",
          "description": "The product to check inventory for",
          "resource": "product"
        }
      },
      "required": ["product"]
    },
    "output": {
      "type": "object",
      "properties": {
        "in_stock_count": {
          "type": "integer",
          "title": "In Stock Count",
          "description": "Number of variants currently in stock"
        },
        "pricing_updated": {
          "type": "boolean",
          "title": "Pricing Updated",
          "description": "Whether pricing was automatically updated"
        }
      }
    }
  },
  "action_run_url": "https://your-supabase-project.supabase.co/functions/v1/shopify-flow-trigger"
}
```

## Step 9: Using the App in Shopify Flow

Once installed, merchants can:

1. Go to **Settings** > **Apps and sales channels** > **Flow**
2. Create a new workflow
3. Choose a trigger (e.g., "Inventory level changed")
4. Search for "Inventory Monitor" in actions
5. Select "Check Inventory & Update Pricing"
6. Configure conditions based on the output

### Example Flow:

**Trigger:** Inventory level changed
↓
**Action:** Check Inventory & Update Pricing
↓
**Condition:** If in_stock_count ≤ 2
↓
**Then:** Send notification "Low stock alert!"

## Step 10: Testing

### Test in Development:
1. Install app on your development store
2. Create a test product with multiple variants
3. Adjust inventory to 2 or less in-stock variants
4. Trigger the Flow manually or wait for automatic trigger
5. Check if compare_at_price was updated

### Verify Results:
- Check the product in Shopify admin
- Variants should show "Compare at price" with 50% markup
- Flow execution log should show successful run

## Step 11: App Submission (Optional)

To list in Shopify App Store:

1. Complete app listing requirements
2. Add app privacy policy URL
3. Add GDPR webhooks (if collecting customer data)
4. Submit for review in Partner Dashboard

### Required Webhooks:
```javascript
// Add to your backend
app.post('/webhooks/customers/data_request', ...);
app.post('/webhooks/customers/redact', ...);
app.post('/webhooks/shop/redact', ...);
```

## Troubleshooting

### OAuth Issues:
- Verify redirect URLs match exactly
- Check API key and secret are correct
- Ensure app is not blocked by browser extensions

### Flow Action Not Appearing:
- Verify action.json is properly formatted
- Check action_run_url is accessible
- Ensure app has required API scopes

### Pricing Not Updating:
- Verify access token has `write_products` scope
- Check Supabase function logs for errors
- Test API endpoint directly with curl

## Production Deployment

### Frontend:
Deploy to Vercel, Netlify, or your hosting provider.

Update these in production:
- `VITE_APP_URL` → your production URL
- `APP_URL` in Supabase secrets → your production URL

### Update Shopify App Settings:
- App URL → your production URL
- Allowed redirection URLs → your production callback URL

## Support

For issues:
1. Check Supabase function logs
2. Check browser console for errors
3. Review Shopify Partner Dashboard > App > API health

## Next Steps

- [ ] Set up proper error handling
- [ ] Add webhook listeners for automatic triggers
- [ ] Implement analytics/logging
- [ ] Add merchant preferences/settings
- [ ] Create onboarding flow
- [ ] Add support for more complex pricing rules

