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

  constructor(private router: Router) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Mesas',
        items: [
          {
            label: 'Mesas Activas',
            icon: 'pi pi-plus',
            routerLink: '/tables',
            routerActive: 'active'  // Cambiar según las rutas que hayas definido
          },
          {
            label: 'Editar Mesas',
            icon: 'pi pi-search',
            routerLink: '/table/table-edit'
          }
        ]
      },
      {
        label: 'Productos',
        items: [
          {
            label: 'Productos',
            icon: 'pi pi-cog',
            routerLink: '/category',
          },
          {
            label: 'produto lista',
            icon: 'pi pi-sign-out',
            routerLink: '/product-list'
          }
        ]
      }
    ];
  }
}
