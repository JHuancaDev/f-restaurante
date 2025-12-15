export interface Review {
  id: number;
  product_id: number;
  rating: number;
  comment: string;
  user_id: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user_name: string;
  product_name: string;
  product_image: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: { [key: number]: number };
}