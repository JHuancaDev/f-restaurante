import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
   private apiUrl = 'http://localhost:8000/users';

  constructor(private http: HttpClient) { }

  getUsers(skip: number = 0, limit: number = 100): Observable<User[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<User[]>(`${this.apiUrl}/`, { params });
  }
}
