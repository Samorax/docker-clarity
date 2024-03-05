import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Order } from "../Models/Order.model";
import { Product } from "../Models/Product";
import { SignalrService } from "../Services/Signalr.Service";
import { OrderService } from "../Services/OrderService";
import { OrderEditComponent } from "./OrderEdit.component";
import { OrderAddComponent } from "./OrderAdd.component";
import { paymentService } from "../Services/PaymentService";
import { PaymentObject } from "../Models/PaymentObject";
import { loadStripe } from "@stripe/stripe-js";
import { Table } from "../Models/Table";
import { Waiter } from "../Models/Waiter";
import { TableService } from "../Services/TableService";
import { WaiterService } from "../Services/WaiterService";
import { OrderInSessionEditComponent } from "./OrderInSessionEdit.Component";
import { OrderCartComponent } from "./OrderCart.component";



@Component({
    selector:'app-orders',
    templateUrl:'./OrderList.component.html',
    styleUrl:'./OrderList.component.css'
})

export class OrderListComponent implements OnInit, AfterViewInit{
  tables:Table[] = [];
  waiters:Waiter[] = [];

  paymentFeedback:any
  currencySymbol: string = this.paymentService.currencySymbol;
  
  @ViewChild(OrderInSessionEditComponent) OrderInSessionEditModal!: OrderInSessionEditComponent;
  @ViewChild(OrderEditComponent) OrderEditModal!: OrderEditComponent;
  //@ViewChild(OrderCartComponent) OrderCartModal!: OrderCartComponent;
  @ViewChild(OrderAddComponent)OrderAddModal!:OrderAddComponent;
  @ViewChild(OrderInSessionEditComponent)orderInSession!:OrderInSessionEditComponent;

  constructor(private signalrService: SignalrService, private orderService: OrderService,
    private tableSvr: TableService, private waiterSvr: WaiterService, private signalrSVR: SignalrService,
    private paymentService: paymentService) {

  }
    ngAfterViewInit(): void {
      this.OrderEditModal.editdialog.subscribe(o=>{
        this.orderService.updateOrder(o.orderID,o).subscribe();
        this.orderService.ordersCache = [];
        this.orderService.getOrders().subscribe(ord => {
          ord.forEach(o => {
            this.orders.push(o);
            this.orderService.ordersCache.push(o);
          });
        });
      });

      this.OrderAddModal.orda.subscribe(o => {
          this.orders.push(o);
          this.OrderAddModal.close();
        });

        this.orderInSession.OrderSessionCartModal.cart.subscribe(o=>{
          console.log(o);
          let index = this.orders.findIndex(x=> x.orderID === o.orderID);
          this.orders[index] = o;

          this.orderInSession.close();
        })

      this.signalrSVR.AllOrderUpdateFeedObservable.subscribe((o: any) => {
        let x = this.orders.find(x => x.orderID === o.OrderID);
        x!.orderStatus = o.OrderStatus;
        x!.paidAmount = o.PaidAmount;
      });

      


  }



    ngOnInit(): void {
      let cache = this.orderService.ordersCache;
      if(cache.length >= 1){
        this.orders = cache;
      
      }else{
        this.orderService.getOrders().subscribe(ord => {
            this.orders = ord
            this.orderService.ordersCache = ord;
          ;
        });
      }

      this.getWaiters();
      this.getTables();


    }

   

    selected: any[] = [];
  
    
    orders: Array<Order> =[];
    
    getWaiters(){
      this.waiterSvr.getWaiters().subscribe((ws:any)=>this.waiters = ws);
    }

    getTables(){
      this.tableSvr.getTables().subscribe((ts:any)=>
       {
        let t = ts.filter((x:Table)=> x.status === 'Available');
        this.tables = t;
        });
    }

    onAdd(){
      this.OrderAddModal.open();
    }

    //check the order channel of the order
    //open the edit dialog accordingly
    onEdit(){
      let od = <Order>this.selected[0];
      if(od.channel !== 'On-Site'){
        this.OrderEditModal.open(od);
      }else{
        this.OrderInSessionEditModal.open(od)
      }
      
    }

    async onCharge(x:Order){
      let pk: PaymentObject = { Amount : x.totalAmount*100, Currency : this.currencySymbol };
      this.paymentService.createOnlineIntent(pk).subscribe(r=>{
        this.paymentService.processOnlinePayment(r, x.paymentToken).then((r:any)=>{
          this.paymentFeedback = r.status;
          x.payment = r.status;
          this.orderService.updateOrder(x.orderID,x).subscribe();

        })
      })

      }

      onDetailOpen(x: Order){
        x.opened = true;
        this.orderService.updateOrder(x.orderID,x).subscribe(()=>{
          this.orderService.getOrders().subscribe((o:Order[])=>{
            this.orderService.ordersCache = o;
          })
        })
      }

      onStatus(x:any){
        console.log(x.value);
      }

      convertBack2Byte(y:Product[]){
        y.forEach(p=>{
          let s = p.photosUrl.changingThisBreaksApplicationSecurity;
          p.photosUrl = s.split(',')[1];
        })
      }

     
    }
