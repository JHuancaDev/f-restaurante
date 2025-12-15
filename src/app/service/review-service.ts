import { Injectable } from '@angular/core';
import { Review, ReviewStats } from '../models/review-m';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) { }

  // Obtener todas las reseñas (admin)
  getAllReviews(skip: number = 0, limit: number = 100, approvedOnly: boolean = false): Observable<Review[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString())
      .set('approved_only', approvedOnly.toString());

    return this.http.get<Review[]>(`${this.apiUrl}/admin/all`, { params });
  }

  // Aprobar una reseña
  approveReview(reviewId: number): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/${reviewId}/approve`, {});
  }

  // Actualizar una reseña
  updateReview(reviewId: number, data: { rating?: number; comment?: string; is_approved?: boolean }): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${reviewId}`, data);
  }

  // Eliminar una reseña
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }

  // Obtener estadísticas de producto
  getProductStats(productId: number): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(`${this.apiUrl}/product/${productId}/stats`);
  }

  // Obtener reseña específica
  getReview(reviewId: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${reviewId}`);
  }
}
