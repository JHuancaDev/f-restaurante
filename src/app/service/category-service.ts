import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { CategoryM, CategoryCreate, CategoryUpdate, CategoryWithCount, CategoryWithProducts } from '../models/categoryM';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly API_URL = environment.apiUrl;
  private categoriesSubject = new BehaviorSubject<CategoryM[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las categorías
   */
  getCategories(skip: number = 0, limit: number = 100): Observable<CategoryM[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<CategoryM[]>(`${this.API_URL}/categories/`, { params })
      .pipe(
        tap(categories => this.categoriesSubject.next(categories)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener categorías con conteo de productos
   */
  getCategoriesWithCounts(skip: number = 0, limit: number = 100): Observable<CategoryWithCount[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<CategoryWithCount[]>(
      `${this.API_URL}/categories/with-counts/`,
      { params }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Obtener una categoría por ID
   */
  getCategoryById(categoryId: number): Observable<CategoryM> {
    return this.http.get<CategoryM>(`${this.API_URL}/categories/${categoryId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener una categoría con sus productos
   */
  getCategoryWithProducts(categoryId: number): Observable<CategoryWithProducts> {
    return this.http.get<CategoryWithProducts>(
      `${this.API_URL}/categories/${categoryId}/with-products`
    ).pipe(catchError(this.handleError));
  }

  /**
   * Buscar categorías por nombre
   */
  searchCategories(name: string, skip: number = 0, limit: number = 100): Observable<CategoryM[]> {
    const params = new HttpParams()
      .set('name', name)
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<CategoryM[]>(`${this.API_URL}/categories/search/`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear una nueva categoría
   */
  createCategory(category: CategoryCreate): Observable<CategoryM> {
    return this.http.post<CategoryM>(`${this.API_URL}/categories/`, category)
      .pipe(
        tap(() => this.refreshCategories()),
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar una categoría existente
   */
  updateCategory(categoryId: number, category: CategoryUpdate): Observable<CategoryM> {
    return this.http.put<CategoryM>(
      `${this.API_URL}/categories/${categoryId}`,
      category
    ).pipe(
      tap(() => this.refreshCategories()),
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar una categoría
   */
  deleteCategory(categoryId: number): Observable<string> {
    return this.http.delete<string>(`${this.API_URL}/categories/${categoryId}`)
      .pipe(
        tap(() => this.refreshCategories()),
        catchError(this.handleError)
      );
  }

  /**
   * Refrescar la lista de categorías
   */
  private refreshCategories(): void {
    this.getCategories().subscribe();
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error?.detail) {
      // Error del API con formato específico
      if (Array.isArray(error.error.detail)) {
        errorMessage = error.error.detail.map((e: any) => e.msg).join(', ');
      } else if (typeof error.error.detail === 'string') {
        errorMessage = error.error.detail;
      }
    } else {
      // Error del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }

    console.error('Error en CategoryService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
