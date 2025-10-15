import { useMemo } from 'react';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import '@shopify/polaris/build/esm/styles.css';

interface ShopifyAppProviderProps {
  children: React.ReactNode;
}

export function ShopifyAppProvider({ children }: ShopifyAppProviderProps) {
  // Get shop from URL params
  const shopOrigin = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shop');
    return shop || undefined;
  }, []);

  // Check if running in embedded mode (inside Shopify admin)
  const isEmbedded = useMemo(() => {
    return window.top !== window.self;
  }, []);

  const config = useMemo(
    () => ({
      apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || '',
      host: new URLSearchParams(window.location.search).get('host') || '',
      forceRedirect: true,
    }),
    []
  );

  // If embedded and we have config, use App Bridge
  if (isEmbedded && config.apiKey && config.host) {
    return (
      <AppBridgeProvider config={config}>
        <PolarisAppProvider i18n={{}}>
          {children}
        </PolarisAppProvider>
      </AppBridgeProvider>
    );
  }

  // Standalone mode (for testing or initial OAuth)
  return (
    <PolarisAppProvider i18n={{}}>
      {children}
    </PolarisAppProvider>
  );
}

