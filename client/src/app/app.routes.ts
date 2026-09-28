import { Routes } from '@angular/router';

import { CustomerLayoutComponent } from './layout/customer-layout.component';
import { PortalLayoutComponent } from './layout/portal-layout.component';
import { authGuard, roleGuard } from './core/guards/auth.guard';

import { HomeComponent } from './pages/customer/home.component';
import { CategoriesPage } from './pages/customer/categories.component';
import { ProductListingPage } from './pages/customer/product-listing.component';
import { ProductDetailsPage } from './pages/customer/product-details.component';
import { CartPage } from './pages/customer/cart.component';
import { CheckoutPage } from './pages/customer/checkout.component';
import { OrderTrackingPage } from './pages/customer/order-tracking.component';
import { OrderHistoryPage } from './pages/customer/order-history.component';
import { InvoicePage } from './pages/customer/invoice-page.component';
import { ProfilePage } from './pages/customer/profile.component';
import { LocationPage } from './pages/customer/location-page.component';
import { ShopPage } from './pages/customer/shop-page.component';
import { AboutPage } from './pages/customer/about.component';
import { HelpPage } from './pages/customer/help.component';
import { LoginPage } from './pages/shared/login.component';
import { OrderDetailPage } from './pages/shared/order-detail.component';

import { ShopDashboardPage } from './pages/shop/shop-dashboard.component';
import { ShopListPage } from './pages/shop/shop-orders.component';
import { ShopProductsPage } from './pages/shop/shop-products.component';
import { ShopInventoryPage } from './pages/shop/shop-inventory.component';
import { ShopCustomersPage } from './pages/shop/shop-customers.component';
import { ShopInvoicesPage } from './pages/shop/shop-invoices.component';
import { ShopReportsPage } from './pages/shop/shop-reports.component';

import { CompanyDashboard } from './pages/company/company.component';
import { CompanyShops } from './pages/company/company.component';
import { CompanyEmployees } from './pages/company/company.component';
import { CompanyReports } from './pages/company/company-scopes.component';
import { CompanyOrders } from './pages/company/company-scopes.component';
import { CompanyProducts } from './pages/company/company-scopes.component';
import { CompanyInventory } from './pages/company/company-scopes.component';
import { CompanyDeliveries } from './pages/company/company-scopes.component';
import { CompanyPayments } from './pages/company/company-scopes.component';
import { CompanyInvoices } from './pages/company/company-scopes.component';

import { SuperDashboard } from './pages/superadmin/super-admin.component';
import { SuperListPage } from './pages/superadmin/super-admin.component';
import { SuperPayouts } from './pages/superadmin/super-admin.component';
import { SuperRegions } from './pages/superadmin/super-admin.component';
import { SuperOrders } from './pages/superadmin/super-scopes.component';
import { SuperGenericTable } from './pages/superadmin/super-scopes.component';
import { SuperReports } from './pages/superadmin/super-scopes.component';
import { SuperSettings } from './pages/superadmin/super-scopes.component';

import { DeliveryManagerDashboard } from './pages/delivery/delivery-manager.component';
import { DeliveryManagerAssign } from './pages/delivery/delivery-manager.component';
import { DeliveryManagerList } from './pages/delivery/delivery-manager.component';
import { DeliveryPartnerDashboard } from './pages/delivery/delivery-partner.component';
import { DeliveryPartnerOrder } from './pages/delivery/delivery-partner.component';
import { DeliveryPartnerHistory } from './pages/delivery/delivery-partner.component';

