import { useState, useMemo } from 'react';
import {
  Page,
  Layout,
  Card,
  Tabs,
  BlockStack,
  Banner,
} from '@shopify/polaris';
import { FlowTesterPolaris } from './FlowTesterPolaris';
import { ShopSetupPolaris } from './ShopSetupPolaris';
import { Documentation } from './Documentation';

export function Dashboard() {
  const [selectedTab, setSelectedTab] = useState(0);

  // Check if app was just installed
  const justInstalled = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('installed') === 'true';
  }, []);

  const tabs = [
    {
      id: 'test',
      content: 'Test Trigger',
      panelID: 'test-panel',
    },
    {
      id: 'setup',
      content: 'Shop Setup',
      panelID: 'setup-panel',
    },
    {
      id: 'docs',
      content: 'Documentation',
      panelID: 'docs-panel',
    },
  ];

  return (
    <Page title="Inventory Monitor">
      <Layout>
        {justInstalled && (
          <Layout.Section>
            <Banner
              title="App installed successfully!"
              tone="success"
              onDismiss={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('installed');
                window.history.replaceState({}, '', url.toString());
              }}
            >
              Your shop is now connected. You can start using Shopify Flow actions.
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              <BlockStack gap="500">
                {selectedTab === 0 && <FlowTesterPolaris />}
                {selectedTab === 1 && <ShopSetupPolaris />}
                {selectedTab === 2 && <Documentation />}
              </BlockStack>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

