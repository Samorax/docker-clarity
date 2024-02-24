import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import '@cds/core/icon/register.js';
import { ClarityIcons, usersIcon, bundleIcon, shoppingCartIcon,plusIcon, bellIcon,cogIcon } from '@cds/core/icon';
import { SignalrService } from './Services/Signalr.Service';
import { Observable, Subscription, fromEvent, map, merge, of } from 'rxjs';
import { paymentService } from './Services/PaymentService';
import { OrderService } from './Services/OrderService';
import { ProductService } from './Services/ProductService';
import { CustomerService } from './Services/CustomerService';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { appUserService } from './Services/AppUserService';
import { Router } from '@angular/router';


ClarityIcons.addIcons(usersIcon, bundleIcon, shoppingCartIcon, plusIcon,bellIcon,cogIcon);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl:'./app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(NavMenuComponent)navcomponent!: NavMenuComponent;

  networkStatus: boolean = false;
  networkStatus$: Subscription = Subscription.EMPTY;

  loginStatus!:string;

  isAuthenticated?: Observable<boolean>
  allFeedSubscription: any;
  order: any;
  show: any = false;
  Orderstatus:string = '';
  paymentProvider: any;

  constructor(private signalrService: SignalrService,
    private ordersrv: OrderService,private _appUserSvr:appUserService,
     private _route: Router) {}



  ngOnDestroy(): void {
   this.networkStatus$.unsubscribe();
  }

  //after view initialises, when order is received from outside channel
  //add it to database, update cache and display notification status with sound.
  ngAfterViewInit(): void {
    this.signalrService.AllOrderFeedObservable.subscribe(ord => {
      console.log(ord);
        this.ordersrv.ordersCache.push(ord);
        this.Orderstatus = 'info';
    });
    this.signalrService.AllBirthdayFeedObservable.subscribe(b=>{
      console.log(b);
    })

    this.signalrService.AllOrderUpdateFeedObservable.subscribe(oU=>{
      console.log(oU);
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
