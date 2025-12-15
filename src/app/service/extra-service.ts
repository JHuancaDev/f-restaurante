import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ExtraCreate, ExtraFilters, ExtraM, ExtraUpdate, OrderExtraCreate, OrderExtraM } from '../models/extra-m';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExtraService {
  private readonly API_URL = `${environment.apiUrl}/extras`;
  private extrasSubject = new BehaviorSubject<ExtraM[]>([]);
  public extras$ = this.extrasSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los extras con filtros opcionales
   */
  getExtras(filters: ExtraFilters = {}): Observable<ExtraM[]> {
    let params = new HttpParams()
      .set('skip', (filters.skip || 0).toString())
      .set('limit', (filters.limit || 100).toString())
      .set('available_only', (filters.available_only !== false).toString())
      .set('free_only', (filters.free_only || false).toString());

    if (filters.category) {
      params = params.set('category', filters.category);
    }

    return this.http.get<ExtraM[]>(this.API_URL, { params })
      .pipe(
        tap(extras => this.extrasSubject.next(extras)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener un extra por ID
   */
  getExtraById(extraId: number): Observable<ExtraM> {
    return this.http.get<ExtraM>(`${this.API_URL}/${extraId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear un nuevo extra (solo administradores)
   */
  createExtra(extra: ExtraCreate): Observable<ExtraM> {
    return this.http.post<ExtraM>(this.API_URL, extra)
      .pipe(
        tap(() => this.refreshExtras()),
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un extra existente (solo administradores)
   */
  updateExtra(extraId: number, extra: ExtraUpdate): Observable<ExtraM> {
    return this.http.put<ExtraM>(`${this.API_URL}/${extraId}`, extra)
      .pipe(
        tap(() => this.refreshExtras()),
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar un extra (solo administradores)
   */
  deleteExtra(extraId: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${extraId}`)
      .pipe(
        tap(() => this.refreshExtras()),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener extras de una orden específica
   */
  getOrderExtras(orderId: number): Observable<OrderExtraM[]> {
    return this.http.get<OrderExtraM[]>(`${this.API_URL}/order/${orderId}/extras`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Añadir extras a una orden existente
   */
  addExtrasToOrder(orderId: number, extras: OrderExtraCreate[]): Observable<OrderExtraM[]> {
    return this.http.post<OrderExtraM[]>(`${this.API_URL}/order/${orderId}/extras`, extras)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar un extra de una orden
   */
  removeExtraFromOrder(orderExtraId: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/order-extra/${orderExtraId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Filtrar extras por categoría
   */
  getExtrasByCategory(category: string): Observable<ExtraM[]> {
    return this.getExtras({ category, available_only: true });
  }

  /**
   * Obtener solo extras gratuitos
   */
  getFreeExtras(): Observable<ExtraM[]> {
    return this.getExtras({ free_only: true, available_only: true });
  }

  /**
   * Obtener extras disponibles
   */
  getAvailableExtras(): Observable<ExtraM[]> {
    return this.getExtras({ available_only: true });
  }

  /**
   * Refrescar la lista de extras
   */
  private refreshExtras(): void {
    this.getExtras().subscribe();
  }

  /**
   * Manejo de errores
   */
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

    console.error('Error en ExtraService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
