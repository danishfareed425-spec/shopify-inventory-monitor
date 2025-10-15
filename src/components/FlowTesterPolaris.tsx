import { useState, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Text,
  BlockStack,
  Divider,
  InlineGrid,
} from '@shopify/polaris';

interface TestResult {
  product_id: string;
  total_variants: number;
  in_stock_variants_count: number;
  out_of_stock_variants_count: number;
  sample_price: string;
  sample_compare_at_price: string;
}

export function FlowTesterPolaris() {
  const [shopDomain, setShopDomain] = useState('');
  const [productId, setProductId] = useState('');
  const [percentageIncrease, setPercentageIncrease] = useState('50');
  const [stockThreshold, setStockThreshold] = useState('2');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-flow-trigger`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          shop_domain: shopDomain,
          product_id: productId,
          percentage_increase: parseInt(percentageIncrease),
          in_stock_threshold: parseInt(stockThreshold),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch variant count');
      }

      // Read data from custom headers
      const inStockCount = parseInt(response.headers.get('X-In-Stock-Count') || '0');
      const totalVariants = parseInt(response.headers.get('X-Total-Variants') || '0');
      const outOfStockCount = parseInt(response.headers.get('X-Out-Of-Stock-Count') || '0');
      const productIdFromHeader = response.headers.get('X-Product-Id') || productId;
      const samplePrice = response.headers.get('X-Sample-Price') || '0';
      const sampleCompareAtPrice = response.headers.get('X-Sample-Compare-At-Price') || 'Not Set';

      setResult({
        product_id: productIdFromHeader,
        total_variants: totalVariants,
        in_stock_variants_count: inStockCount,
        out_of_stock_variants_count: outOfStockCount,
        sample_price: samplePrice,
        sample_compare_at_price: sampleCompareAtPrice,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [shopDomain, productId, percentageIncrease, stockThreshold]);

  return (
    <Page title="Test Flow Trigger">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <FormLayout>
                <TextField
                  label="Shop Domain"
                  value={shopDomain}
                  onChange={setShopDomain}
                  placeholder="myshop.myshopify.com"
                  autoComplete="off"
                />

                <TextField
                  label="Product ID"
                  value={productId}
                  onChange={setProductId}
                  placeholder="8672895959238"
                  autoComplete="off"
                  type="text"
                />

                <TextField
                  label="Compare At Price Increase (%)"
                  value={percentageIncrease}
                  onChange={setPercentageIncrease}
                  placeholder="50"
                  autoComplete="off"
                  type="number"
                  helpText="Percentage to increase compare at price (e.g., 50 for 50% markup)"
                />

                <TextField
                  label="In Stock Threshold"
                  value={stockThreshold}
                  onChange={setStockThreshold}
                  placeholder="2"
                  autoComplete="off"
                  type="number"
                  helpText="Update pricing when in-stock count is at or below this number"
                />

                <Button
                  variant="primary"
                  onClick={handleTest}
                  loading={loading}
                  fullWidth
                >
                  Test Trigger
                </Button>
              </FormLayout>

              {result && (
                <BlockStack gap="400">
                  <Divider />
                  <Text as="h3" variant="headingMd">
                    Result
                  </Text>
                  
                  <InlineGrid columns={2} gap="200">
                    <Text as="p" tone="subdued">Product ID:</Text>
                    <Text as="p" fontWeight="semibold">{result.product_id}</Text>

                    <Text as="p" tone="subdued">Total Variants:</Text>
                    <Text as="p" fontWeight="semibold">{result.total_variants}</Text>

                    <Text as="p" tone="subdued">In Stock:</Text>
                    <Text as="p" fontWeight="semibold" tone="success">
                      {result.in_stock_variants_count}
                    </Text>

                    <Text as="p" tone="subdued">Out of Stock:</Text>
                    <Text as="p" fontWeight="semibold" tone="critical">
                      {result.out_of_stock_variants_count}
                    </Text>
                  </InlineGrid>

                  <Divider />

                  <InlineGrid columns={2} gap="200">
                    <Text as="p" tone="subdued">Sale Price:</Text>
                    <Text as="p" fontWeight="semibold" tone="info">
                      ${result.sample_price}
                    </Text>

                    <Text as="p" tone="subdued">Compare At Price:</Text>
                    <Text as="p" fontWeight="semibold" tone="magic">
                      {result.sample_compare_at_price === 'Not Set' 
                        ? result.sample_compare_at_price 
                        : `$${result.sample_compare_at_price}`}
                    </Text>
                  </InlineGrid>
                </BlockStack>
              )}

              {error && (
                <Banner tone="critical" title="Error">
                  {error}
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

