import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { User, UserRole } from '../../core/models/user.model';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { UserFormDialogComponent } from './user-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  loading = signal(false);
  
  // Filtros
  searchTerm = '';
  selectedRole: UserRole | '' = '';
  
  displayedColumns: string[] = ['photo', 'name', 'email', 'role', 'actions'];
  
  // Paginación
  pageSize = 10;
  pageIndex = 0;
  
  roles = Object.values(UserRole);
  UserRole = UserRole;

  isGod = computed(() => this.authService.currentUser()?.role === UserRole.GOD);
  isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === UserRole.GOD || role === UserRole.ADMIN;
  });

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.loading.set(false);
        this.showError('Error al cargar usuarios');
      }
    });
  }

  applyFilters(): void {
    let filtered = this.users();
    
    // Filtro por rol
    if (this.selectedRole) {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }
    
    // Filtro por búsqueda (nombre, apellido, email)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.surname.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term)
      );
    }
    
    this.filteredUsers.set(filtered);
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.pageIndex = 0;
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedUsers(): User[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { user: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usersService.createUser(result).subscribe({
          next: () => {
            this.showSuccess('Usuario creado correctamente');
            this.loadUsers();
          },
          error: () => this.showError('Error al crear usuario')
        });
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { user, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usersService.updateUser(user.id, result).subscribe({
          next: () => {
            this.showSuccess('Usuario actualizado correctamente');
            this.loadUsers();
          },
          error: () => this.showError('Error al actualizar usuario')
        });
      }
    });
  }

  deleteUser(user: User): void {
    // Verificar permisos de eliminación
    if (!this.canDelete(user)) {
      this.showError('No tienes permisos para eliminar este usuario');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('USER.DELETE'),
        message: `¿Estás seguro de eliminar a ${user.name} ${user.surname}?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.showSuccess('Usuario eliminado correctamente');
            this.loadUsers();
          },
          error: () => this.showError('Error al eliminar usuario')
        });
      }
    });
  }

  canDelete(user: User): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;
    
    // GOD no puede ser eliminado
    if (user.role === UserRole.GOD) return false;
    
    // No puede eliminarse a sí mismo
    if (user.id === currentUser.id) return false;
    
    // Solo GOD puede eliminar administradores
    if (user.role === UserRole.ADMIN && currentUser.role !== UserRole.GOD) return false;
    
    // GOD y ADMIN pueden eliminar teachers y students
    return currentUser.role === UserRole.GOD || currentUser.role === UserRole.ADMIN;
  }

  canEdit(user: User): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;
    
    // GOD puede editar a todos
    if (currentUser.role === UserRole.GOD) return true;
    
    // ADMIN puede editar teachers y students
    if (currentUser.role === UserRole.ADMIN) {
      return user.role === UserRole.TEACHER || user.role === UserRole.STUDENT;
    }
    
    return false;
  }

  getRoleClass(role: UserRole): string {
    const classes: Record<UserRole, string> = {
      [UserRole.GOD]: 'role-god',
      [UserRole.ADMIN]: 'role-admin',
      [UserRole.TEACHER]: 'role-teacher',
      [UserRole.STUDENT]: 'role-student'
    };
    return classes[role] || '';
  }

  getPhotoUrl(user: User): string {
    return user.photo ? `assets/photos/${user.photo}` : 'assets/photos/unknown.jpg';
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  }
}
