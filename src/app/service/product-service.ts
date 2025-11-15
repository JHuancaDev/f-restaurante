import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { ProductCreate, ProductFilters, ProductM, ProductUpdate } from '../models/product-m';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = environment.apiUrl; // Cambia según tu configuración
  private productsSubject = new BehaviorSubject<ProductM[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los productos con filtros opcionales
   */
  getProducts(filters: ProductFilters = {}): Observable<ProductM[]> {
    let params = new HttpParams()
      .set('skip', (filters.skip || 0).toString())
      .set('limit', (filters.limit || 100).toString())
      .set('available_only', (filters.available_only !== false).toString());

    if (filters.category_id) {
      params = params.set('category_id', filters.category_id.toString());
    }

    return this.http.get<ProductM[]>(`${this.API_URL}/products/`, { params })
      .pipe(
        tap(products => this.productsSubject.next(products)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener un producto por ID
   */
  getProductById(productId: number): Observable<ProductM> {
    return this.http.get<ProductM>(`${this.API_URL}/products/${productId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear un nuevo producto
   */
  createProduct(product: ProductCreate): Observable<ProductM> {
    return this.http.post<ProductM>(`${this.API_URL}/products/`, product)
      .pipe(
        tap(() => this.refreshProducts()),
        catchError(this.handleError),
      );
      
  }

  /**
   * Actualizar un producto existente
   */
  updateProduct(productId: number, product: ProductUpdate): Observable<ProductM> {
    return this.http.put<ProductM>(
      `${this.API_URL}/products/${productId}`,
      product
    ).pipe(
      tap(() => this.refreshProducts()),
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar un producto
   */
  deleteProduct(productId: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL}/products/${productId}`)
      .pipe(
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar stock de un producto
   */
  updateStock(productId: number, stockChange: number): Observable<string> {
    const params = new HttpParams().set('stock_change', stockChange.toString());

    return this.http.patch<string>(
      `${this.API_URL}/products/${productId}/stock`,
      null,
      { params }
    ).pipe(
      tap(() => this.refreshProducts()),
      catchError(this.handleError)
    );
  }

  /**
   * Filtrar productos por categoría
   */
  getProductsByCategory(categoryId: number): Observable<ProductM[]> {
    return this.getProducts({ category_id: categoryId });
  }

  /**
   * Filtrar solo productos disponibles
   */
  getAvailableProducts(): Observable<ProductM[]> {
    return this.getProducts({ available_only: true });
  }

  /**
   * Refrescar la lista de productos
   */
  private refreshProducts(): void {
    this.getProducts().subscribe();
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

    console.error('Error en ProductService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

}
