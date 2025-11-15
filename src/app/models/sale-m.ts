export interface SaleItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  id?: number;
  subtotal?: number;
  product_name?: string;
}

export interface Sale {
  id: number;
  user_id: number;
  total_amount: number;
  payment_method: string;
  status: string;
  notes?: string;
  created_at: string;
  items: SaleItem[];
}

export interface CreateSaleRequest {
  payment_method: string;
  notes?: string;
  items: SaleItem[];
}

export interface UpdateSaleStatusRequest {
  status: string;
}