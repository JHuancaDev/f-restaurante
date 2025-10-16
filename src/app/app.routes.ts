import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Sidebar } from './componets/sidebar/sidebar';
import { TablesActive } from './pages/tables-active/tables-active';
import { EditTable } from './pages/edit-table/edit-table';
import { Category } from './pages/category/category';

export const routes: Routes = [
    {path: '', redirectTo: 'table/table-active', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'sidebar', component: Sidebar},
    {path: 'table/table-active', component: TablesActive},
    {path: 'table/table-edit', component: EditTable},
    {path: 'category', component: Category}
];
