import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import '@cds/core/icon/register.js';
import { ClarityIcons, usersIcon, bundleIcon, shoppingCartIcon,plusIcon, bellIcon,cogIcon } from '@cds/core/icon';
import { SignalrService } from './Services/Signalr.Service';
import { Observable, Subscription, fromEvent, map, merge, of } from 'rxjs';
import { OrderService } from './Services/OrderService';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { appUserService } from './Services/AppUserService';
import { Router } from '@angular/router';
import { Notifications, notificationType } from './Models/Notification';
import { Customer } from './Models/Customer';
import { AuthenticationService } from './Services/AuthenticationService';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { testModeService } from './Services/TestModeService';
import { SettingsComponent } from './Settings/settings.component';
import { disseminateModeService } from './Services/DisseminateMode';




ClarityIcons.addIcons(usersIcon, bundleIcon, shoppingCartIcon, plusIcon,bellIcon,cogIcon);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl:'./app.component.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(NavMenuComponent)navcomponent!: NavMenuComponent;
  @ViewChild(SettingsComponent)settingscomponent!:SettingsComponent;

  networkStatus: boolean = false;
  networkStatus$: Subscription = Subscription.EMPTY;

  loginStatus!:string;
  notifications:Notifications[] = [];
  isAuthenticated?: Observable<boolean>
  allFeedSubscription: any;
  order!: any;
  show: any = false;
  Orderstatus:string = '';
  paymentProvider: any;
  testMode!:boolean
  mode = inject(disseminateModeService)

  constructor(private signalrService: SignalrService,private _testModeSVR:testModeService,
    private ordersrv: OrderService,private _appUserSvr:appUserService, private _toaster:ToastrService,
    private _authSvr:AuthenticationService,private cd:ChangeDetectorRef,
     private _route: Router) {
    
     }
     


  ngOnDestroy(): void {
   this.networkStatus$.unsubscribe();
  }

  //after view initialises, when order is received from outside channel
  //add it to database, update cache and display notification status with sound.
  ngAfterViewInit(): void {
    this.isAuthenticated = of(this._authSvr.isAuthenticated());
  
   this.mode.getMode.subscribe(m=> {this.testMode = m;this.cd.detectChanges();console.log(m)});

    this.signalrService.AllOrderFeedObservable.subscribe((ord:any) => {
        this.order = JSON.parse(ord);
        this._toaster.info(`You have a new order. Id: ${this.order.orderID}`,"Order Notification",{
          closeButton:true,
          tapToDismiss:true,
          disableTimeOut:true
    
        });

        if (!("Notification" in window)) {
          // Check if the browser supports notifications
          alert("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
          // Check whether notification permissions have already been granted;
          // if so, create a notification
          const notification = new Notification(`You have a new order. Id: ${this.order.orderID}`);
          // …
        } else if (Notification.permission !== "denied") {
          // We need to ask the user for permission
          Notification.requestPermission().then((permission) => {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
              const notification = new Notification(`You have a new order. Id: ${this.order.orderID}`);
              // …
            }
          });
        }
        
        
        this.cd.detectChanges();
    });

    this.signalrService.AllBirthdayFeedObservable.subscribe((cu:any)=>{
      let c:any = JSON.parse(cu);
      
      this._toaster.info(`Birthday Update: ${c.firstName} birthday is next week. Customer id:${c.customerId}`, 'Birthday Notification',{
        closeButton:true,
        tapToDismiss:true,
        disableTimeOut:true
      });

      if (!("Notification" in window)) {
        // Check if the browser supports notifications
        alert("This browser does not support desktop notification");
      } else if (Notification.permission === "granted") {
        // Check whether notification permissions have already been granted;
        // if so, create a notification
        const notification = new Notification(`Birthday Update: ${c.firstName} birthday is next week. Customer id:${c.customerId}`);
        // …
      } else if (Notification.permission !== "denied") {
        // We need to ask the user for permission
        Notification.requestPermission().then((permission) => {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            const notification = new Notification(`Birthday Update: ${c.firstName} birthday is next week. Customer id:${c.customerId}`);
            // …
          }
        });
      }
    });

    this.signalrService.AllVoucherFeedObservable.subscribe((vu:any)=>{
      let c:any = vu;
      
      this._toaster.error(`Voucher Update: ${c.VoucherName} has expired.`, 'Voucher Notification',{
        closeButton:true,
        tapToDismiss:true,
        disableTimeOut:true
      });

      if (!("Notification" in window)) {
        // Check if the browser supports notifications
        alert("This browser does not support desktop notification");
      } else if (Notification.permission === "granted") {
        // Check whether notification permissions have already been granted;
        // if so, create a notification
        const notification = new Notification(`Voucher Update: ${c.VoucherName} has expired.`);
        // …
      } else if (Notification.permission !== "denied") {
        // We need to ask the user for permission
        Notification.requestPermission().then((permission) => {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            const notification = new Notification(`Voucher Update: ${c.VoucherName} has expired.`);
            // …
          }
        });
      }
    })

    this.signalrService.AllNewCustomerFeedObservable.subscribe((c:Customer)=>{
      let n:Notifications = {type: notificationType.customer, texts: `A new customer just registered ${c.id}.` };
      this.notifications.unshift(n);
      this.navcomponent.show = true;
    });

    this.navcomponent.loginStatus.subscribe(s=> this.loginStatus = s);

  }


  //on page reload or when app initialises - initialise all services and cache data required.
  ngOnInit() {
    this.checkPaymentTerminalStatus();
    
    this.checkNetworkStatus();

    this.signalrService.init();

    // 2 - register for ALL relay
    this.signalrService.listenToOrderFeeds();
    this.signalrService.listenToBirthdayFeeds();
    this.signalrService.listenToOrderUpdateFeeds();

    let x:any = localStorage.getItem('appMode');
    console.log(x);
    this.testMode = x;

    // 3 - subscribe to messages received
   /* this.signalrService.AllFeedObservable
      .subscribe((res: any) => {
        console.log(res);
      });*/
  } 

   playSoundNotification(){
      let au = new Audio();
        au.src = '../assets/order-notify.mp3';
        au.load();
        au.play();
    }

  checkPaymentTerminalStatus(){
    this._appUserSvr.getAppUserInfo()
    .subscribe((r:any)=> {
        this.paymentProvider = r.paymentProcessor});
  }

  checkNetworkStatus() {
    this.networkStatus = navigator.onLine;
    this.networkStatus$ = merge(
      of(null),
      fromEvent(window, 'online'),
  fromEvent(window, 'offline')
)
  .pipe(map(() => navigator.onLine))
  .subscribe(status => {
    this.networkStatus = status;
  });
}

onFixPaymentProcessor(){
this._route.parseUrl('/home/settings');
}


  title = 'Foodloyale';
}
