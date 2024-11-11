import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Order } from "../Models/Order.model";
import * as signalR from "@microsoft/signalr";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { HubConnection } from "@microsoft/signalr";
import { Customer } from "../Models/Customer";
import { voucher } from "../Models/Voucher";


@Injectable({
  providedIn:'root'
})
export class SignalrService {
  
  
  
  constructor(private _http: HttpClient) {
    
  }
  userId:any = localStorage.getItem("user_id");
  private $orderFeed: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private $birthdayFeed: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private $orderUpdateFeed: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private $tableSessionUpdateFeed: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private $newCustomerFeed: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private $CustomerUpdateFeed: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private $voucherFeed: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private $stockUpdateFeed: BehaviorSubject<any> = new BehaviorSubject<any>({});

  hubConnection: any;
  public get AllTableSessionUpdateFeedObservable():Observable<any>
  {
    return this.$tableSessionUpdateFeed.asObservable();
  }

  public get AllOrderFeedObservable(): Observable<Order> {
    return this.$orderFeed.asObservable();
  };

  public get AllStockUpdateFeedObservable(): Observable<any>{
    return this.$stockUpdateFeed.asObservable();
  }

  public get AllVoucherFeedObservable(): Observable<any>{
    return this.$voucherFeed.asObservable();
  }
  public get AllBirthdayFeedObservable(): Observable<any> {
    return this.$birthdayFeed.asObservable();
  };
  public get AllOrderUpdateFeedObservable(): Observable<Order> {
    return this.$orderUpdateFeed.asObservable();
  };

  public get AllCustomerUpdateFeedObservable(): Observable<any>{
    return this.$CustomerUpdateFeed.asObservable();
  }

  public get AllNewCustomerFeedObservable():Observable<any>{
    return this.$newCustomerFeed.asObservable();
  }

  //listen to new orders from the website/mobile app
  listenToOrderFeeds() {
    (<HubConnection>this.hubConnection).on("ordered", (data: any) => {
      this.$orderFeed.next(data);
    });
  }

  //listen to voucher updates
  listenToVoucherFeeds(){
    (<HubConnection>this.hubConnection).on("voucher", (data: any) => {
      this.$voucherFeed.next(data);
    });
  }

  listenToStockUpdateFeeds(){
    (<HubConnection>this.hubConnection).on('stock',(data:any)=>{
      this.$stockUpdateFeed.next(data);
    })
  }

   //listen to order updates from payment terminal
  listenToOrderUpdateFeeds(){
    (<HubConnection>this.hubConnection).on("orderUpdate",(data: any) =>{ 
      this.$orderUpdateFeed.next(data); 
    });
  }

  //listen to new customer registration from website/mobile app
  listenToCustomerFeeds(){
    (<HubConnection>this.hubConnection).on("newCustomer",(data:Customer)=>{
      this.$newCustomerFeed.next(data);
    })
  }

  //listen to customer updates from website/mobile app
  listenToCustomerUpdateFeeds(){
    (<HubConnection>this.hubConnection).on("customerUpdate",(data:Customer)=>{
      this.$CustomerUpdateFeed.next(data);
    })
  }



  //birthday updates of customers
  listenToBirthdayFeeds(){
    (<HubConnection>this.hubConnection).on("birthday",(data: any) =>{ this.$birthdayFeed.next(data)})
  }

  //table-session updates from dojo payment terminal
  listenToTableSessionUpdateFeeds(){
    (<HubConnection>this.hubConnection).on("tableSessionUpdate",(data: any) =>{ this.$tableSessionUpdateFeed.next(data); console.log(data,"session")})
  }

  //private hubConnection: any;
  //receiveorders20231123194629.azurewebsites.net
  private getConnectionInfo(): Observable<any> {
    let requestUrl = `https://foodloyale-functionapp.azurewebsites.net/api/negotiate`;
    let header = new HttpHeaders();
    header = header.set("x-client-id",this.userId);
    let x = this._http.post(requestUrl,{},{
      headers:header
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
      this.listenToVoucherFeeds();
      this.listenToBirthdayFeeds();
      this.listenToOrderUpdateFeeds();
      this.listenToCustomerFeeds();
      this.listenToCustomerUpdateFeeds();
      this.listenToTableSessionUpdateFeeds();
      this.listenToStockUpdateFeeds();
    });
  };
 
}
