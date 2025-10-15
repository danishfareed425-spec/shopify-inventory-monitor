/*
  # Create Shopify Shops Table

  1. New Tables
    - `shopify_shops`
      - `id` (uuid, primary key) - Unique identifier for each shop record
      - `shop_domain` (text, unique) - The Shopify shop domain (e.g., myshop.myshopify.com)
      - `access_token` (text) - Encrypted access token for Shopify API calls
      - `is_active` (boolean) - Whether the app is currently installed
      - `created_at` (timestamptz) - When the shop was first connected
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `shopify_shops` table
    - Add policy for authenticated service access only
    
  3. Important Notes
    - This table stores Shopify shop credentials securely
    - Access tokens should be handled carefully and only accessed by edge functions
    - The shop_domain is unique to prevent duplicate installations
*/

CREATE TABLE IF NOT EXISTS shopify_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain text UNIQUE NOT NULL,
  access_token text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shopify_shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage shops"
  ON shopify_shops
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);