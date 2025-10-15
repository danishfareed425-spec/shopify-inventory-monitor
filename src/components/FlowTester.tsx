import { useState } from 'react';
import { PlayCircle, Loader2 } from 'lucide-react';

interface TestResult {
  product_id: string;
  total_variants: number;
  in_stock_variants_count: number;
  out_of_stock_variants_count: number;
  sample_price: string;
  sample_compare_at_price: string;
}

export function FlowTester() {
  const [shopDomain, setShopDomain] = useState('');
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <PlayCircle className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Test Flow Trigger</h2>
      </div>

      <form onSubmit={handleTest} className="space-y-5">
        <div>
          <label htmlFor="test-shop-domain" className="block text-sm font-medium text-gray-700 mb-2">
            Shop Domain
          </label>
          <input
            id="test-shop-domain"
            type="text"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            placeholder="myshop.myshopify.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label htmlFor="product-id" className="block text-sm font-medium text-gray-700 mb-2">
            Product ID
          </label>
          <input
            id="product-id"
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="123456789"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Trigger'
          )}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Result</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product ID:</span>
              <span className="font-medium text-gray-900">{result.product_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Variants:</span>
              <span className="font-medium text-gray-900">{result.total_variants}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Stock:</span>
              <span className="font-medium text-emerald-600">{result.in_stock_variants_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Out of Stock:</span>
              <span className="font-medium text-red-600">{result.out_of_stock_variants_count}</span>
            </div>
            <div className="border-t border-gray-300 my-2 pt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sale Price:</span>
                <span className="font-medium text-blue-600">${result.sample_price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compare At Price:</span>
                <span className="font-medium text-purple-600">{result.sample_compare_at_price === 'Not Set' ? result.sample_compare_at_price : `$${result.sample_compare_at_price}`}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
