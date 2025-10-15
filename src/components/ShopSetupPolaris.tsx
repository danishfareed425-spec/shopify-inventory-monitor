import { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  List,
  Badge,
  Text,
  BlockStack,
  InlineStack,
} from '@shopify/polaris';
import { supabase } from '../lib/supabase';

interface ShopifyShop {
  id: string;
  shop_domain: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function ShopSetupPolaris() {
  const [shopDomain, setShopDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectedShops, setConnectedShops] = useState<ShopifyShop[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [banner, setBanner] = useState<{ status: 'success' | 'critical'; message: string } | null>(null);

  const loadShops = useCallback(async () => {
    setLoadingShops(true);
    try {
      const { data, error } = await supabase
        .from('shopify_shops')
        .select('id, shop_domain, is_active, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnectedShops(data || []);
    } catch (error) {
      console.error('Failed to load shops:', error);
    } finally {
      setLoadingShops(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setBanner(null);

    try {
      const { data: existing } = await supabase
        .from('shopify_shops')
        .select('shop_domain')
        .eq('shop_domain', shopDomain)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('shopify_shops')
          .update({
            access_token: accessToken,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('shop_domain', shopDomain);

        if (error) throw error;
        setBanner({ status: 'success', message: 'Shop updated successfully!' });
      } else {
        const { error } = await supabase
          .from('shopify_shops')
          .insert({
            shop_domain: shopDomain,
            access_token: accessToken,
            is_active: true,
          });

        if (error) throw error;
        setBanner({ status: 'success', message: 'Shop connected successfully!' });
      }

      setShopDomain('');
      setAccessToken('');
      await loadShops();
    } catch (error) {
      setBanner({
        status: 'critical',
        message: error instanceof Error ? error.message : 'Failed to connect shop',
      });
    } finally {
      setLoading(false);
    }
  }, [shopDomain, accessToken, loadShops]);

  return (
    <Page title="Connect Shopify Shop">
      <Layout>
        {connectedShops.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Connected Shops
                </Text>
                <List>
                  {connectedShops.map((shop) => (
                    <List.Item key={shop.id}>
                      <InlineStack align="space-between">
                        <Text as="span" fontWeight="semibold">
                          {shop.shop_domain}
                        </Text>
                        <Badge tone={shop.is_active ? 'success' : 'attention'}>
                          {shop.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </InlineStack>
                    </List.Item>
                  ))}
                </List>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Manual Connection
              </Text>
              
              {banner && (
                <Banner
                  title={banner.message}
                  tone={banner.status}
                  onDismiss={() => setBanner(null)}
                />
              )}

              <FormLayout>
                <TextField
                  label="Shop Domain"
                  value={shopDomain}
                  onChange={setShopDomain}
                  placeholder="myshop.myshopify.com"
                  autoComplete="off"
                  helpText="If shop already exists, access token will be updated"
                />

                <TextField
                  label="Access Token"
                  value={accessToken}
                  onChange={setAccessToken}
                  placeholder="shpat_••••••••••••••••"
                  type="password"
                  autoComplete="off"
                />

                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  fullWidth
                >
                  Connect / Update Shop
                </Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

