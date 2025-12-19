import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth-service';


@Component({
  selector: 'app-sidebar',
  imports: [
    Menu, ToastModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  items: MenuItem[] | undefined;

  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.items = [
      {
        label: 'Mesas',
        items: [
          {
            label: 'ordenes',
            icon: 'pi pi-list',
            routerLink: '/order',
            routerActive: 'active'
          },
          {
            label: 'Editar Mesas',
            icon: 'pi pi-pen-to-square',
            routerLink: '/tables-list'
          },
          {
            label: 'Plano de Mesas',
            icon: 'pi pi-table',
            routerLink: '/tables/map'
          }


        ]
      },
      {
        label: 'Productos',
        items: [
          {
            label: 'Productos',
            icon: 'pi pi-tag',
            routerLink: '/product-list',
          }
        ]
      },
      {
        label: 'Categoria',
        items: [
          {
            label: 'Categoria',
            icon: 'pi pi-th-large',
            routerLink: '/category',
          }
        ]
      },
      {
        label: 'Extra',
        items: [
          {
            label: 'Extra',
            icon: 'pi pi-th-large',
            routerLink: '/extras',
          }
        ]
      },
      {
        label: 'Usuarios',
        items: [
          {
            label: 'usuarios',
            icon: 'pi pi-user',
            routerLink: '/users',
          },
        ]
      },
      {
        label: 'Comentarios',
        items: [
          {
            label: 'Comentarios',
            icon: 'pi pi-comments',
            routerLink: '/reviews',
          },
        ]
      },
      {
        separator: true
      },
      {
        label: '',
        items: [
          {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',
            styleClass: 'logout-item',
            command: () => {
              this.logout();
            }
          },
        ]
      },
    ];
  }
  logout() {
    // Mostrar confirmación opcional
    this.authService.logout();
  }
}
