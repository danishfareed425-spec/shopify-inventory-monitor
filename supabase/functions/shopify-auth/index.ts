import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const shopifyApiKey = Deno.env.get('SHOPIFY_API_KEY')!;
    const shopifyApiSecret = Deno.env.get('SHOPIFY_API_SECRET')!;
    const appUrl = Deno.env.get('APP_URL')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Install route - redirect to Shopify OAuth
    if (pathname.includes('/install')) {
      const shop = url.searchParams.get('shop');
      
      if (!shop) {
        return new Response('Missing shop parameter', { status: 400, headers: corsHeaders });
      }

      // Validate shop domain
      if (!shop.endsWith('.myshopify.com')) {
        return new Response('Invalid shop domain', { status: 400, headers: corsHeaders });
      }

      const scopes = [
        'read_products',
        'write_products',
        'read_inventory',
        'write_price_rules',
      ].join(',');

      const redirectUri = `${appUrl}/api/shopify-auth/callback`;
      const nonce = crypto.randomUUID();

      // Store nonce for verification
      await supabase.from('shopify_shops').upsert({
        shop_domain: shop,
        nonce,
        is_active: false,
      }, {
        onConflict: 'shop_domain',
      });

      const authUrl = `https://${shop}/admin/oauth/authorize?` +
        `client_id=${shopifyApiKey}&` +
        `scope=${scopes}&` +
        `redirect_uri=${redirectUri}&` +
        `state=${nonce}`;

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': authUrl,
        },
      });
    }

    // OAuth callback route
    if (pathname.includes('/callback')) {
      const shop = url.searchParams.get('shop');
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!shop || !code || !state) {
        return new Response('Missing required parameters', { status: 400, headers: corsHeaders });
      }

      // Verify nonce
      const { data: shopData } = await supabase
        .from('shopify_shops')
        .select('nonce')
        .eq('shop_domain', shop)
        .maybeSingle();

      if (!shopData || shopData.nonce !== state) {
        return new Response('Invalid state parameter', { status: 403, headers: corsHeaders });
      }

      // Exchange code for access token
      const tokenUrl = `https://${shop}/admin/oauth/access_token`;
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: shopifyApiKey,
          client_secret: shopifyApiSecret,
          code,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange failed:', error);
        return new Response('Failed to obtain access token', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      const { access_token } = await tokenResponse.json();

      // Store access token
      await supabase.from('shopify_shops').upsert({
        shop_domain: shop,
        access_token,
        is_active: true,
        nonce: null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'shop_domain',
      });

      // Redirect to app
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${appUrl}?shop=${shop}&installed=true`,
        },
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
