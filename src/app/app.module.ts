import { NgModule, inject, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter, RouterModule, withViewTransitions } from '@angular/router';

import { AppComponent } from './app.component';

import { SignalrService } from './Services/Signalr.Service'
import { OrderComponent } from './Order/Order.component';
import { CustomerComponent } from './Customer/Customer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InventoryOverviewComponent } from './Inventory/InventoryOverview.component';
import { InventoryCatalogComponent } from './Inventory/InventoryCatalog.omponent';
import { OrderListComponent } from './Order/OrderList.component';
import { OrderOverviewComponent } from './Order/OrderOverview.component';
import { CustomerListComponent } from './Customer/CustomerList.component';
import { CustomerOverviewComponent } from './Customer/CustomerOverview.component';
import { AddProductDialog } from './Inventory/Products/AddProductDialog.component';
import { ClarityModule, ClrButtonModule, ClrLoadingModule, ClrSpinnerModule, ClrTooltipModule } from '@clr/angular';
import { HomeComponent } from './home/home.component';
import { EditProductDialog } from './Inventory/Products/EditProductDialog.component';
import { DeleteProductDialog } from './Inventory/Products/DeleteProductDialog.component';
import { ProductService } from './Services/Product/ProductService';
import { OrderService } from './Services/Order/OrderService';
import { OrderEditComponent } from './Order/OrderEdit.component';
import { OrderAddComponent } from './Order/OrderAdd.component';
import { OrderCartComponent } from './Order/OrderCart.component';
import { DeleteCustomerDialogComponent } from './Customer/DeleteCustomerDialog.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { CustomerService } from './Services/Customer/CustomerService';
import { loginComponent } from './Authentication/login.component';
import { AuthenticationService } from './Services/AuthenticationService';
import { registerComponent } from './Authentication/register.component';
import { AuthInterceptor } from './Services/AuthInterceptor';
import { logOutComponent } from './Authentication/logout.component';
import { loginMenuComponent } from './Authentication/loginmenu.component';
import { authGuard } from './Authentication/auth.guard';
import { NgxEchartsModule } from 'ngx-echarts';
import { indexComponent } from './Index/indexComponent';
import { SettingsComponent } from './Settings/settings.component';
import { voucherComponent } from './Loyalty/voucher.component';
import { voucherService } from './Services/VoucherService';
import { addVoucherDialogComponent } from './Loyalty/addVoucherDialog.component';
import {  rewardComponent } from './Loyalty/reward.component';
import { addLoyaltyDialogComponent } from './Loyalty/addRewardDialog.component';
import { RewardService } from './Services/RewardService';
import { editLoyaltyDialogComponent } from './Loyalty/editRewardDialog.component';
import { deleteLoyaltyDialogComponent } from './Loyalty/deleteRewardDialog.component';
import { editVoucherDialogComponent } from './Loyalty/editVoucherDialog.component';
import { deleteVoucherDialogComponent } from './Loyalty/deleteVoucherDialog.component';
import { tableComponent } from './Table/table.component';
import { TableService } from './Services/TableService';
import { addTableDialogComponent } from './Table/addTableDialog.component';
import { waiterComponent } from './Waiter/waiter.component';
import { addWaiterDialogComponent } from './Waiter/addWaiterDialog.component';
import { TableSessionService } from './Services/TableSessionsService';
import { OrderInSessionEditComponent } from './Order/OrderInSessionEdit.Component';
import { OrderInSessionEditCartComponent } from './Order/OrderInSessionEditCart.component';
import { editTableDialogComponent } from './Table/editTableDialog.component';
import { delTableDialogComponent } from './Table/delTableDialog.component';
import { delWaiterComponent } from './Waiter/delWaiterDialog.component';
import { editWaiterComponent } from './Waiter/editWaiterDialog.component';
import { SmsService } from './Services/SmsService';
import { broadcastDialogComponent } from './Loyalty/broadcastDialog.component';
import { OrderCartService } from './Services/Order/OrderCartService';
import { PageNotFoundComponent } from './Authentication/pagenotfound.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserModule } from '@angular/platform-browser';
import { OrderSmsComponent } from './Order/OrderSms.component';
import { VoucherSmsComponent } from './Loyalty/voucherSms.component';
import { ToastrModule, provideToastr } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { operatingDaysComponent } from './Settings/operatingDaysDialog.component';
import { editOperatingDaysComponent } from './Settings/editOperatingDaysDialog.component';
import { delOperatingDaysComponent } from './Settings/delOperatingDays.component';
import { deleteAccountComponent } from './Settings/delAccountDialog.component';
import { contactSalesComponent } from './index/contactSalesComponent';
import { becomeAPartnerComponent } from './index/becomeAPartnerComponent';
import { partnersComponent } from './index/partnersComponent';
import { OrderAnnulComponent } from './Order/OrderAnnul.component';
import { OrderReconcileComponent } from './Order/OrderReconcile.component';
import { InventoryStockComponent } from './Inventory/Stocks/InventoryStock.component';
import { addStockDialog } from './Inventory/Stocks/AddStockDialog.component';

