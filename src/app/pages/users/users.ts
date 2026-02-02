import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { EditUserDialogComponent as EditUser } from './editUser';
import { User, getUserRoleFromTipoId, UserRole } from '../../core/models/user.model';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { ApiUtil } from '../../core/utils/api.util';

/**
 * Erabiltzaileen kudeaketa osagaia
 * Erabiltzaileak bistaratu, bilatu, editatu eta ezabatzeko aukera ematen du
 * GOD eta ADMIN rolak soilik sar daitezke
 */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users implements OnInit {
  getUserRoleFromTipoId = getUserRoleFromTipoId;
  users: User[] = [];
  filteredUsers = signal<User[]>([]);
  loading = signal(false);
  searchTerm = '';
  selectedRole: string | number = '';
  roles = [1, 2, 3, 4];
  pageSize = 10;
  pageIndex = 0;
  displayedColumns = ['photo', 'username', 'name', 'surname', 'email', 'dni', 'number', 'actions'];
  authService: AuthService = inject(AuthService);
  usersService: UsersService = inject(UsersService);
  router: Router = inject(Router);

  // Validación de permisos
  currentUserRole = signal<UserRole | null>(null);

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private dialog: MatDialog,
  ) {
    this.authenticate();
  }

  /**
   * Erabiltzailea autentikatuta dagoen eta baimena duen egiaztatzen du
   * GOD, ADMIN eta IRAKASLEA sar daitezke orri honetara (irakasleek irakurtzeko soilik)
   * IKASLEEK ezin dute sartu
   */
  authenticate(): void {
    const currentUser = this.authService.currentUser();
    if (!this.authService.isLoggedIn() || !currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const userRole = getUserRoleFromTipoId(currentUser.tipo_id);
    this.currentUserRole.set(userRole);

    // Ikasleak ezin dute sartu erabiltzaile orrira
    if (userRole === UserRole.STUDENT) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit() {
    this.selectedRole = '';
    this.loadUsers();
  }

  isAdmin(): boolean {
    const role = this.currentUserRole();
    return role === UserRole.GOD || role === UserRole.ADMIN;
  }

  isGod(): boolean {
    return this.currentUserRole() === UserRole.GOD;
  }

  openCreateDialog() {
    // Implement create dialog
  }

  onRoleChange(value: string | number) {
    this.selectedRole = value;
    this.getUsersByRole(value);
  }

  /**
   * Erabiltzaileak bilatzen ditu testua eta rolaren arabera
   * Izena, abizenak, username, email, NAN eta telefonoan bilatzen du
   */
  onSearch() {
    const searchLower = this.searchTerm.toLowerCase().trim();

    this.filteredUsers.set(
      this.users.filter((user) => {
        // Testu bidezko bilaketa iragazkia
        const matchesSearch =
          !searchLower ||
          user.nombre?.toLowerCase().includes(searchLower) ||
          user.apellidos?.toLowerCase().includes(searchLower) ||
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          (user.dni && user.dni.toLowerCase().includes(searchLower)) ||
          (user.telefono1 && user.telefono1.toString().includes(searchLower)) ||
          (user.telefono2 && user.telefono2.toString().includes(searchLower));

        // Rol iragazkia
        const matchesRole = this.selectedRole === '' || user.tipo_id === this.selectedRole;

        return matchesSearch && matchesRole;
      }),
    );

    // Paginazioa berrezarri bilatzean
    this.pageIndex = 0;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedRole = ''; // Cambiamos a string vacío
    this.filteredUsers.set(this.users);
    this.pageIndex = 0;
  }

  getPaginatedUsers(): User[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  }

  getPhotoUrl(user: User): string {
    return user.argazkia_url || '/unknown.webp';
  }

  getRoleClass(role: number): string {
    if (role === 1) return 'admin';
    if (role === 2) return 'user';
    return 'unknown';
  }

  canEdit(user: User): boolean {
    return this.isAdmin();
  }

  openEditDialog(user: User) {
    const dialogRef = this.dialog.open(EditUser, {
      data: user,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  getUsersByRole(role: number | string): void {
    this.loading.set(true);
    const url = ApiUtil.buildUrl('/filterUserByRole', role ? { tipo_id: role } : {});

    this.http.get<User[]>(url).subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.onSearch();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error filtering users by role:', err);
        this.loading.set(false);
      },
    });
  }

  /**
   * Erabiltzailea ezabatu daitekeen egiaztatzen du
   * Arauak:
   * - GOD-ek ezin du bere burua ezabatu
   * - Admin-ek ezin ditu GOD edo beste Admin-ak ezabatu
   * - Bakarrik GOD-ek eta Admin-ek ezabatu dezakete
   */
  canDelete(user: User): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // Bakarrik GOD (1) edo Admin (2) ezabatu dezake
    if (currentUser.tipo_id !== 1 && currentUser.tipo_id !== 2) return false;

    // Ezin du bere burua ezabatu
    if (currentUser.id === user.id) return false;

    // Admin-ek ezin ditu GOD-ak ezabatu
    if (currentUser.tipo_id === 2 && user.tipo_id === 1) return false;

    // Admin-ek ezin ditu beste Admin-ak ezabatu
    if (currentUser.tipo_id === 2 && user.tipo_id === 2) return false;

    return true;
  }

  deleteUser(user: User) {
    Swal.fire({
      title: this.translate.instant('USER.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('USER.DELETE_CONFIRM_TEXT', {
        nombre: `${user.nombre} ${user.apellidos}`,
      }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.YES_DELETE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(ApiUtil.buildUrl(`/deleteUser/${user.username}`)).subscribe({
          next: () => {
            console.log(`User ${user.username} deleted successfully.`);
            this.loadUsers();
            Swal.fire(
              this.translate.instant('USER.DELETE_SUCCESSFUL'),
              this.translate.instant('USER.DELETE_SUCCESSFUL_TEXT', {
                nombre: `${user.nombre} ${user.apellidos}`,
              }),
              'success',
            );
          },
          error: (err) => {
            console.error(`Error deleting user ${user.username}:`, err);
            Swal.fire(
              this.translate.instant('COMMON.ERROR'),
              this.translate.instant('USER.DELETE_ERROR', {
                nombre: `${user.nombre} ${user.apellidos}`,
              }),
              'error',
            );
          },
        });
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  private loadUsers() {
    this.loading.set(true);
    const url = ApiUtil.buildUrl('/users');
    this.http.get<User[]>(url).subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.filteredUsers.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading.set(false);
      },
    });
  }
}
