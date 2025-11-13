import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { TablesActive } from './pages/tables-active/tables-active';
import { Category } from './pages/category/category';
import { ProductList } from './pages/product-list/product-list';
import { Layout } from './componets/layout/layout';
import { LoginGuard } from './guard/login-guard';
import { AuthGuard } from './guard/auth-guard';
import { TableList } from './pages/table-list/table-list';
import { TableForm } from './pages/table-form/table-form';

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
            { path: 'category', component: Category },
            { path: 'tables', component: TableList },
            { path: 'tables/new', component: TableForm },
            { path: 'tables/edit/:id', component: TableForm },
            { path: 'product-list', component: ProductList }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
