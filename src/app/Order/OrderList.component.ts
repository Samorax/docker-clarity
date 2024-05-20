import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { Order } from "../Models/Order.model";
import { Product } from "../Models/Product";
import { SignalrService } from "../Services/Signalr.Service";
import { OrderService } from "../Services/OrderService";
import { OrderEditComponent } from "./OrderEdit.component";
import { OrderAddComponent } from "./OrderAdd.component";
import { paymentService } from "../Services/PaymentService";
import { PaymentObject } from "../Models/PaymentObject";
;
import { Table } from "../Models/Table";
import { Waiter } from "../Models/Waiter";
import { TableService } from "../Services/TableService";
import { WaiterService } from "../Services/WaiterService";
import { OrderInSessionEditComponent } from "./OrderInSessionEdit.Component";
import { OrderCartComponent } from "./OrderCart.component";
import { CustomerService } from "../Services/CustomerService";
import { Customer } from "../Models/Customer";
import { ProductService } from "../Services/ProductService";
import { voucherService } from "../Services/VoucherService";
import { voucher } from "../Models/Voucher";



@Component({
    selector:'app-orders',
    templateUrl:'./OrderList.component.html',
    styleUrl:'./OrderList.component.css'
})

export class OrderListComponent implements OnInit, AfterViewInit{
  tables:Table[] = [];
  waiters:Waiter[] = [];
  products:Product[] = [];
  vouchers: voucher[] = [];

  @Output()lastOrderId:EventEmitter<any> = new EventEmitter();
  lastId:any;

  paymentFeedback:any
  currencySymbol: string = this.paymentService.currencySymbol;

  showChargeButton:boolean = true;
  
  @ViewChild(OrderInSessionEditComponent) OrderInSessionEditModal!: OrderInSessionEditComponent;
  @ViewChild(OrderEditComponent) OrderEditModal!: OrderEditComponent;
  //@ViewChild(OrderCartComponent) OrderCartModal!: OrderCartComponent;
  @ViewChild(OrderAddComponent)OrderAddModal!:OrderAddComponent;
  @ViewChild(OrderInSessionEditComponent)orderInSession!:OrderInSessionEditComponent;
  

  constructor(private orderService: OrderService, private custSVR:CustomerService, private voucherSVR:voucherService,
    private tableSvr: TableService, private waiterSvr: WaiterService, private signalrSVR: SignalrService,
    private paymentService: paymentService, private productSVR: ProductService) {

  }
    ngAfterViewInit(): void {
      this.OrderEditModal.editdialog.subscribe(o=>{
        this.orderService.updateOrder(o.orderID,o).subscribe();
        this.orderService.getOrders().subscribe(ord => {
              this.orders = ord;
          
        });
      });

      this.OrderAddModal.orda.subscribe(o => {
          this.orders.unshift(o);
          this.OrderAddModal.close();
        });

        this.orderInSession.OrderSessionCartModal.cart.subscribe((o:any)=>{
          
          let index = this.orders.findIndex(x=> x.orderID === o.orderID);
          this.orders[index] = o;
          this.orderInSession.close();
        },(er:Error)=>console.log(er));

      this.signalrSVR.AllOrderUpdateFeedObservable.subscribe((o: any) => {
        let ord = JSON.parse(o);
        let x = this.orders.findIndex((x:any) => x.OrderID === ord.orderID);
        this.orders[x].orderStatus = ord.OrderStatus;
        
      });
  }



    ngOnInit(): void {
      
        this.orderService.getOrders().subscribe(ord => {
            this.orders = ord;
            //index is 0 because the list is in ascending order.
            //return the last order id and pass it to the child component (Cart) to reference a Takeaway order.
            this.lastId = this.orders[0].orderID;
          ;
        });
      

      this.getWaiters();
      this.getTables();
      this.getProducts();
      this.getVouchers();


    }

   

    selected: any[] = [];
  
    
    orders: Array<Order> =[];
    getVouchers(){
      this.voucherSVR.getVouchers().subscribe((v:any)=> this.vouchers = v);
    }

