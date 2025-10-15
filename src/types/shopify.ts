export interface ShopifyShop {
  id: string;
  shop_domain: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlowTriggerPayload {
  shop_domain: string;
  product_id: number;
}

export interface FlowTriggerResponse {
  product_id: number;
  total_variants: number;
  in_stock_variants_count: number;
  out_of_stock_variants_count: number;
  shop_domain: string;
}
