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

  constructor(private signalrService: SignalrService,
    private ordersrv: OrderService,private productsvr: ProductService,
     private custsvr: CustomerService,
      private paymentSrv: paymentService) {}


  ngOnDestroy(): void {
   this.networkStatus$.unsubscribe();
  }

  //after view initialises, when order is received from outside channel
  //add it to database, update cache and display notification status with sound.
  ngAfterViewInit(): void {
    this.signalrService.AllFeedObservable.subscribe(ord => {
      this.ordersrv.addOrder(ord).subscribe(o=>{
        this.ordersrv.ordersCache.push(o);
        this.Orderstatus = 'info';
        this.playSoundNotification();
      })
    });
    this.navcomponent.loginStatus.subscribe(s=> this.loginStatus = s);


  }


  //on page reload or when app initialises - initialise all services and cache data required.
  ngOnInit() {

    this.ordersrv.getOrders().subscribe(o=> this.ordersrv.ordersCache = o);
    this.productsvr.getProducts().subscribe(p=> this.productsvr.productssCache = p);
    this.custsvr.getCustomers().subscribe(c=> this.custsvr.customersCache = c);


    this.paymentSrv.createTerminal();

    this.checkNetworkStatus();

    this.signalrService.init();

    // 2 - register for ALL relay
    this.signalrService.listenToAllFeeds();

    // 3 - subscribe to messages received
    this.signalrService.AllFeedObservable
      .subscribe((res: any) => {
        console.log(res);
      });
  }

   playSoundNotification(){
      let au = new Audio();
        au.src = '../assets/order-notify.mp3';
        au.load();
        au.play();
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


  title = 'Foodloyale';
}