import { deleteStockDialogComponent } from './Inventory/Stocks/DeleteStockDialog.component';
import { restockDialogComponent } from './Inventory/Stocks/ReStockDialog.component';
import { editStockDialogComponent } from './Inventory/Stocks/EditStockDialog.component';
import { stockResolver } from './Services/Stock/StockResolver';
import { productResolver } from './Services/Product/ProductResolver';
import { ClarityIcons } from '@cds/core/icon';
import { orderResolver } from './Services/Order/OrderResolver';
import { customerResolver } from './Services/Customer/CustomerResolver';
import { voucherResolver } from './Services/VoucherResolver';
import { rewardResolver } from './Services/RewardResolver';
import { appUserResolver } from './Services/AppUserResolver';
import { LoyaltyOverviewComponent } from './Loyalty/overviewcomponent';
import { CustomFormatPipe } from './Services/CustomFormatter.pipe';
import { RewardSmsComponent } from './Loyalty/rewardSms.component';
import { AddFIDialogComponent } from './Inventory/Food Ingredients/AddFI.component';
import { DeleteFIDialogComponent } from './Inventory/Food Ingredients/DeleteFI.component';
import { EditFIDialogComponent } from './Inventory/Food Ingredients/EditFI.component';
import { PODialogComponent } from './Inventory/Food Ingredients/PO.component';
import { AddSupplierDialogComponent } from './Inventory/Supplier/AddSupplierDialog.component';
import { DeleteSupplierDialogComponent } from './Inventory/Supplier/DeleteSupplierDialog.component';
import { EditSupplierDialogComponent } from './Inventory/Supplier/EditSupplierDialog.component';


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
    InventoryOverviewComponent,
    InventoryCatalogComponent,
    InventoryStockComponent,
    AddSupplierDialogComponent,
    DeleteSupplierDialogComponent,
    EditSupplierDialogComponent,
    DeleteFIDialogComponent,
    AddFIDialogComponent,
    EditFIDialogComponent,
    PODialogComponent,
    addStockDialog,
    deleteStockDialogComponent,
    restockDialogComponent,
    editStockDialogComponent,
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
    loginMenuComponent,
    SettingsComponent,
    voucherComponent,
    addVoucherDialogComponent,
    editVoucherDialogComponent,
    deleteVoucherDialogComponent,
    addLoyaltyDialogComponent,
    editLoyaltyDialogComponent,
    deleteLoyaltyDialogComponent,
    rewardComponent,
    tableComponent,
    addTableDialogComponent,
    waiterComponent,
    addWaiterDialogComponent,
    OrderInSessionEditComponent,
    OrderInSessionEditCartComponent,
    editTableDialogComponent,
    delTableDialogComponent,
    delWaiterComponent,
    editWaiterComponent,
    broadcastDialogComponent,
    OrderSmsComponent,
    operatingDaysComponent,
    editOperatingDaysComponent,
    delOperatingDaysComponent,
    deleteAccountComponent,
    VoucherSmsComponent,
    indexComponent,
    contactSalesComponent,
    becomeAPartnerComponent,
    partnersComponent,
    OrderAnnulComponent,
    OrderReconcileComponent,
    CustomFormatPipe,
    addTableDialogComponent,
    RewardSmsComponent
  ],
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    ClrTooltipModule,
    ClrSpinnerModule,
    ClrButtonModule,
    ClrLoadingModule,
    FormsModule,
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    ClarityModule,
    NgxEchartsModule.forRoot({echarts: ()=>import('echarts')}),
    ToastrModule.forRoot(),
    RouterModule.forRoot([
      { path:'', component: indexComponent, pathMatch:'full'},
      { path:'contact-sales',component:contactSalesComponent,pathMatch:'full'},
      { path:'become-a-partner',component:becomeAPartnerComponent,pathMatch:'full'},
      { path:'partners',component:partnersComponent,pathMatch:'full'},
      { path: 'login', component: loginComponent, pathMatch:'full' },
      { path: 'register', component: registerComponent, pathMatch:'full' },
      { path: 'logout', component: logOutComponent, pathMatch:'full' },
      { path: 'home', component: HomeComponent, canActivate:[authGuard],
    children:[
      {path:'inventory/overview', component:InventoryOverviewComponent,resolve:{orders:orderResolver,products:productResolver,stocks:stockResolver}},
      {path:'inventory/catalog', component:InventoryCatalogComponent,resolve:{products:productResolver}},
      {path:'inventory/stocks',component:InventoryStockComponent,resolve:{stocks:stockResolver}},
      {path:'orders/overview', component: OrderOverviewComponent,resolve:{orders:orderResolver,customers:customerResolver}}, 
      {path:'orders/list', component: OrderListComponent,resolve:{orders:orderResolver}},
      {path:'customers/overview',component:CustomerOverviewComponent,resolve:{customers:customerResolver,orders:orderResolver}}, 
      {path:'customers/list', component: CustomerListComponent,resolve:{customers:customerResolver}},
      {path:'tables/list', component:tableComponent},
      {path:'waiters/list',component:waiterComponent},
      {path:'loyalty/overview',component:LoyaltyOverviewComponent,resolve:{}},
      {path:'loyalty/vouchers',component: voucherComponent,resolve:{vouchers:voucherResolver,customers:customerResolver}},
      {path:'loyalty/rewards',component:rewardComponent,resolve:{rewards:rewardResolver,customers:customerResolver}},
      {path:'settings', component:SettingsComponent,resolve:{appUser:appUserResolver}}] },
      {path: '**', component:PageNotFoundComponent, pathMatch:'full'}
    ],{enableViewTransitions:true}),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    SignalrService, CustomerService,voucherService, RewardService, TableService, TableSessionService, SmsService,OrderCartService,provideToastr(),
     AuthenticationService,{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap:[AppComponent]
})
export class AppModule { }
