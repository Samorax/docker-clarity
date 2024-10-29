import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './Authentication/auth.guard';
import { loginComponent } from './Authentication/login.component';
import { logOutComponent } from './Authentication/logout.component';
import { registerComponent } from './Authentication/register.component';
import { CustomerListComponent } from './Customer/CustomerList.component';
import { CustomerOverviewComponent } from './Customer/CustomerOverview.component';
import { OrderListComponent } from './Order/OrderList.component';
import { OrderOverviewComponent } from './Order/OrderOverview.component';
import { InventoryCatalogComponent } from './Inventory/InventoryCatalog.omponent';
import { InventoryOverviewComponent } from './Inventory/InventoryOverview.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [ { path: 'login', component: loginComponent },
{ path: 'register', component: registerComponent },
{ path: 'logout', component: logOutComponent },
{ path: 'home', component: HomeComponent, canActivate:[authGuard],
children:[
  {path:'inventory/overview', component:InventoryOverviewComponent},
  {path:'inventory/catalog', component:InventoryCatalogComponent},
  {path:'orders/overview', component: OrderOverviewComponent}, 
  {path:'orders/list', component: OrderListComponent},
  {path:'customers/overview',component:CustomerOverviewComponent}, 
  {path:'customers/list', component: CustomerListComponent}] }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
