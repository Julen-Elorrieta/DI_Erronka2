import { Component, OnInit, signal } from '@angular/core';
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
import { environment } from '../../../environments/environment';
import { EditUserDialogComponent as EditUser } from './editUser';
import { User } from '../../core/models/user.model';
import Swal from 'sweetalert2';

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
  users: User[] = []; // Populate with actual data
  filteredUsers = signal<User[]>([]);
  loading = signal(false);
  searchTerm = '';
  selectedRole: number | null = null;
  roles = [1, 2];
  pageSize = 10;
  pageIndex = 0;
  displayedColumns = ['photo', 'username', 'name', 'surname', 'email', 'dni', 'number', 'actions'];

  constructor(private http: HttpClient, private translate: TranslateService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadUsers();
  }

  isAdmin(): boolean {
    // Implement logic to check if current user is admin
    return true; // Placeholder
  }

  openCreateDialog() {
    // Implement create dialog
  }

  onSearch() {
    // Implement search logic
    this.filteredUsers.set(
      this.users.filter(
        (user) =>
          (user.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            user.apellidos.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            (user.dni && user.dni.toLowerCase().includes(this.searchTerm.toLowerCase()))) &&
          (this.selectedRole === null || user.tipo_id === this.selectedRole),
      ),
    );
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedRole = null;
    this.onSearch();
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
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  canDelete(user: User): boolean {
    return this.isAdmin();
  }

  deleteUser(user: User) {
    Swal.fire({
      title: this.translate.instant('USER.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('USER.DELETE_CONFIRM_TEXT', { nombre: `${user.nombre} ${user.apellidos}` }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.YES_DELETE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL'),
    }).then((result) => {
      if (result.isConfirmed) {
      const apiUrl = Array.isArray(environment.apiUrl)
        ? environment.apiUrl.join('')
        : environment.apiUrl;
      this.http.delete(`${apiUrl}/deleteUser/${user.username}`).subscribe({
        next: () => {
        console.log(`User ${user.username} deleted successfully.`);
        this.loadUsers();
        Swal.fire(this.translate.instant('USER.DELETE_SUCCESSFUL'), this.translate.instant('USER.DELETE_SUCCESSFUL_TEXT', { nombre: `${user.nombre} ${user.apellidos}` }), 'success');
        },
        error: (err) => {
        console.error(`Error deleting user ${user.username}:`, err);
        Swal.fire(this.translate.instant('COMMON.ERROR'), this.translate.instant('USER.DELETE_ERROR', { nombre: `${user.nombre} ${user.apellidos}` }), 'error');
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
    const apiUrl = Array.isArray(environment.apiUrl)
      ? environment.apiUrl.join('')
      : environment.apiUrl;
    this.http.get<User[]>(`${apiUrl}/users`).subscribe({
      next: (users: User[]) => {
        console.log('Usuarios cargados:', users);
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
