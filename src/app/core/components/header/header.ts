/**
 * Header osagaia
 * Aplikazioaren goiburua, erabiltzaile menua eta hizkuntza aldaketa kudeatzen ditu
 */
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { LanguageService, Language } from '../../services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    TranslateModule,
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="toolbar-left" (click)="goToDashboard()" style="cursor: pointer;">
        <img 
          src="/assets/logo-elorrieta.webp" 
          alt="Elorrieta-Errekamari" 
          class="header-logo"
        />
      </div>

      <div class="toolbar-right">
        <button mat-icon-button [matMenuTriggerFor]="menu" class="profile-button">
          <div class="profile-avatar">
            <img [src]="getProfileImageUrl()" alt="Profile" class="profile-image" />
          </div>
        </button>

        <mat-menu #menu="matMenu" class="profile-menu">
          <div class="menu-header">
            <span class="user-name"
              >{{ currentUser()?.nombre }} {{ currentUser()?.apellidos }}</span
            >
            <span class="user-role">{{ getRoleLabel() }}</span>
          </div>
          <mat-divider></mat-divider>

          <button mat-menu-item (click)="goToProfile()">
            <mat-icon>person</mat-icon>
            <span>{{ 'MENU.PROFILE' | translate }}</span>
          </button>

          <button mat-menu-item [matMenuTriggerFor]="languageMenu">
            <mat-icon>language</mat-icon>
            <span>{{ 'MENU.LANGUAGE' | translate }}</span>
          </button>

          <mat-divider></mat-divider>

          <button mat-menu-item (click)="logout()" class="logout-button">
            <mat-icon>logout</mat-icon>
            <span>{{ 'MENU.LOGOUT' | translate }}</span>
          </button>
        </mat-menu>

        <!-- Submenú de idiomas -->
        <mat-menu #languageMenu="matMenu" class="language-menu">
          @for (lang of languages; track lang.code) {
            <button
              mat-menu-item
              (click)="changeLanguage(lang.code)"
              [class.active]="lang.code === languageService.currentLanguage()"
            >
              <span>{{ lang.name }}</span>
              @if (lang.code === languageService.currentLanguage()) {
                <mat-icon class="check-icon">check</mat-icon>
              }
            </button>
          }
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [
    `
      .header-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 64px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-logo {
        height: 50px;
        width: auto;
        max-width: 200px;
      }

      .app-title {
        font-size: 20px;
        font-weight: 500;
        color: white;
        cursor: pointer;
        transition: opacity 0.2s ease;
        user-select: none;
      }

      .app-title:hover {
        opacity: 0.8;
      }

      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .profile-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        transition: background 0.3s ease;
        padding: 0;
      }

      .profile-button:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .profile-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
      }

      .profile-image {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid white;
      }

      mat-icon {
        color: white;
      }

      .menu-header {
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .user-name {
        font-weight: 500;
        font-size: 14px;
        color: #333;
      }

      .user-role {
        font-size: 12px;
        color: #999;
      }

      .profile-menu::ng-deep .mat-mdc-menu-content {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }

      .logout-button {
        color: #d32f2f;
      }

      mat-divider {
        margin: 8px 0;
      }

      .current-lang {
        margin-left: auto;
        font-size: 12px;
        color: #999;
      }

      .language-menu button {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 150px;
      }

      .language-menu button span:first-child {
        flex: 1;
      }

      .language-menu button.active {
        background-color: rgba(63, 81, 181, 0.1);
      }

      .check-icon {
        margin-left: auto;
        color: #3f51b5;
        font-size: 20px;
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  /** Uneko erabiltzailearen signala */
  currentUser = signal<User | null>(null);
  
  /** Hizkuntza eskuragarrien zerrenda */
  languages: Language[];

  private authService = inject(AuthService);
  private router = inject(Router);
  languageService = inject(LanguageService);

  constructor() {
    this.languages = this.languageService.languages;
  }

  /** Hasieratu osagaia eta uneko erabiltzailea kargatu */
  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
  }

  /**
   * Erabiltzailearen rolaren etiketa euskaraz itzultzen du
   * @returns Rolaren izena
   */
  getRoleLabel(): string {
    const user = this.currentUser();
    if (!user) return '';

    // Rol mapa euskaraz
    const roleMap: { [key: number]: string } = {
      1: 'Jainkoa',          // GOD/Super Admin
      2: 'Administratzailea', // Admin
      3: 'Irakaslea',        // Irakaslea
      4: 'Ikaslea',          // Ikaslea
    };
    return roleMap[user.tipo_id] || 'Erabiltzailea';
  }

  /** Erabiltzailearen profil irudiaren URLa eskuratzen du */
  getProfileImageUrl(): string {
    const user = this.currentUser();
    return user?.argazkia_url || '/unknown.webp';
  }

  /** Uneko hizkuntza eskuratzen du */
  getCurrentLanguage(): Language | undefined {
    return this.languageService.getCurrentLanguage();
  }

  /** Hizkuntza aldatzen du */
  changeLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
  }

  /** Dashboard orrialdera nabigatu */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /** Profil orrialdera nabigatu */
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  /** Saioa itxi eta login orrialdera birbideratu */
  logout(): void {
    this.authService.logout(this.router);
  }
}
