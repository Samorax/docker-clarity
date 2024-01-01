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



@Component({
    selector:'app-orders',
    templateUrl:'./OrderList.component.html'
})

export class OrderListComponent implements OnInit, AfterViewInit{
  paymentFeedback:any

  @ViewChild(OrderEditComponent) OrderEditModal!: OrderEditComponent;
  @ViewChild(OrderAddComponent) OrderAddModal!: OrderAddComponent;

  constructor(private signalrService: SignalrService, private orderService:OrderService, private paymentService: paymentService) {

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

      this.OrderAddModal.orderAddModal.subscribe(o=> {
        this.orderService.addOrder(o).subscribe(x=>this.orders.push(x));
      });

      this.signalrService.AllFeedObservable.subscribe(ord => {
        this.orders.push(ord);
        this.orderService.addOrder(ord).subscribe();
      });
  }

    ngOnInit(): void {
      let cache = this.orderService.ordersCache;
      if(cache.length >= 1){
        console.log(cache);
        cache.forEach(o=>this.orders.push(o));
      }else{
        this.orderService.getOrders().subscribe(ord => {
          ord.forEach(o => {
            this.orders.push(o);
            this.orderService.ordersCache.push(o);
          });
        });
      }
     
    }

    selected: any[] = [];
  
    
    orders: Array<Order> =[];
    

    onAdd(){
      this.OrderAddModal.open();
    }

    onEdit(){
      this.OrderEditModal.open(this.selected[0]);
    }

    async onCharge(x:Order){
      let pk: PaymentObject = { Amount : x.totalAmount*100, Currency : "GBP" };
      this.paymentService.createOnlineIntent(pk).subscribe(r=>{
        x.token = "tok_visa";
        this.paymentService.processOnlinePayment(r, x.token).then((r:any)=>{
          this.paymentFeedback = r.status;
          x.payment = r.status;
          this.orderService.updateOrder(x.orderID,x).subscribe();

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
