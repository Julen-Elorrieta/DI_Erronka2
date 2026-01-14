import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService, Language } from '../../core/services/language.service';
import { UserRole } from '../../core/models/user.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    TranslateModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  currentLanguage = computed(() => this.languageService.getCurrentLanguage());
  availableLanguages: { code: Language, name: string, flag: string }[] = [];

  menuItems: MenuItem[] = [
    { label: 'MENU.HOME', icon: 'home', route: '/dashboard', roles: [UserRole.GOD, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
    { label: 'MENU.USERS', icon: 'people', route: '/users', roles: [UserRole.GOD, UserRole.ADMIN] },
    { label: 'MENU.MEETINGS', icon: 'event', route: '/meetings', roles: [UserRole.GOD, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
    { label: 'MENU.SCHEDULE', icon: 'schedule', route: '/schedule', roles: [UserRole.TEACHER, UserRole.STUDENT] },
    { label: 'MENU.STUDENTS', icon: 'school', route: '/students', roles: [UserRole.TEACHER] },
    { label: 'MENU.PROFILE', icon: 'person', route: '/profile', roles: [UserRole.GOD, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] }
  ];

  filteredMenuItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.menuItems.filter(item => item.roles.includes(user.role));
  });

  constructor(
    public authService: AuthService,
    public languageService: LanguageService,
    private router: Router
  ) {
    this.availableLanguages = this.languageService.getAvailableLanguages();
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  switchLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
