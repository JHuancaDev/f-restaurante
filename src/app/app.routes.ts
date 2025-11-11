import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Sidebar } from './componets/sidebar/sidebar';
import { TablesActive } from './pages/tables-active/tables-active';
import { EditTable } from './pages/edit-table/edit-table';
import { Category } from './pages/category/category';
import { ProductList } from './pages/product-list/product-list';
import { Layout } from './componets/layout/layout';
import { LoginGuard } from './guard/login-guard';
import { AuthGuard } from './guard/auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        component: Login,
        canActivate: [LoginGuard]
    },
    {
        path: '',
        component: Layout,
        canActivate: [AuthGuard],
        children: [
            { path: 'table/table-active', component: TablesActive },
            { path: 'table/table-edit', component: EditTable },
            { path: 'category', component: Category },
            { path: 'product-list', component: ProductList }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
