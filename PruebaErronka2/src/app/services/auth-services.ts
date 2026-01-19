import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User, UserRole } from '../core/models/user.model';
import { CryptoUtil } from '../utils/crypto.util';
import { environment } from '../../environments/environment';

interface LoginRequest {
  username: string;
  encryptedPassword: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly STORAGE_KEY = 'eloradmin_user';
  private readonly TOKEN_KEY = 'eloradmin_token';
  private readonly USE_MOCK = environment.production ? false : (environment as any).enableMockData ?? true;
  
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();
  
  private publicKey: CryptoKey | null = null;

  private isLoggedIn = false;

  constructor(private http: HttpClient) {
    this.initPublicKey();
  }

  /**
   * Gako publikoa hasieratzen du pasahitzak zifratzeko
   * Produkzioan, gako hau zerbitzaritik lortu behar da
   */
  private async initPublicKey(): Promise<void> {
    try {
      const keyPair = await CryptoUtil.generateKeyPair();
      this.publicKey = keyPair.publicKey;
      console.log('[INFO] Gako publikoa hasieratuta');
    } catch (error) {
      console.error('[ERROREA] Gako publikoa hasieratzean:', error);
    }
  }

  /**
   * Login egiten du kredentzialekin zifratuta
   * @param username Erabiltzaile izena
   * @param password Pasahitza testu arruntean (bidali aurretik zifratuko da)
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      if (!this.publicKey) {
        console.error('[ERROREA] Gako publikoa ez dago eskuragarri');
        return false;
      }

      const encryptedPassword = await CryptoUtil.encryptWithPublicKey(
        this.publicKey,
        password
      );

      // API erreala edo mock datuak erabili erabakitzeko
      let response: LoginResponse;
      
      if (this.USE_MOCK) {
        console.log('[INFO] Garapen modua: MOCK datuak erabiltzen');
        response = await this.mockLogin(username, password);
      } else {
        console.log('[INFO] API errealerako konektatzen:', this.API_URL);
        // Zerbitzarirako benetako eskaera
        response = await this.http.post<LoginResponse>(
          `${this.API_URL}/login`,
          { username, encryptedPassword }
        ).toPromise() as LoginResponse;
      }

      if (response.success && response.user) {
        this.setSession(response.user, response.token || '');
        console.log('[ONDO] Login egina:', response.user.username);
        this.isLoggedIn = true;
        return true;
      }

      console.warn('[ABISUA] Login huts egin du:', response.message);
      return false;
    } catch (error) {
      console.error('[ERROREA] Login-ean:', error);
      return false;
    }
  }

  /**
   * MOCK: Autentifikazioaren simulazioa
   * enableMockData = true denean erabiltzen da environment-ean
   */
  private async mockLogin(username: string, password: string): Promise<LoginResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUsers: Record<string, { user: User; password: string }> = {
      'god': {
        password: 'god123',
        user: {
          id: 1,
          username: 'god',
          email: 'god@elorrieta.com',
          name: 'Super',
          surname: 'Admin',
          role: UserRole.GOD,
          photo: 'unknown.jpg'
        }
      },
      'admin': {
        password: 'admin123',
        user: {
          id: 2,
          username: 'admin',
          email: 'admin@elorrieta.com',
          name: 'Admin',
          surname: 'Idazkaritza',
          role: UserRole.ADMIN,
          photo: 'unknown.jpg'
        }
      },
      'teacher': {
        password: 'teacher123',
        user: {
          id: 3,
          username: 'teacher',
          email: 'teacher@elorrieta.com',
          name: 'Jon',
          surname: 'Irakaslea',
          role: UserRole.TEACHER,
          photo: 'unknown.jpg'
        }
      },
      'student': {
        password: 'student123',
        user: {
          id: 4,
          username: 'student',
          email: 'student@elorrieta.com',
          name: 'Miren',
          surname: 'Ikaslea',
          role: UserRole.STUDENT,
          photo: 'unknown.jpg',
          cycle: '2DAM',
          course: '2º',
          isDual: false,
          group: 'D'
        }
      }
    };

    const mockUser = mockUsers[username.toLowerCase()];
    
    if (mockUser && mockUser.password === password) {
      return {
        success: true,
        user: mockUser.user,
        token: `mock-token-${username}-${Date.now()}`
      };
    }

    return {
      success: false,
      message: 'Erabiltzaile edo pasahitz okerra'
    };
  }

  private setSession(user: User, token: string): void {
    this.currentUserSignal.set(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    console.log('[INFO] Saioa itxita');
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUserSignal();
    return user ? roles.includes(user.role) : false;
  }

  canDeleteUser(targetUser: User): boolean {
    const currentUser = this.currentUserSignal();
    
    if (!currentUser) return false;
    if (targetUser.role === UserRole.GOD) return false;
    if (targetUser.id === currentUser.id) return false;
    if (currentUser.role === UserRole.GOD) return true;
    
    return false;
  }

  loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (userJson && token) {
      try {
        const user = JSON.parse(userJson) as User;
        this.currentUserSignal.set(user);
        console.log('[ONDO] Saioa berrezarrita:', user.username);
      } catch (error) {
        console.error('[ERROREA] Saioa berrezartzean:', error);
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
