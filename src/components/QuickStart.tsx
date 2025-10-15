import { Zap, ExternalLink } from 'lucide-react';

export function QuickStart() {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg shadow-md p-6 border-2 border-emerald-200">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-7 h-7 text-emerald-600" />
        <h2 className="text-xl font-bold text-gray-900">Quick Start Checklist</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
            1
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Create Custom App in Shopify</p>
            <p className="text-sm text-gray-600 mt-1">
              Settings → Apps and sales channels → Develop apps → Create app
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Enable scopes: read_products, read_inventory
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
            2
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Copy Access Token</p>
            <p className="text-sm text-gray-600 mt-1">
              API credentials tab → Reveal Admin API access token
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
            3
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Connect Shop</p>
            <p className="text-sm text-gray-600 mt-1">
              Use the form above to connect your shop with the access token
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
            4
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Set Up Shopify Flow</p>
            <p className="text-sm text-gray-600 mt-1">
              Apps → Shopify Flow → Create workflow → Add HTTP request action
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
            5
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Add Conditions</p>
            <p className="text-sm text-gray-600 mt-1">
              Use in_stock_variants_count in Flow conditions to automate actions
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-emerald-200">
        <a
          href="https://help.shopify.com/en/manual/apps/apps-by-shopify/flow"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium transition"
        >
          <ExternalLink className="w-4 h-4" />
          Learn more about Shopify Flow
        </a>
      </div>
    </div>
  );
}
