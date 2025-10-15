import { useState, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  BlockStack,
  Banner,
  List,
} from '@shopify/polaris';

export function InstallPage() {
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInstall = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate shop domain
      let domain = shopDomain.trim();
      if (!domain) {
        throw new Error('Please enter a shop domain');
      }

      // Remove https:// if present
      domain = domain.replace(/^https?:\/\//, '');
      
      // Add .myshopify.com if not present
      if (!domain.includes('.myshopify.com')) {
        domain = `${domain}.myshopify.com`;
      }

      // Redirect to OAuth install endpoint
      const installUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-auth/install?shop=${domain}`;
      window.location.href = installUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start installation');
      setLoading(false);
    }
  }, [shopDomain]);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text as="h1" variant="headingXl">
                  Inventory Monitor App
                </Text>
                <Text as="p" variant="bodyLg">
                  Automatically monitor inventory levels and adjust pricing when stock is low.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Features
                </Text>
                <List>
                  <List.Item>Real-time inventory monitoring</List.Item>
                  <List.Item>Automatic price adjustments when stock is low (1-2 variants)</List.Item>
                  <List.Item>Custom Shopify Flow actions</List.Item>
                  <List.Item>Easy integration with your existing workflows</List.Item>
                </List>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Install App
                </Text>

                {error && (
                  <Banner tone="critical" title="Installation Error">
                    {error}
                  </Banner>
                )}

                <FormLayout>
                  <TextField
                    label="Your Shopify Store"
                    value={shopDomain}
                    onChange={setShopDomain}
                    placeholder="mystore.myshopify.com"
                    autoComplete="off"
                    helpText="Enter your store's myshopify.com domain"
                  />

                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleInstall}
                    loading={loading}
                    fullWidth
                  >
                    Install App
                  </Button>
                </FormLayout>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

