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

  constructor(private http: HttpClient) {

  }

  /**
   * Login egiten du kredentzialekin zifratuta
   * @param username Erabiltzaile izena
   * @param password Pasahitza testu arruntean (bidali aurretik zifratuko da)
   */

  /**
   * Llama al backend para hacer login y guarda el usuario si es correcto
   */
  /**
   * Realiza login y maneja la navegación y el error desde el componente
   */
  login(username: string, password: string, router: Router, setLoginError: (loginError: boolean) => void): void {
    const apiUrl = Array.isArray(environment.apiUrl) ? environment.apiUrl.join('') : environment.apiUrl;
    this.http.post<any>(`${apiUrl}/login`, { username, password }).subscribe({
      next: (response: any) => {
        if (response.success) {
          setLoginError(false);
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

  /**
   * Comprueba si hay usuario logueado en localStorage
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
}
