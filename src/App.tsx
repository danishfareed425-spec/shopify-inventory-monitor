import { useMemo } from 'react';
import { ShopifyAppProvider } from './components/ShopifyAppProvider';
import { InstallPage } from './components/InstallPage';
import { Dashboard } from './components/Dashboard';

function App() {
  // Determine which view to show based on URL params
  const currentView = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shop');
    const host = params.get('host');
    
    // If we have shop and host params, show dashboard (embedded or after OAuth)
    if (shop || host) {
      return 'dashboard';
    }
    
    // Otherwise show install page
    return 'install';
  }, []);

  return (
    <ShopifyAppProvider>
      {currentView === 'install' ? <InstallPage /> : <Dashboard />}
    </ShopifyAppProvider>
  );
}

export default App;
