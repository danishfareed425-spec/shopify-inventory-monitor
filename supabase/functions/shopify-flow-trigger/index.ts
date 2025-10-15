import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Expose-Headers': 'X-Product-Id, X-Total-Variants, X-In-Stock-Count, X-Out-Of-Stock-Count, X-Shop-Domain, X-Sample-Price, X-Sample-Compare-At-Price, X-Pricing-Updated, X-Percentage-Increase, X-Stock-Threshold',
};

interface InventoryLevel {
  inventory_item_id: number;
  available: number;
}

interface InventoryChangePayload {
  shop_domain: string;
  product_id: string;
  percentage_increase?: number;
  in_stock_threshold?: number;
  inventory_levels?: InventoryLevel[];
}

interface Variant {
  id: number;
  inventory_item_id: number;
  inventory_quantity: number;
  price: string;
  compare_at_price?: string;
}

interface Product {
  variants: Variant[];
}

function extractProductId(productId: string): string {
  if (/^\d+$/.test(productId)) {
    return productId;
  }
  
  const match = productId.match(/gid:\/\/shopify\/Product\/(\d+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return productId;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const payload: InventoryChangePayload = await req.json();
      let { shop_domain, product_id, percentage_increase, in_stock_threshold } = payload;

      const percentageIncrease = percentage_increase || 50;
      const stockThreshold = in_stock_threshold || 2;

      shop_domain = shop_domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      const numericProductId = extractProductId(product_id);

      let shopData: { shop_domain: string; access_token: string } | null = null;
      let actualShopDomain = shop_domain;
      
      const { data: data1 } = await supabase
        .from('shopify_shops')
        .select('shop_domain, access_token')
        .eq('shop_domain', shop_domain)
        .eq('is_active', true)
        .maybeSingle();
      
      if (data1) {
        shopData = data1;
        actualShopDomain = data1.shop_domain;
      } else {
        if (!shop_domain.includes('.myshopify.com')) {
          const baseDomain = shop_domain.replace(/\.[^.]+$/, '');
          const myshopifyDomain = `${baseDomain}.myshopify.com`;
          
          const { data: data2 } = await supabase
            .from('shopify_shops')
            .select('shop_domain, access_token')
            .eq('shop_domain', myshopifyDomain)
            .eq('is_active', true)
            .maybeSingle();
          
          if (data2) {
            shopData = data2;
            actualShopDomain = data2.shop_domain;
          }
        }
        
        if (!shopData) {
          const searchTerm = shop_domain.split('.')[0];
          const { data: data3 } = await supabase
            .from('shopify_shops')
            .select('shop_domain, access_token')
            .ilike('shop_domain', `${searchTerm}%`)
            .eq('is_active', true)
            .maybeSingle();
          
          if (data3) {
            shopData = data3;
            actualShopDomain = data3.shop_domain;
          }
        }
      }

      if (!shopData) {
        return new Response(
          JSON.stringify({ 
            error: 'Shop not found or inactive',
            searched_domain: shop_domain,
            hint: 'Make sure the shop is registered and active in the database'
          }),
          {
            status: 404,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const shopifyResponse = await fetch(
        `https://${actualShopDomain}/admin/api/2024-01/products/${numericProductId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': shopData.access_token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!shopifyResponse.ok) {
        const errorText = await shopifyResponse.text();
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch product data from Shopify',
            status: shopifyResponse.status,
            details: errorText
          }),
          {
            status: shopifyResponse.status,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const productData: { product: Product } = await shopifyResponse.json();
      const variants = productData.product.variants || [];

      console.log('Product data fetched:', {
        productId: numericProductId,
        variantsCount: variants.length,
        variants: variants
      });

      const inStockCount = variants.filter(
        (variant) => variant.inventory_quantity > 0
      ).length;

      let pricingUpdated = false;
      if (inStockCount <= stockThreshold) {
        console.log(`Low stock detected (${inStockCount} <= ${stockThreshold}). Updating compare_at_price with ${percentageIncrease}% increase...`);
        
        const multiplier = 1 + (percentageIncrease / 100);
        
        const updatePromises = variants.map(async (variant) => {
          const originalPrice = parseFloat(variant.price || '0');
          const compareAtPrice = (originalPrice * multiplier).toFixed(2);
          
          try {
            const updateResponse = await fetch(
              `https://${actualShopDomain}/admin/api/2024-01/variants/${variant.id}.json`,
              {
                method: 'PUT',
                headers: {
                  'X-Shopify-Access-Token': shopData.access_token,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  variant: {
                    id: variant.id,
                    compare_at_price: compareAtPrice,
                  },
                }),
              }
            );
            
            if (updateResponse.ok) {
              console.log(`Updated variant ${variant.id}: price ${originalPrice} -> compare_at ${compareAtPrice}`);
              return true;
            } else {
              console.error(`Failed to update variant ${variant.id}:`, await updateResponse.text());
              return false;
            }
          } catch (error) {
            console.error(`Error updating variant ${variant.id}:`, error);
            return false;
          }
        });
        
        const results = await Promise.all(updatePromises);
        pricingUpdated = results.some(result => result === true);
        
        console.log(`Pricing update completed. ${results.filter(r => r).length}/${results.length} variants updated successfully.`);
      }

      const firstVariant = variants[0];
      const samplePrice = firstVariant?.price || '0';
      const sampleCompareAtPrice = firstVariant?.compare_at_price || 'Not Set';

      const inStockCountText = inStockCount.toString();

      return new Response(inStockCountText, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain',
          'X-Product-Id': numericProductId,
          'X-Total-Variants': variants.length.toString(),
          'X-In-Stock-Count': inStockCount.toString(),
          'X-Out-Of-Stock-Count': (variants.length - inStockCount).toString(),
          'X-Shop-Domain': actualShopDomain,
          'X-Sample-Price': samplePrice,
          'X-Sample-Compare-At-Price': sampleCompareAtPrice,
          'X-Pricing-Updated': pricingUpdated.toString(),
          'X-Percentage-Increase': percentageIncrease.toString(),
          'X-Stock-Threshold': stockThreshold.toString(),
        },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
