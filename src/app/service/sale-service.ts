import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateSaleRequest, Sale } from '../models/sale-m';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
    private apiUrl = 'http://localhost:8000/sales';

  constructor(private http: HttpClient) { }

  getSales(skip: number = 0, limit: number = 100): Observable<Sale[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<Sale[]>(`${this.apiUrl}/`, { params });
  }

  getMySales(skip: number = 0, limit: number = 100): Observable<Sale[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<Sale[]>(`${this.apiUrl}/my-sales`, { params });
  }

  getSaleById(saleId: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${saleId}`);
  }

  createSale(saleData: CreateSaleRequest): Observable<Sale> {
    return this.http.post<Sale>(`${this.apiUrl}/`, saleData);
  }

  updateSaleStatus(saleId: number, status: string): Observable<Sale> {
    let params = new HttpParams().set('status', status);
    return this.http.put<Sale>(`${this.apiUrl}/${saleId}/status`, {}, { params });
  }
}
