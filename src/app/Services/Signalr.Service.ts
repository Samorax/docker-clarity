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
  private $allFeed: Subject<any> = new Subject<any>();
    hubConnection: any;

  public get AllFeedObservable(): Observable<Order> {
    return this.$allFeed.asObservable();
  };

  listenToAllFeeds() {
    (<HubConnection>this.hubConnection).on("ordered", (data: Order) => {
      this.$allFeed.next(data);
    });
  }
  //private hubConnection: any;
  //receiveorders20231123194629.azurewebsites.net
  private getConnectionInfo(): Observable<any> {
    let requestUrl = `https://foodloyale-functionapp.azurewebsites.net/api/negotiate`;
    let x = this._http.post(requestUrl,{});
    return x;
  }

  init() {
    this.getConnectionInfo().subscribe((info) => {
     
      let options = {
        accessTokenFactory: () => info.accessToken
      };

      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(info.url, options)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.hubConnection.start()
        .catch((err: any) => console.error(err.toString()));

      

      this.listenToAllFeeds();
    });
  };
 
}
