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
import { TableMap } from './pages/table-map/table-map';
import { TableDetail } from './pages/table-detail/table-detail';
import { SaleList } from './pages/sale-list/sale-list';
import { SaleForm } from './pages/sale-form/sale-form';
import { UserList } from './pages/user-list/user-list';
import { Order } from './pages/order/order';
import { Reviews } from './pages/reviews/reviews';
import { OrderDetail } from './pages/order-detail/order-detail';
import { ExtraList } from './pages/extra-list/extra-list';

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
            { path: 'category', component: Category },
            { path: 'tables-list', component: TableList },
            { path: 'tables/new', component: TableForm },
            { path: 'tables/edit/:id', component: TableForm },
            { path: 'product-list', component: ProductList },
            { path: 'tables/map', component: TableMap },
            { path: 'tables/detail/:id', component: TableDetail },
            { path: 'sales', component: SaleList },
            { path: 'sales/new', component: SaleForm },
            { path: 'users', component: UserList },
            { path: 'order', component: Order },
            { path: 'reviews',component: Reviews},
            { path: 'orders/:id', component: OrderDetail },
            { path: 'extras', component: ExtraList },
        ]
    },
    { path: '**', redirectTo: 'login' }
];
