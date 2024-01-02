import { BrowserModule } from '@angular/platform-browser';
import { Component, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, RouterOutlet } from '@angular/router';

import { AppComponent } from './app.component';

import { SignalrService } from './Services/Signalr.Service'
import { OrderComponent } from './Order/Order.component';
import { CustomerComponent } from './Customer/Customer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductOverviewComponent } from './Product/ProductOverview.component';
import { ProductCatalogComponent } from './Product/ProductCatalog.omponent';
import { OrderListComponent } from './Order/OrderList.component';
import { OrderOverviewComponent } from './Order/OrderOverview.component';
import { CustomerListComponent } from './Customer/CustomerList.component';
import { CustomerOverviewComponent } from './Customer/CustomerOverview.component';
import { AddProductDialog } from './Product/AddProductDialog.component';
import { ClarityModule } from '@clr/angular';
import { HomeComponent } from './home/home.component';
import { EditProductDialog } from './Product/EditProductDialog.component';
import { DeleteProductDialog } from './Product/DeleteProductDialog.Component';
import { ProductService } from './Services/ProductService';
import { OrderService } from './Services/OrderService';
import { OrderEditComponent } from './Order/OrderEdit.component';
import { OrderAddComponent } from './Order/OrderAdd.component';
import { OrderCartComponent } from './Order/OrderCart.component';
import { DeleteCustomerDialogComponent } from './Customer/DeleteCustomerDialog.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { CustomerService } from './Services/CustomerService';
import { loginComponent } from './Authentication/login.component';
import { AuthenticationService } from './Services/AuthenticationService';
import { registerComponent } from './Authentication/register.component';
import { AuthInterceptor } from './Services/AuthInterceptor';
import { logOutComponent } from './Authentication/logout.component';
import { loginMenuComponent } from './Authentication/loginmenu.component';
import { authGuard } from './Authentication/auth.guard';
import { NgxEchartsModule } from 'ngx-echarts';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { indexComponent } from './Index/indexComponent';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavMenuComponent,
    OrderComponent,
    CustomerComponent,
    CustomerListComponent,
    CustomerOverviewComponent,
    OrderOverviewComponent,
    OrderListComponent,
    SidebarComponent,
    ProductOverviewComponent,
    ProductCatalogComponent,
    AddProductDialog,
    EditProductDialog,
    DeleteProductDialog,
    OrderEditComponent,
    OrderAddComponent,
    OrderCartComponent,
    DeleteCustomerDialogComponent,
    loginComponent,
    registerComponent,
    logOutComponent,
    loginMenuComponent
  ],
  imports: [
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ClarityModule,
    NgxEchartsModule.forRoot({echarts: ()=>import('echarts')}),
    RouterModule.forRoot([
      {path:'', component: indexComponent},
      { path: 'login', component: loginComponent },
      { path: 'register', component: registerComponent },
      { path: 'logout', component: logOutComponent },
      { path: 'home', component: HomeComponent, canActivate:[authGuard],
    children:[
      {path:'products/overview', component:ProductOverviewComponent},
      {path:'products/catalog', component:ProductCatalogComponent},
      {path:'orders/overview', component: OrderOverviewComponent}, 
      {path:'orders/list', component: OrderListComponent},
      {path:'customers/overview',component:CustomerOverviewComponent}, 
      {path:'customers/list', component: CustomerListComponent}] }
    ]),
  ],
  providers: [SignalrService, ProductService, OrderService, CustomerService, AuthenticationService,{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap:[AppComponent]
})
export class AppModule { }
