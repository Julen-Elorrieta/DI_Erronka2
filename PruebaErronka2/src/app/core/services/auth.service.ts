import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.clearAuth();
      }
    }
  }

  login(username: string, password: string, router: Router, setLoginError: (loginError: boolean) => void): void {
    const apiUrl = Array.isArray(environment.apiUrl) ? environment.apiUrl.join('') : environment.apiUrl;
    
    this.http.post<any>(`${apiUrl}/login`, { username, password }).subscribe({
      next: (response: any) => {
        if (response.success && response.token) {
          setLoginError(false);
          
          // Guardar token y usuario en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          this.currentUserSignal.set(response.user);
          router.navigate(['/dashboard']);
        } else {
          setLoginError(true);
        }
      },
      error: (err) => {
        console.error('Error during authentication:', err);
        setLoginError(true);
      }
    });
  }

  // Verificar el token con el backend
  verifyToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return of(false);
    }

    const apiUrl = Array.isArray(environment.apiUrl) ? environment.apiUrl.join('') : environment.apiUrl;
    
    return this.http.get<any>(`${apiUrl}/verify-token`).pipe(
      map(response => {
        if (response.success) {
          this.currentUserSignal.set(response.user);
          return true;
        }
        this.clearAuth();
        return false;
      }),
      catchError(() => {
        this.clearAuth();
        return of(false);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token') && !!localStorage.getItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSignal.set(null);
  }

  logout(router?: Router): void {
    this.clearAuth();
    if (router) {
      router.navigate(['/login']);
    }
  }
}