# Shopify Inventory Monitor App

A professional Shopify app that monitors inventory levels and automatically adjusts pricing when stock is low. Built with React, Shopify Polaris, App Bridge, and Supabase.

## Features

- ✅ **OAuth Installation** - One-click app installation for Shopify stores
- ✅ **Shopify Polaris UI** - Native Shopify admin experience
- ✅ **Custom Flow Actions** - Searchable actions in Shopify Flow
- ✅ **Automatic Pricing** - Updates compare_at_price when stock is low (1-2 variants)
- ✅ **Real-time Monitoring** - Tracks inventory changes via Flow triggers
- ✅ **Embedded App** - Runs inside Shopify admin using App Bridge

## Architecture

```
Frontend (React + Polaris + App Bridge)
  ├── Install Page (OAuth initiation)
  ├── Dashboard (Post-installation)
  └── Embedded in Shopify Admin

Backend (Supabase Edge Functions)
  ├── shopify-auth (OAuth handler)
  └── shopify-flow-trigger (Inventory checker & price updater)

Database (Supabase PostgreSQL)
  └── shopify_shops (Store tokens & config)

Shopify
  ├── OAuth (Secure token exchange)
  └── Flow (Custom action extension)
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SHOPIFY_API_KEY=your-shopify-api-key
VITE_APP_URL=http://localhost:5173
```

Set Supabase secrets:

```bash
supabase secrets set SHOPIFY_API_KEY=your-key
supabase secrets set SHOPIFY_API_SECRET=your-secret
supabase secrets set APP_URL=http://localhost:5173
```

### 3. Run Database Migrations

```bash
supabase db push
```

### 4. Deploy Edge Functions

```bash
supabase functions deploy shopify-auth
supabase functions deploy shopify-flow-trigger
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the install page.

## Detailed Setup

See [SHOPIFY_APP_SETUP.md](./SHOPIFY_APP_SETUP.md) for complete instructions on:
- Creating a Shopify app in Partner Dashboard
- Configuring OAuth and API scopes
- Setting up Flow extensions
- Testing and deployment

## Usage

### For Merchants

1. **Install the App**
   - Enter your Shopify store domain
   - Click "Install App"
   - Authorize the requested permissions

2. **Use in Shopify Flow**
   - Go to Shopify Admin > Flow
   - Create a new workflow
   - Add trigger: "Inventory level changed"
   - Add action: Search for "Check Inventory & Update Pricing"
   - Configure conditions based on output

### Example Flow

```
Trigger: Inventory level changed
  ↓
Action: Check Inventory & Update Pricing
  ↓
Condition: If in_stock_count ≤ 2
  ↓
Then: Product pricing automatically updated with 50% markup
```

## How It Works

1. **Inventory Monitoring**
   - Shopify Flow triggers when inventory changes
   - Flow calls the custom action
   - App checks how many variants are in stock

2. **Automatic Pricing**
   - If 1-2 variants in stock:
     - Sets `compare_at_price` = `price × 1.5` (50% increase)
     - Creates "was $150, now $100" effect
   - Returns in-stock count to Flow for further actions

3. **Flow Continues**
   - Merchant can add more actions based on output
   - E.g., Send email, tag product, notify team

## Project Structure

```
inventory-monitor/
├── src/
│   ├── components/
│   │   ├── ShopifyAppProvider.tsx    # App Bridge + Polaris wrapper
│   │   ├── InstallPage.tsx           # OAuth installation page
│   │   ├── Dashboard.tsx             # Main dashboard (tabs)
│   │   ├── ShopSetupPolaris.tsx      # Manual shop connection
│   │   ├── FlowTesterPolaris.tsx     # Test Flow triggers
│   │   └── Documentation.tsx         # Usage docs
│   ├── App.tsx                       # Root component (routing)
│   └── main.tsx                      # Entry point
├── supabase/
│   ├── functions/
│   │   ├── shopify-auth/             # OAuth handler
│   │   └── shopify-flow-trigger/     # Inventory checker
│   └── migrations/                   # Database schemas
├── extensions/
│   └── inventory-monitor-action/     # Flow action definition
└── SHOPIFY_APP_SETUP.md             # Complete setup guide
```

## Development

### Testing OAuth Flow

1. Start dev server: `npm run dev`
2. Use ngrok for HTTPS: `ngrok http 5173`
3. Update Shopify app redirect URLs with ngrok URL
4. Test installation flow

### Testing Flow Actions

1. Install app on development store
2. Create test product with variants
3. Set inventory to 2 or less
4. Trigger Flow manually or via inventory change
5. Check product prices in Shopify admin

### Debugging

- **Frontend**: Browser console
- **Backend**: Supabase function logs
- **Shopify**: Partner Dashboard > App > API health

## Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy dist/ folder
```

Update env variables in hosting platform.

### Backend (Already on Supabase)

Functions auto-deploy with:
```bash
supabase functions deploy <function-name>
```

### Update Shopify App

After deployment:
1. Update App URL in Partner Dashboard
2. Update redirect URLs
3. Update `APP_URL` secret in Supabase

## API Endpoints

### OAuth
- `GET /functions/v1/shopify-auth/install?shop={domain}` - Start installation
- `GET /functions/v1/shopify-auth/callback` - OAuth callback

### Flow Action
- `POST /functions/v1/shopify-flow-trigger` - Check inventory & update pricing

## Database Schema

```sql
CREATE TABLE shopify_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  nonce TEXT,  -- For OAuth verification
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Shopify Polaris, Shopify App Bridge
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL
- **Integration**: Shopify OAuth, Shopify Flow

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Check [SHOPIFY_APP_SETUP.md](./SHOPIFY_APP_SETUP.md)
- Review Supabase function logs
- Check Shopify API health in Partner Dashboard

## Roadmap

- [ ] Multi-threshold pricing rules
- [ ] Customizable price multipliers
- [ ] Webhook-based triggers (alternative to Flow)
- [ ] Analytics dashboard
- [ ] Bulk operations
- [ ] Email notifications
- [ ] Slack integration
- [ ] App Store listing

## Version

Current: 1.0.0 - Shopify App with OAuth & Flow Actions

Built with ❤️ for Shopify merchants

