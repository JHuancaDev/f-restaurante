import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';


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

  constructor(private router: Router) { }

  ngOnInit() {
    this.items = [
      {
        label: 'Mesas',
        items: [
          {
            label: 'Mesas Activas',
            icon: 'pi pi-plus',
            routerLink: '/table/table-active',
            routerActive: 'active'
          },
          {
            label: 'Editar Mesas',
            icon: 'pi pi-search',
            routerLink: '/tables-list'
          },
          {
            label: 'Editar Mesas',
            icon: 'pi pi-search',
            routerLink: '/tables/map'
          }
          

        ]
      },
      {
        label: 'Productos',
        items: [
          {
            label: 'Productos',
            icon: 'pi pi-cog',
            routerLink: '/product-list',
          },
          {
            label: 'produto lista',
            icon: 'pi pi-sign-out',
            routerLink: '/product-list'
          }
        ]
      },
      {
        label: 'Categoria',
        items: [
          {
            label: 'Productos',
            icon: 'pi pi-cog',
            routerLink: '/category',
          },
          {
            label: 'produto lista',
            icon: 'pi pi-sign-out',
            routerLink: '/category'
          }
        ]
      },
      {
        label: 'Ventas',
        items: [
          {
            label: 'ventas',
            icon: 'pi pi-cog',
            routerLink: '/sales',
          },
        ]
      },
      {
        label: 'Usuarios',
        items: [
          {
            label: 'usuarios',
            icon: 'pi pi-cog',
            routerLink: '/users',
          },
        ]
      }
    ];
  }
}
