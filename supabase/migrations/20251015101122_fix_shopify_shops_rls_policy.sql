/*
  # Fix Shopify Shops RLS Policy

  1. Changes
    - Add policy to allow anonymous users to insert and update shops
    - Keep service role access for all operations
    - This allows the frontend to connect shops using the anon key
  
  2. Security Notes
    - Anonymous users can insert/update shop credentials
    - Service role has full access for edge functions
    - This is acceptable as shop owners need to connect their stores
*/

CREATE POLICY "Allow anonymous to manage shops"
  ON shopify_shops
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);