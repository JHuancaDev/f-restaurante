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
  * Crear un nuevo producto sin imagen (usando URL)
  */
  createProduct(product: ProductCreate): Observable<ProductM> {
    const formData = new FormData();

    formData.append('name', product.name);
    formData.append('description', product.description || '');
    formData.append('price', product.price.toString());
    formData.append('category_id', product.category_id.toString());
    formData.append('stock', product.stock.toString());

    if (product.image_url) {
      formData.append('image_url', product.image_url);
    }

    return this.http.post<ProductM>(`${this.API_URL}/products/`, formData)
      .pipe(
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

   searchProducts(params: {
    q: string;
    category_id?: number;
    available_only?: boolean;
    skip?: number;
    limit?: number;
  }): Observable<ProductM[]> {
    let httpParams = new HttpParams()
      .set('q', params.q)
      .set('skip', (params.skip || 0).toString())
      .set('limit', (params.limit || 100).toString())
      .set('available_only', (params.available_only !== false).toString());

    if (params.category_id) {
      httpParams = httpParams.set('category_id', params.category_id.toString());
    }

    return this.http.get<ProductM[]>(`${this.API_URL}/products/search`, { 
      params: httpParams 
    })
    .pipe(
      tap(products => this.productsSubject.next(products)),
      catchError(this.handleError)
    );
  }


  /**
 * Actualizar un producto existente CON IMAGEN
 */
  updateProductWithImage(
    productId: number,
    productData: ProductUpdate,
    imageFile?: File
  ): Observable<ProductM> {
    const formData = new FormData();

    // Agregar campos del producto
    if (productData.name !== undefined) {
      formData.append('name', productData.name);
    }
    if (productData.description !== undefined) {
      formData.append('description', productData.description);
    }
    if (productData.price !== undefined) {
      formData.append('price', productData.price.toString());
    }
    if (productData.category_id !== undefined) {
      formData.append('category_id', productData.category_id.toString());
    }
    if (productData.stock !== undefined) {
      formData.append('stock', productData.stock.toString());
    }
    if (productData.is_available !== undefined) {
      formData.append('is_available', productData.is_available.toString());
    }

    // Agregar archivo de imagen si existe
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }

    return this.http.put<ProductM>(`${this.API_URL}/products/${productId}`, formData)
      .pipe(
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }


  /**
 * Actualizar solo la imagen del producto
 */
  updateProductImage(productId: number, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile, imageFile.name);

    return this.http.patch<any>(`${this.API_URL}/products/${productId}/image`, formData)
      .pipe(
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  /**
   * Crear un nuevo producto CON IMAGEN
   */
  createProductWithImage(productData: ProductCreate, imageFile?: File): Observable<ProductM> {
    const formData = new FormData();

    // Agregar campos del producto
    formData.append('name', productData.name);
    formData.append('description', productData.description || '');
    formData.append('price', productData.price.toString());
    formData.append('category_id', productData.category_id.toString());
    formData.append('stock', productData.stock.toString());

    // Agregar archivo de imagen si existe
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }

    return this.http.post<ProductM>(`${this.API_URL}/products/`, formData)
      .pipe(
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un producto existente (método anterior para compatibilidad)
   */
  updateProduct(productId: number, product: ProductUpdate): Observable<ProductM> {
    // Si el producto tiene image_url, usar FormData
    if (product.image_url) {
      const formData = new FormData();

      if (product.name !== undefined) {
        formData.append('name', product.name);
      }
      if (product.description !== undefined) {
        formData.append('description', product.description);
      }
      if (product.price !== undefined) {
        formData.append('price', product.price.toString());
      }
      if (product.category_id !== undefined) {
        formData.append('category_id', product.category_id.toString());
      }
      if (product.stock !== undefined) {
        formData.append('stock', product.stock.toString());
      }
      if (product.is_available !== undefined) {
        formData.append('is_available', product.is_available.toString());
      }
      if (product.image_url !== undefined) {
        formData.append('image_url', product.image_url);
      }

      return this.http.put<ProductM>(`${this.API_URL}/products/${productId}`, formData)
        .pipe(
          tap(() => this.refreshProducts()),
          catchError(this.handleError)
        );
    }

    // Si no hay imagen, usar JSON normal
    return this.http.put<ProductM>(`${this.API_URL}/products/${productId}`, product)
      .pipe(
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar un producto
   */
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/products/${productId}`)
      .pipe(
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar stock de un producto
   */
  /**
    * Actualizar stock de un producto
    */
  updateStock(productId: number, stockChange: number): Observable<any> {
    const params = new HttpParams().set('stock_change', stockChange.toString());

    return this.http.patch<any>(
      `${this.API_URL}/products/${productId}/stock`,
      null,
      { params }
    ).pipe(
      tap(() => this.refreshProducts()),
      catchError(this.handleError)
    );
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



}
