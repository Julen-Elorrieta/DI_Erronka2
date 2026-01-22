import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();
  public isLogged = false;

  constructor(private http: HttpClient) {

  }

  login(username: string, password: string, router: Router, setLoginError: (loginError: boolean) => void): void {
    const apiUrl = Array.isArray(environment.apiUrl) ? environment.apiUrl.join('') : environment.apiUrl;
    this.http.post<any>(`${apiUrl}/login`, { username, password }).subscribe({
      next: (response: any) => {
        if (response.success) {
          setLoginError(false);
          localStorage.setItem('user', JSON.stringify({ username }));
          this.isLogged = true;
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

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user') && this.isLogged === true;
  }
}
