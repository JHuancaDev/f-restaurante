// guards/login.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth-service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          return true;
        } else {
          this.router.navigate(['/order']);
          return false;
        }
      })
    );
  }
}