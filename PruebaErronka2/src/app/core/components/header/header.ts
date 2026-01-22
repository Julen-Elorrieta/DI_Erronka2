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
    TranslateModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="toolbar-left">
        <span class="app-title">Elorrieta-Errekamari</span>
      </div>
      
      <div class="toolbar-right">
        <button mat-icon-button [matMenuTriggerFor]="menu" class="profile-button">
          <div class="profile-avatar">
            <img 
              [src]="getProfileImageUrl()" 
              alt="Profile"
              class="profile-image"
            >
          </div>
        </button>
        
        <mat-menu #menu="matMenu" class="profile-menu">
          <div class="menu-header">
            <span class="user-name">{{ currentUser()?.nombre }} {{ currentUser()?.apellidos }}</span>
            <span class="user-role">{{ getRoleLabel() }}</span>
          </div>
          <mat-divider></mat-divider>
          
          <button mat-menu-item (click)="goToProfile()">
            <mat-icon>person</mat-icon>
            <span>{{ 'MENU.PROFILE' | translate }}</span>
          </button>
          
          <mat-divider></mat-divider>
          
          <button mat-menu-item (click)="logout()" class="logout-button">
            <mat-icon>logout</mat-icon>
            <span>{{ 'MENU.LOGOUT' | translate }}</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-left {
      display: flex;
      align-items: center;
    }

    .app-title {
      font-size: 20px;
      font-weight: 500;
      color: white;
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
  `]
})
export class HeaderComponent implements OnInit {
  currentUser = signal<User | null>(null);
  
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
  }

  getRoleLabel(): string {
    const user = this.currentUser();
    if (!user) return '';
    
    const roleMap: { [key: number]: string } = {
      1: 'GOD',
      2: 'Admin',
      3: 'Profesor',
      4: 'Alumno'
    };
    return roleMap[user.tipo_id] || 'User';
  }

  getProfileImageUrl(): string {
    const user = this.currentUser();
    return user?.argazkia_url || '/unknown.webp';
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout(this.router);
  }
}
