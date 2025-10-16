export interface CategoryM {
  id?: number;
  name: string;
  description: string;
  url_image: string;
  created_at?: string;
}

export interface CategoryWithCount extends CategoryM {
  product_count: number;
}

export interface CategoryWithProducts extends CategoryM {
  products: ProductM[];
}
export interface CategoryCreate {
  name: string;
  description: string;
  url_image: string;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  url_image?: string;
}

export interface ApiError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}
export interface ProductM {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  url_image?: string;
  created_at?: string;
}