    getProducts(){
      this.productSVR.getProducts().subscribe(p=> this.products = p);
    }

    getWaiters(){
      this.waiterSvr.getWaiters().subscribe((ws:Waiter[])=>
        this.waiters = ws.filter(s=>s.name.includes("Takeaway")==false));
    }

    getTables(){
      this.tableSvr.getTables().subscribe((ts:any)=>
       {
        let t = ts.filter((x:Table)=> x.status === 'Available');
        this.tables = t;
        });
    }

    onAdd(){
      this.OrderAddModal.lastorderId = this.lastId;
      this.OrderAddModal.open();
      
    }

    //check the order channel of the order
    //open the edit dialog accordingly
    onEdit(){
      let od = <Order>this.selected[0];
      console.log(od);
      if(od.channel !== 'On-Site'){
        this.OrderEditModal.open(od);
      }else{
        this.OrderInSessionEditModal.open(od)
      }
      
    }

    //if order is approved; get the payment intent id from the server
    //store the returned id temporarily, using the order id as a key.
    onApprove(x:Order,y:string){
      if(y === "Approved" && x.orderStatus !== 'Approved'){
        let pk: PaymentObject = { Amount : x.totalAmount*100, Currency : this.currencySymbol, SetupIntentId:x.paymentToken, OrderId: x.orderID,Description:`This sale is for order with reference ${x.orderID}`};
        this.paymentService.createDojoPaymentIntent(pk).subscribe((r:any)=>{
          localStorage.setItem(x.orderID,r);
          this.showChargeButton = false;
          x.orderStatus = "Approved";
        },(er)=>
        {this.paymentFeedback = 'This order cannot be approved. Either the Total value is 0 or it has already been charged.';
        console.log(er)
        },()=> {
          let o = this.orderService.ordersCache.findIndex(o=>o.orderID === x.orderID);
          this.orderService.ordersCache[o]=x;
          this.orderService.updateOrder(x.orderID,x).subscribe();
        });
      }else if(x.orderStatus === 'Approved'){
          this.showChargeButton = false;
      }else{
        x.orderStatus = "Unapproved";
      }
    }

    //update customer loyalty points.
    //if seller clicks charge button, send request to server to charge card
    //if charge response is succeful, give feedback and clear temporary storage.
    //otherwise, show error message and enable retry.
    onCharge(x:Order){
      let paymentToken:any = localStorage.getItem(x.orderID);
       this.paymentService.chargeDojoPayment(paymentToken).subscribe((r:any)=>{
        if(r.status === "Successful"){
          localStorage.removeItem(x.orderID);
          this.paymentFeedback = `Payment is ${r.status}`;
          this.showChargeButton = true;
          x.orderStatus = 'Completed';
          x.payment = 'Paid';
          };
          
        },(er)=>console.log(er),()=> this.updateCustomer(x))}
      
      private updateCustomer(order:Order)
      {
        this.custSVR.getCustomer(order.customerID).subscribe((c:Customer)=>{
          let pts:number = 0;
          order.orderDetails.forEach(o=>{
            let product = this.products.find(p=>p.name === o.name);
            let voucher:any = this.vouchers.find(v=>v.voucherNumber === o.name);
            if(voucher != undefined){
              voucher.units--;
              this.voucherSVR.updateVoucher(voucher.voucherId,voucher);
            }
            pts += product?.loyaltyPoints;
          });
          c.loyaltyPoints += pts;
          c.totalAmountSpent += order.totalAmount
          console.log(c.totalAmountSpent,'Amount Spent');
          console.log(order.totalAmount,'order amount');
          this.custSVR.updateCustomer(order.customerID,c).subscribe(); 
          });
        let o = this.orderService.ordersCache.findIndex(o=>o.orderID === order.orderID);
        this.orderService.ordersCache[o]=order;
        this.orderService.updateOrder(order.orderID,order).subscribe();
      }
      

      /* this.paymentService.processOnlinePayment(r, x.paymentToken).then((r:any)=>{
        this.paymentFeedback = r.status;
        x.payment = r.status;
        this.orderService.updateOrder(x.orderID,x).subscribe(); */

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
