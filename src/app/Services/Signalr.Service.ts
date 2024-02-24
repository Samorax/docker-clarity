import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Order } from "../Models/Order.model";
import * as signalR from "@microsoft/signalr";
import {HttpClient} from "@angular/common/http";
import { HubConnection } from "@microsoft/signalr";


@Injectable({
  providedIn:'root'
})
export class SignalrService {
  constructor(private _http: HttpClient) {
    
  }
  userId = localStorage.getItem("user_id");
  private $orderFeed: Subject<any> = new Subject<any>();
  private $birthdayFeed: Subject<any> = new Subject<any>();
  private $orderUpdateFeed: Subject<any> = new Subject<any>();

  hubConnection: any;

  public get AllOrderFeedObservable(): Observable<Order> {
    return this.$orderFeed.asObservable();
  };
  public get AllBirthdayFeedObservable(): Observable<Order> {
    return this.$birthdayFeed.asObservable();
  };
  public get AllOrderUpdateFeedObservable(): Observable<Order> {
    return this.$orderUpdateFeed.asObservable();
  };

  listenToOrderFeeds() {
    (<HubConnection>this.hubConnection).on("ordered", (data: Order) => {
      this.$orderFeed.next(data);
    });
  }

  listenToBirthdayFeeds(){
    (<HubConnection>this.hubConnection).on("birthday",(data: any) =>{ this.$birthdayFeed.next(data)})
  }

  listenToOrderUpdateFeeds(){
    (<HubConnection>this.hubConnection).on("orderUpdate",(data: Order) =>{ this.$orderUpdateFeed.next(data)})
  }

  //private hubConnection: any;
  //receiveorders20231123194629.azurewebsites.net
  private getConnectionInfo(): Observable<any> {
    let requestUrl = `https://foodloyale-functionapp.azurewebsites.net/api/negotiate`;
    let x = this._http.post(requestUrl,{
      "x-client-id": this.userId
    });
    return x;
  }

  init() {
    this.getConnectionInfo().subscribe((info) => {
     console.log(info);
      let options = {
        accessTokenFactory: () => info.accessToken
      };

      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(info.url, options)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.hubConnection.start()
        .catch((err: any) => console.error(err.toString()));

      

      this.listenToOrderFeeds();
      this.listenToBirthdayFeeds();
      this.listenToOrderUpdateFeeds();
    });
  };
 
}
