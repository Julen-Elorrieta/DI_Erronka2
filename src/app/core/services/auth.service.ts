import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { CryptoUtil } from '../utils/crypto.util';
import { environment } from '../../../environments/environment';

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

  constructor(private http: HttpClient) {
    this.initPublicKey();
  }

  /**
   * Inicializa la clave pública para cifrado de contraseñas
   * En producción, esta clave debe obtenerse del servidor
   */
  private async initPublicKey(): Promise<void> {
    try {
      const keyPair = await CryptoUtil.generateKeyPair();
      this.publicKey = keyPair.publicKey;
      console.log('🔐 Clave pública inicializada');
    } catch (error) {
      console.error('❌ Error inicializando clave pública:', error);
    }
  }

  /**
   * Realiza login con credenciales cifradas
   * @param username Nombre de usuario
   * @param password Contraseña en texto plano (se cifrará antes de enviar)
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      if (!this.publicKey) {
        console.error('❌ Clave pública no disponible');
        return false;
      }

      const encryptedPassword = await CryptoUtil.encryptWithPublicKey(
        this.publicKey,
        password
      );

      // Determinar si usar API real o datos mock
      let response: LoginResponse;
      
      if (this.USE_MOCK) {
        console.log('🔧 Modo desarrollo: Usando datos MOCK');
        response = await this.mockLogin(username, password);
      } else {
        console.log('🌐 Conectando a API real:', this.API_URL);
        // Petición real al servidor
        response = await this.http.post<LoginResponse>(
          `${this.API_URL}/login`,
          { username, encryptedPassword }
        ).toPromise() as LoginResponse;
      }

      if (response.success && response.user) {
        this.setSession(response.user, response.token || '');
        console.log('✅ Login exitoso:', response.user.username);
        return true;
      }

      console.warn('⚠️ Login fallido:', response.message);
      return false;
    } catch (error) {
      console.error('❌ Error en login:', error);
      return false;
    }
  }

  /**
   * MOCK: Simulación de autenticación
   * Se usa cuando enableMockData = true en environment
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
          surname: 'Secretaría',
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
          name: 'Juan',
          surname: 'Profesor',
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
          name: 'María',
          surname: 'Alumna',
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
      message: 'Usuario o contraseña incorrectos'
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
    console.log('👋 Sesión cerrada');
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
        console.log('✅ Sesión restaurada:', user.username);
      } catch (error) {
        console.error('❌ Error restaurando sesión:', error);
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
