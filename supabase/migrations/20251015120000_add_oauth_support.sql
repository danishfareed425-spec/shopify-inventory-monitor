-- Add nonce column for OAuth state verification
ALTER TABLE shopify_shops 
ADD COLUMN IF NOT EXISTS nonce TEXT;

-- Add index on nonce for faster lookups
CREATE INDEX IF NOT EXISTS idx_shopify_shops_nonce ON shopify_shops(nonce);

-- Add comment
COMMENT ON COLUMN shopify_shops.nonce IS 'Temporary nonce used during OAuth flow for state verification';