export const routes: Routes = [
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'categories', component: CategoriesPage },
      { path: 'category/:category', component: ProductListingPage },
      { path: 'product/:id', component: ProductDetailsPage },
      { path: 'cart', component: CartPage },
      { path: 'checkout', component: CheckoutPage, canActivate: [authGuard] },
      { path: 'order/:id', component: OrderTrackingPage },
      { path: 'orders', component: OrderHistoryPage },
      { path: 'invoice/:id', component: InvoicePage },
      { path: 'profile', component: ProfilePage },
      { path: 'location', component: LocationPage },
      { path: 'shops/:id', component: ShopPage },
      { path: 'shops', redirectTo: '/categories' },
      { path: 'about', component: AboutPage },
      { path: 'help', component: HelpPage },
    ],
  },

  { path: 'login', component: LoginPage },

  {
    path: 'portal/shop',
    component: PortalLayoutComponent,
    canActivate: [authGuard, roleGuard('SHOP_ADMIN', 'SHOP_STAFF')],
    children: [
      { path: '', component: ShopDashboardPage },
      { path: 'orders', component: ShopListPage },
      { path: 'orders/:id', component: OrderDetailPage },
      { path: 'tomorrow', component: ShopListPage },
      { path: 'processing', component: ShopListPage },
      { path: 'packing', component: ShopListPage },
      { path: 'ready', component: ShopListPage },
      { path: 'products', component: ShopProductsPage },
      { path: 'inventory', component: ShopInventoryPage },
      { path: 'customers', component: ShopCustomersPage },
      { path: 'invoices', component: ShopInvoicesPage },
      { path: 'reports', component: ShopReportsPage },
    ],
  },

  {
    path: 'portal/company',
    component: PortalLayoutComponent,
    canActivate: [authGuard, roleGuard('COMPANY_ADMIN')],
    children: [
      { path: '', component: CompanyDashboard },
      { path: 'shops', component: CompanyShops },
      { path: 'employees', component: CompanyEmployees },
      { path: 'products', component: CompanyProducts },
      { path: 'inventory', component: CompanyInventory },
      { path: 'orders', component: CompanyOrders },
      { path: 'orders-overview/:id', component: OrderDetailPage },
      { path: 'deliveries', component: CompanyDeliveries },
      { path: 'payments', component: CompanyPayments },
      { path: 'invoices', component: CompanyInvoices },
      { path: 'reports', component: CompanyReports },
    ],
  },

  {
    path: 'portal/super',
    component: PortalLayoutComponent,
    canActivate: [authGuard, roleGuard('SUPER_ADMIN')],
    children: [
      { path: '', component: SuperDashboard },
      { path: 'companies', component: SuperListPage },
      { path: 'shops', component: SuperGenericTable },
      { path: 'users', component: SuperListPage },
      { path: 'products', component: SuperGenericTable },
      { path: 'inventory', component: SuperGenericTable },
      { path: 'orders', component: SuperOrders },
      { path: 'orders/:id', component: OrderDetailPage },
      { path: 'partners', component: SuperListPage },
      { path: 'payments', component: SuperPayouts },
      { path: 'invoices', component: SuperGenericTable },
      { path: 'reports', component: SuperReports },
      { path: 'regions', component: SuperRegions },
      { path: 'settings', component: SuperSettings },
    ],
  },

  {
    path: 'portal/delivery-manager',
    component: PortalLayoutComponent,
    canActivate: [authGuard, roleGuard('DELIVERY_MANAGER')],
    children: [
      { path: '', component: DeliveryManagerDashboard },
      { path: 'ready', component: DeliveryManagerList },
      { path: 'assign', component: DeliveryManagerAssign },
      { path: 'active', component: DeliveryManagerList },
      { path: 'completed', component: DeliveryManagerList },
      { path: 'failed', component: DeliveryManagerList },
      { path: 'active/:id', component: OrderDetailPage },
      { path: 'ready/:id', component: OrderDetailPage },
    ],
  },

  {
    path: 'portal/delivery-partner',
    component: PortalLayoutComponent,
    canActivate: [authGuard, roleGuard('DELIVERY_PARTNER')],
    children: [
      { path: '', component: DeliveryPartnerDashboard },
      { path: 'deliveries', component: DeliveryPartnerDashboard },
      { path: 'deliveries/:id', component: DeliveryPartnerOrder },
      { path: 'history', component: DeliveryPartnerHistory },
      { path: 'help', component: HelpPage },
    ],
  },

  { path: '**', redirectTo: '' },
];