// src/app/models/product.model.ts

export interface ProductM {
  id?: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url: string;
  stock: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCreate {
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url: string;
  stock: number;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  category_id?: number;
  image_url?: string;
  is_available?: boolean;
  stock?: number;
}

export interface ProductFilters {
  skip?: number;
  limit?: number;
  category_id?: number;
  available_only?: boolean;
}

// Para el dropdown de categorías
export interface CategoryOption {
  label: string;
  value: number;

}