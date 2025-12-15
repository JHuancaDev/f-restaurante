import { ChangeDetectorRef, Component } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../service/user-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-user-list',
  imports: [
    ToastModule,
    CardModule,
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList {
  users: User[] = [];
  loading: boolean = false;
  totalRecords: number = 0;

  // Filtros
  searchTerm: string = '';
  roleFilter: string = '';
  statusFilter: string = '';

  roles = [
    { label: 'Todos', value: '' },
    { label: 'Administrador', value: 'admin' },
    { label: 'Mesero', value: 'waiter' },
    { label: 'Cliente', value: 'customer' }
  ];

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activos', value: 'active' },
    { label: 'Inactivos', value: 'inactive' }
  ];

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.totalRecords = users.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los usuarios'
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredUsers(): User[] {
    let filtered = this.users;

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(term) ||
        user.full_name.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    }

    // Filtrar por rol
    if (this.roleFilter) {
      filtered = filtered.filter(user => user.role === this.roleFilter);
    }

    // Filtrar por estado
    if (this.statusFilter) {
      if (this.statusFilter === 'active') {
        filtered = filtered.filter(user => user.is_active);
      } else if (this.statusFilter === 'inactive') {
        filtered = filtered.filter(user => !user.is_active);
      }
    }

    return filtered;
  }

  getRoleSeverity(role: string): string {
    switch (role) {
      case 'admin': return 'danger';
      case 'waiter': return 'info';
      case 'customer': return 'success';
      default: return 'secondary';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'waiter': return 'Mesero';
      case 'customer': return 'Cliente';
      default: return role;
    }
  }

  getStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onFilter(): void {
    // Los filtros se aplican automáticamente mediante el getter filteredUsers
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.roleFilter = '';
    this.statusFilter = '';
  }

  getStats() {
    const total = this.users.length;
    const active = this.users.filter(user => user.is_active).length;
    const admins = this.users.filter(user => user.role === 'admin').length;
    const waiters = this.users.filter(user => user.role === 'waiter').length;
    const customers = this.users.filter(user => user.role === 'customer').length;

    return { total, active, admins, waiters, customers };
  }
}
