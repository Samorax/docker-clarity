import { AfterViewInit, Component, OnDestroy, OnInit, Signal, ViewChild, inject } from '@angular/core';
import '@cds/core/icon/register.js';
import { ClarityIcons, usersIcon, bundleIcon, shoppingCartIcon,plusIcon, bellIcon,cogIcon } from '@cds/core/icon';
import { SignalrService } from './Services/Signalr.Service';
import { Observable, Subscription, fromEvent, map, merge, of } from 'rxjs';
import { OrderService } from './Services/OrderService';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { appUserService } from './Services/AppUserService';
import { Router } from '@angular/router';
import { Notifications, notificationType } from './Models/Notification';
import { Order } from './Models/Order.model';
import { CustomerDto } from './Models/CustomerDto';
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
  styleUrl:'./app.component.css'
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
    private _authSvr:AuthenticationService,
     private _route: Router) {
    
     }
     


  ngOnDestroy(): void {
   this.networkStatus$.unsubscribe();
  }

  //after view initialises, when order is received from outside channel
  //add it to database, update cache and display notification status with sound.
  ngAfterViewInit(): void {

    this.isAuthenticated = of(this._authSvr.isAuthenticated())
    console.log(localStorage.getItem('appMode'))

   this.mode.getMode.subscribe(m=> {this.testMode = m;console.log(m)});
  
    this.signalrService.AllOrderFeedObservable.subscribe((ord:any) => {
        this.order = JSON.parse(ord);
        this._toaster.info(`You have a new order ${this.order.orderID}`,"Order Notification",{
          closeButton:true,
          tapToDismiss:true,
          disableTimeOut:true
    
        });
        
        
    });

    this.signalrService.AllBirthdayFeedObservable.subscribe((c:CustomerDto)=>{
      let n:Notifications = {type: notificationType.birthday, texts: `Customer ref:${c.id} birthday is next week.` };
      this.notifications.unshift(n);
      this.navcomponent.show = true;
    });

    this.signalrService.AllNewCustomerFeedObservable.subscribe((c:Customer)=>{
      let n:Notifications = {type: notificationType.customer, texts: `A new customer just registered ${c.id}.` };
      this.notifications.unshift(n);
      this.navcomponent.show = true;
    })

    
    


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
        console.log('status', status);
    this.networkStatus = status;
  });
}

onFixPaymentProcessor(){
this._route.parseUrl('/home/settings');
}


  title = 'Foodloyale';
}
