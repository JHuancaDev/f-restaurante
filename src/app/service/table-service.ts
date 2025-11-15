import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTableRequest, Table, UpdateTablePositionRequest, UpdateTableRequest } from '../models/table';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = environment.apiUrl + '/tables';

  constructor(private http: HttpClient) { }

  getTables(skip: number = 0, limit: number = 100, availableOnly: boolean = false): Observable<Table[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString())
      .set('available_only', availableOnly.toString());

    return this.http.get<Table[]>(`${this.apiUrl}/`, { params });
  }

  getAvailableTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${this.apiUrl}/available`);
  }

  getTableById(tableId: number): Observable<Table> {
    return this.http.get<Table>(`${this.apiUrl}/${tableId}`);
  }

  createTable(tableData: CreateTableRequest): Observable<Table> {
    return this.http.post<Table>(`${this.apiUrl}/`, tableData);
  }

  updateTable(tableId: number, tableData: UpdateTableRequest): Observable<Table> {
    return this.http.put<Table>(`${this.apiUrl}/${tableId}`, tableData);
  }

  deleteTable(tableId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${tableId}`);
  }

  updateTablePosition(tableId: number, positionData: UpdateTablePositionRequest): Observable<Table> {
    return this.http.patch<Table>(`${this.apiUrl}/${tableId}/position`, positionData);
  }
}