import { useState, useEffect } from 'react';
import { Store, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ShopifyShop } from '../types/shopify';

export function ShopSetup() {
  const [shopDomain, setShopDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectedShops, setConnectedShops] = useState<ShopifyShop[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadShops = async () => {
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
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

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
        setMessage({ type: 'success', text: 'Shop updated successfully!' });
      } else {
        const { error } = await supabase
          .from('shopify_shops')
          .insert({
            shop_domain: shopDomain,
            access_token: accessToken,
            is_active: true,
          });

        if (error) throw error;
        setMessage({ type: 'success', text: 'Shop connected successfully!' });
      }

      setShopDomain('');
      setAccessToken('');
      await loadShops();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to connect shop'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-800">Connect Shopify Shop</h2>
        </div>
        <button
          onClick={loadShops}
          disabled={loadingShops}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Refresh shops"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${loadingShops ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {connectedShops.length > 0 && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="font-medium text-emerald-900 mb-2">Connected Shops:</p>
          <div className="space-y-2">
            {connectedShops.map((shop) => (
              <div key={shop.id} className="flex items-center justify-between text-sm">
                <span className="text-emerald-800 font-mono">{shop.shop_domain}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  shop.is_active ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-200 text-gray-700'
                }`}>
                  {shop.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="shop-domain" className="block text-sm font-medium text-gray-700 mb-2">
            Shop Domain
          </label>
          <input
            id="shop-domain"
            type="text"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            placeholder="myshop.myshopify.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">
            If shop already exists, access token will be updated
          </p>
        </div>

        <div>
          <label htmlFor="access-token" className="block text-sm font-medium text-gray-700 mb-2">
            Access Token
          </label>
          <input
            id="access-token"
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="shpat_••••••••••••••••"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
          />
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-medium py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Connecting...' : 'Connect / Update Shop'}
        </button>
      </form>
    </div>
  );
}
