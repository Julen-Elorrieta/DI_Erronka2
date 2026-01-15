import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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

interface User {
  name: string;
  surname: string;
  username: string;
  email: string;
  role: string;
  photo?: string;
}

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
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit {
  users: User[] = []; // Populate with actual data
  filteredUsers = signal<User[]>([]);
  loading = signal(false);
  searchTerm = '';
  selectedRole = '';
  roles = ['admin', 'user']; // Example roles
  pageSize = 10;
  pageIndex = 0;
  displayedColumns = ['photo', 'name', 'email', 'role', 'actions'];

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
    this.filteredUsers.set(this.users.filter(user =>
      (user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       user.surname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (this.selectedRole === '' || user.role === this.selectedRole)
    ));
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedRole = '';
    this.onSearch();
  }

  getPaginatedUsers(): User[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  }

  getPhotoUrl(user: User): string {
    return user.photo || 'assets/photos/unknown.jpg';
  }

  getRoleClass(role: string): string {
    return role.toLowerCase();
  }

  canEdit(user: User): boolean {
    return this.isAdmin();
  }

  openEditDialog(user: User) {
    // Implement edit dialog
  }

  canDelete(user: User): boolean {
    return this.isAdmin();
  }

  deleteUser(user: User) {
    // Implement delete logic
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  private loadUsers() {
    // Load users from service
    this.loading.set(true);
    // Example: this.userService.getUsers().subscribe(users => { this.users = users; this.filteredUsers.set(users); this.loading.set(false); });
    this.filteredUsers.set(this.users);
    this.loading.set(false);
  }
}