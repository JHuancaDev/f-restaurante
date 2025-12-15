import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderExtraM } from '../models/extra-m';


export interface OrderM {
  id: number;
  order_type: string;
  table_id: number;
  delivery_address: string;
  special_instructions: string;
  user_id: number;
  status: string;
  total_amount: number;
  estimated_time: number;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  extras?: OrderExtraM[];
  
  table_number: number;
  table_capacity: number;
  user_name: string;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  special_instructions: string;
  id: number;
  unit_price: number;
  subtotal: number;
  product_name: string;
  product_image: string;
  product_description?: string;
}


export interface OrderUpdate {
  status?: string;
  special_instructions?: string;
  delivery_address?: string;
  estimated_time?: number;
  is_paid?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
   private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  // Obtener todas las órdenes (admin)
  getAllOrders(skip: number = 0, limit: number = 100): Observable<OrderM[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<OrderM[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // Obtener orden por ID
  getOrderById(orderId: number): Observable<OrderM> {
    return this.http.get<OrderM>(`${this.apiUrl}/${orderId}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener órdenes de un usuario específico
  getOrdersByUserId(userId: number, skip: number = 0, limit: number = 100): Observable<OrderM[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    // Nota: Necesitarías implementar este endpoint en el backend
    return this.http.get<OrderM[]>(`${this.apiUrl}/user/${userId}`, { params })
      .pipe(catchError(this.handleError));
  }

  // Actualizar estado de la orden
  updateOrderStatus(orderId: number, status: string): Observable<OrderM> {
    return this.http.patch<OrderM>(`${this.apiUrl}/${orderId}/status`, null, {
      params: { status }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar orden completa
  updateOrder(orderId: number, orderData: OrderUpdate): Observable<OrderM> {
    return this.http.put<OrderM>(`${this.apiUrl}/${orderId}`, orderData)
      .pipe(catchError(this.handleError));
  }

  // Marcar como pagado
  markAsPaid(orderId: number): Observable<OrderM> {
    return this.updateOrder(orderId, { is_paid: true });
  }

  // Eliminar orden
  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${orderId}`)
      .pipe(catchError(this.handleError));
  }

  // Filtrar órdenes por estado
  getOrdersByStatus(status: string, skip: number = 0, limit: number = 100): Observable<OrderM[]> {
    const params = new HttpParams()
      .set('status', status)
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    // Nota: Necesitarías implementar este endpoint en el backend
    return this.http.get<OrderM[]>(`${this.apiUrl}/status/${status}`, { params })
      .pipe(catchError(this.handleError));
  }

  // Filtrar órdenes por tipo
  getOrdersByType(orderType: string, skip: number = 0, limit: number = 100): Observable<OrderM[]> {
    const params = new HttpParams()
      .set('type', orderType)
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    // Nota: Necesitarías implementar este endpoint en el backend
    return this.http.get<OrderM[]>(`${this.apiUrl}/type/${orderType}`, { params })
      .pipe(catchError(this.handleError));
  }

  // Buscar órdenes por nombre de cliente
  searchOrdersByUserName(userName: string, skip: number = 0, limit: number = 100): Observable<OrderM[]> {
    const params = new HttpParams()
      .set('user_name', userName)
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    // Nota: Necesitarías implementar este endpoint en el backend
    return this.http.get<OrderM[]>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error?.detail) {
      if (Array.isArray(error.error.detail)) {
        errorMessage = error.error.detail.map((e: any) => e.msg).join(', ');
      } else if (typeof error.error.detail === 'string') {
        errorMessage = error.error.detail;
      }
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }

    console.error('Error en OrderService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
