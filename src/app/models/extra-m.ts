export interface ExtraM {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_available: boolean;
  is_free: boolean;
  stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface OrderExtraM {
  id: number;
  order_id: number;
  extra_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  extra_name: string;
  extra_image: string | null;
  is_free: boolean;
  created_at: string;
}

export interface OrderExtraCreate {
  extra_id: number;
  quantity: number;
}

export interface ExtraCreate {
  name: string;
  description?: string | null;
  price: number;
  category: string;
  is_free?: boolean;
  stock?: number;
  image_url?: string | null;
}

export interface ExtraUpdate {
  name?: string;
  description?: string | null;
  price?: number;
  category?: string;
  is_available?: boolean;
  is_free?: boolean;
  stock?: number;
  image_url?: string | null;
}

export interface ExtraFilters {
  skip?: number;
  limit?: number;
  category?: string;
  available_only?: boolean;
  free_only?: boolean;
}