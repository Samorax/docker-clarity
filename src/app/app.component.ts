import { Component, OnDestroy, OnInit } from '@angular/core';
import '@cds/core/icon/register.js';
import { ClarityIcons, usersIcon, bundleIcon, shoppingCartIcon,plusIcon } from '@cds/core/icon';
import { SignalrService } from './Services/Signalr.Service';
import { Observable, Subscription, fromEvent, map, merge, of } from 'rxjs';
import { paymentService } from './Services/PaymentService';

ClarityIcons.addIcons(usersIcon, bundleIcon, shoppingCartIcon, plusIcon);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl:'./app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  networkStatus: boolean = false;
  networkStatus$: Subscription = Subscription.EMPTY;

  isAuthenticated?: Observable<boolean>
  allFeedSubscription: any;
  order: any;
  show: any = false;
  constructor(private signalrService: SignalrService, private paymentSrv: paymentService) {}


  ngOnDestroy(): void {
   this.networkStatus$.unsubscribe();
  }

  ngOnInit() {
    this.paymentSrv.createTerminal();
    this.checkNetworkStatus();

    this.signalrService.init();

    // 2 - register for ALL relay
    this.signalrService.listenToAllFeeds();

    // 3 - subscribe to messages received
    this.allFeedSubscription = this.signalrService.AllFeedObservable
      .subscribe((res: any) => {
        console.log(res);
      });

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
