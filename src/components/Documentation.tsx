import { BookOpen, Code, Workflow, CheckSquare, Link as LinkIcon } from 'lucide-react';

export function Documentation() {
  const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-flow-trigger`;

  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-amber-600" />
        <h2 className="text-2xl font-bold text-gray-800">Complete Installation Guide</h2>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <div className="flex items-start gap-2">
          <CheckSquare className="w-5 h-5 text-blue-700 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">App is Already Hosted & Database Ready!</p>
            <p className="text-sm text-blue-800 mt-1">
              This app is live and using Supabase database. Just follow the steps below to connect your Shopify store.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Step 1: Create Custom App in Shopify</h3>
          </div>
          <div className="ml-7 space-y-3 text-gray-700">
            <p className="font-medium">In your Shopify Admin panel:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Go to <strong>Settings</strong> → <strong>Apps and sales channels</strong>
              </li>
              <li>
                Click <strong>"Develop apps"</strong> (you may need to enable custom app development first)
              </li>
              <li>
                Click <strong>"Create an app"</strong>
                <ul className="list-disc list-inside ml-6 mt-1 text-sm">
                  <li>App name: <code className="bg-gray-100 px-2 py-1 rounded">Inventory Flow Tracker</code></li>
                </ul>
              </li>
              <li>
                Click <strong>"Configure Admin API scopes"</strong>
                <ul className="list-disc list-inside ml-6 mt-1 text-sm">
                  <li>Enable: <code className="bg-gray-100 px-2 py-1 rounded">read_products</code></li>
                  <li>Enable: <code className="bg-gray-100 px-2 py-1 rounded">read_inventory</code></li>
                </ul>
              </li>
              <li>
                Click <strong>"Save"</strong> then click <strong>"Install app"</strong>
              </li>
              <li>
                In the <strong>"API credentials"</strong> tab, reveal and copy the <strong>"Admin API access token"</strong>
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                  <strong>Important:</strong> This token will only be shown once. Save it securely!
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Step 2: Connect Your Shop (Use Form Above)</h3>
          </div>
          <div className="ml-7 space-y-2 text-gray-700">
            <p>Use the <strong>"Connect Shopify Shop"</strong> form at the top of this page:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Shop Domain:</strong> Your shop's myshopify.com domain
                <div className="text-sm mt-1 ml-6">Example: <code className="bg-gray-100 px-2 py-1 rounded">mystore.myshopify.com</code></div>
              </li>
              <li>
                <strong>Access Token:</strong> The Admin API access token you copied in Step 1
              </li>
            </ul>
            <p className="mt-2">Click <strong>"Connect Shop"</strong> and you should see a success message.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Workflow className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Step 3: Set Up Shopify Flow Workflow</h3>
          </div>
          <div className="ml-7 space-y-3 text-gray-700">
            <p className="font-medium">In your Shopify Admin:</p>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                Go to <strong>Apps</strong> → Open <strong>Shopify Flow</strong>
                <div className="text-sm mt-1 ml-6 text-gray-600">
                  (Shopify Flow is free and included with all Shopify plans)
                </div>
              </li>
              <li>Click <strong>"Create workflow"</strong></li>
              <li>
                <strong>Select a Trigger:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 text-sm">
                  <li>Search for and select: <strong>"Product inventory quantity changed"</strong></li>
                </ul>
              </li>
              <li>
                <strong>Add an Action:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 text-sm space-y-1">
                  <li>Click the <strong>"+"</strong> button below the trigger</li>
                  <li>Search for and select: <strong>"Send HTTP request"</strong></li>
                </ul>
              </li>
              <li>
                <strong>Configure the HTTP Request:</strong>
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="font-medium text-sm">Method:</span>
                    <code className="ml-2 bg-white border border-gray-300 px-2 py-1 rounded text-sm">POST</code>
                  </div>
                  <div>
                    <span className="font-medium text-sm">URL:</span>
                    <div className="mt-1">
                      <code className="bg-white border border-gray-300 px-2 py-1 rounded text-xs break-all block">
                        {edgeFunctionUrl}
                      </code>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Body:</span>
                    <pre className="mt-1 bg-white border border-gray-300 p-3 rounded text-xs overflow-x-auto">
{`{
  "shop_domain": "{{shop.domain}}",
  "product_id": {{product.id}}
}`}
                    </pre>
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Note:</strong> The double curly braces are Flow variables - don't change them!
                    </div>
                  </div>
                </div>
              </li>
              <li>Click <strong>"Save"</strong> at the top right</li>
              <li>Toggle the workflow to <strong>"Active"</strong></li>
            </ol>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Step 4: Use the Response in Flow Conditions</h3>
          </div>
          <div className="ml-7 space-y-3 text-gray-700">
            <p>After the HTTP request action, the response data is available to use in your workflow:</p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="font-medium text-emerald-900 mb-2">Response Data Available:</p>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-emerald-300">
{`{
  "product_id": 123456789,
  "total_variants": 5,
  "in_stock_variants_count": 3,
  "out_of_stock_variants_count": 2,
  "shop_domain": "myshop.myshopify.com"
}`}
              </pre>
            </div>

            <p className="font-medium mt-4">Example Use Cases:</p>

            <div className="space-y-3 mt-2">
              <div className="border-l-4 border-red-400 pl-4 py-2 bg-red-50">
                <p className="font-medium text-sm text-red-900">Low Stock Alert</p>
                <p className="text-sm text-red-800 mt-1">
                  <strong>Condition:</strong> If <code className="bg-white px-2 py-0.5 rounded">in_stock_variants_count</code> is less than 3
                </p>
                <p className="text-sm text-red-800">
                  <strong>Action:</strong> Send email to inventory manager
                </p>
              </div>

              <div className="border-l-4 border-orange-400 pl-4 py-2 bg-orange-50">
                <p className="font-medium text-sm text-orange-900">Out of Stock</p>
                <p className="text-sm text-orange-800 mt-1">
                  <strong>Condition:</strong> If <code className="bg-white px-2 py-0.5 rounded">in_stock_variants_count</code> equals 0
                </p>
                <p className="text-sm text-orange-800">
                  <strong>Action:</strong> Add product tag "Out of Stock" and hide from storefront
                </p>
              </div>

              <div className="border-l-4 border-emerald-400 pl-4 py-2 bg-emerald-50">
                <p className="font-medium text-sm text-emerald-900">Well Stocked</p>
                <p className="text-sm text-emerald-800 mt-1">
                  <strong>Condition:</strong> If <code className="bg-white px-2 py-0.5 rounded">in_stock_variants_count</code> is greater than 10
                </p>
                <p className="text-sm text-emerald-800">
                  <strong>Action:</strong> Add product tag "Well Stocked"
                </p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50">
                <p className="font-medium text-sm text-blue-900">Restock Needed</p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Condition:</strong> If <code className="bg-white px-2 py-0.5 rounded">in_stock_variants_count</code> is between 1 and 5
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Action:</strong> Create a task in project management tool
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="font-medium text-sm">To add a condition in Flow:</p>
              <ol className="list-decimal list-inside text-sm space-y-1 ml-4 mt-2">
                <li>Click the <strong>"+"</strong> button after the HTTP request action</li>
                <li>Select <strong>"Condition"</strong></li>
                <li>Choose the response variable <code className="bg-gray-100 px-2 py-0.5 rounded">in_stock_variants_count</code></li>
                <li>Set your condition (equals, greater than, less than, etc.)</li>
                <li>Add actions for "Then" and "Otherwise" branches</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
