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
  private $tableSessionUpdateFeed: Subject<any> = new Subject<any>();

  hubConnection: any;
  public get AllTableSessionUpdateFeedObservable():Observable<any>
  {
    return this.$tableSessionUpdateFeed.asObservable();
  }

  public get AllOrderFeedObservable(): Observable<Order> {
    return this.$orderFeed.asObservable();
  };
  public get AllBirthdayFeedObservable(): Observable<any> {
    return this.$birthdayFeed.asObservable();
  };
  public get AllOrderUpdateFeedObservable(): Observable<any> {
    return this.$orderUpdateFeed.asObservable();
  };

  //order updates from the website
  listenToOrderFeeds() {
    (<HubConnection>this.hubConnection).on("ordered", (data: any) => {
      this.$orderFeed.next(data);
    });
  }

  //birthday updates of customers
  listenToBirthdayFeeds(){
    (<HubConnection>this.hubConnection).on("birthday",(data: any) =>{ this.$birthdayFeed.next(data)})
  }

  //order updates from dojo payment terminal
  listenToOrderUpdateFeeds(){
    (<HubConnection>this.hubConnection).on("orderUpdate",(data: any) =>{ this.$orderUpdateFeed.next(data); console.log(data,"oderupdate")})
  }

  //table-session updates from dojo payment terminal
  listenToTableSessionUpdateFeeds(){
    (<HubConnection>this.hubConnection).on("tableSessionUpdate",(data: any) =>{ this.$tableSessionUpdateFeed.next(data); console.log(data,"session")})
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
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.hubConnection.start()
        .catch((err: any) => console.error(err.toString()));

      

      this.listenToOrderFeeds();
      this.listenToBirthdayFeeds();
      this.listenToOrderUpdateFeeds();
      this.listenToTableSessionUpdateFeeds();
    });
  };
 
}
