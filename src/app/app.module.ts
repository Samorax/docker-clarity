import { NgModule, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule, ClrButtonModule, ClrLoadingModule, ClrSpinnerModule, ClrTooltipModule } from '@clr/angular';
import { HomeComponent } from './home/home.component';

import { NgxEchartsModule } from 'ngx-echarts';
import { PageNotFoundComponent } from './Authentication/pagenotfound.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserModule } from '@angular/platform-browser';
import { ToastrModule, provideToastr } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { indexComponent } from './index/indexComponent';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    indexComponent
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
      
      {path: '**', component:PageNotFoundComponent, pathMatch:'full'}
    ],{enableViewTransitions:true}),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [],
  bootstrap:[AppComponent]
})
export class AppModule { }
