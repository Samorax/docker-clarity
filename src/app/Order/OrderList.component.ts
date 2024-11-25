import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { Order } from "../Models/Order.model";
import { Product } from "../Models/Product";
import { SignalrService } from "../Services/Signalr.Service";
import { OrderService } from "../Services/OrderService";
import { OrderEditComponent } from "./OrderEdit.component";
import { OrderAddComponent } from "./OrderAdd.component";
import { paymentService } from "../Services/PaymentService";
import { PaymentObject } from "../Models/PaymentObject";
import { Table } from "../Models/Table";
import { Waiter } from "../Models/Waiter";
import { TableService } from "../Services/TableService";
import { WaiterService } from "../Services/WaiterService";
import { OrderInSessionEditComponent } from "./OrderInSessionEdit.Component";
import { OrderCartComponent } from "./OrderCart.component";
import { CustomerService } from "../Services/Customer/CustomerService";
import { Customer } from "../Models/Customer";
import { ProductService } from "../Services/ProductService";
import { voucherService } from "../Services/VoucherService";
import { voucher } from "../Models/Voucher";
import { OrderSmsComponent } from "./OrderSms.component";
import { SmsService } from "../Services/SmsService";
import { orderDetail } from "../Models/OrderDetails";
import { SmSActivatorService } from "../Services/SmsActivatorService";
import { OrderAnnulComponent } from "./OrderAnnul.component";
import { OrderReconcileComponent } from "./OrderReconcile.component";
import { BehaviorSubject, of } from "rxjs";
import { stockService } from "../Services/Stock/StockService";
import { ClarityIcons, eraserIcon, shrinkIcon } from "@cds/core/icon";
import { ActivatedRoute } from "@angular/router";
ClarityIcons.addIcons(eraserIcon,shrinkIcon)



@Component({
    selector:'app-orders',
    templateUrl:'./OrderList.component.html',
    styleUrl:'./OrderList.component.css',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class OrderListComponent implements OnInit, AfterViewInit{


// On Annul, order status is changed to "Cancelled" - this implies the total amount is exempted from the total sale revenue since it is not "Completed".
// the line-through styling is also applied to depict cancellation to the user.
// the order is updated on the server-side and payment refund is processed
onAnnul() {
    let o = <Order>this.selected[0];
    this.annulOrderModal.open(o);
}

//
onReconcile() {
this.reconcileOrderModal.open();
}

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
  @ViewChild(OrderAnnulComponent)annulOrderModal!:OrderAnnulComponent;
  @ViewChild(OrderReconcileComponent)reconcileOrderModal!:OrderReconcileComponent;

  @ViewChild(OrderSmsComponent)orderSms!:OrderSmsComponent
  paymentFeedbackError: any;
  enableSms:boolean = true;
  

  constructor(private orderService: OrderService, private custSVR:CustomerService, private voucherSVR:voucherService,private cd:ChangeDetectorRef, private stkSVR:stockService,
    private tableSvr: TableService, private waiterSvr: WaiterService, private signalrSVR: SignalrService, private _smsActivator:SmSActivatorService,
    private paymentService: paymentService, private productSVR: ProductService, private _smsSvr: SmsService, private activatedRoute:ActivatedRoute) {

  }
    ngAfterViewInit(): void {
      
      this._smsActivator.getState.subscribe(a=>
        {
          console.log(a,"enable sms")
          this.enableSms = a;
          this.cd.detectChanges();
        });

      this.reconcileOrderModal.reconcileDialog.subscribe((o:Order[])=>{
        o.forEach(o=>{
          o.isDeleted = true;
          this.orderService.updateOrder(o.orderID,o).subscribe();
        });

        this.reconcileOrderModal.close();
      });

      this.annulOrderModal.annuldialog.subscribe((o:Order)=>{
        o.isCancelled = true;
        o.orderStatus = "Cancelled";
        this.orderService.updateOrder(o.orderID,o).subscribe(r=>{
          if(o.isCompleted){
            this.paymentService.refundDojoPayment(o).subscribe(r=> console.log(r));
          }
          });
          this.annulOrderModal.close();
      });

      this.OrderEditModal.editdialog.subscribe(o=>{
        this.orderService.updateOrder(o.orderID,o).subscribe();
        this.orderService.getOrders().subscribe(ord => {
              this.orders = ord;
          
        });
      });

      //add order from session to list from POS
      this.OrderAddModal.orda.subscribe(o => {
          this.orders.unshift(o);
          this.OrderAddModal.close();
        });


        this.orderInSession.OrderSessionCartModal.cart.subscribe((o:any)=>{
          let index = this.orders.findIndex(x=> x.orderID === o.orderID);
          this.orders[index] = o;
          this.orderInSession.close();
        },(er:Error)=>console.log(er));


      this.signalrSVR.AllOrderFeedObservable.subscribe((o:any)=>{
        let ord = JSON.parse(o);
        this.orders.unshift(ord);
        this.cd.detectChanges();
      })

      this.signalrSVR.AllOrderUpdateFeedObservable.subscribe((o: any) => {
        let ord = JSON.parse(o);
        let x = this.orders.findIndex((x:any) => x.OrderID === ord.orderID);
        this.orders[x].orderStatus = ord.OrderStatus;
        this.cd.detectChanges();
      });


      this.orderSms.smsForm.subscribe(s=>{
        this._smsSvr.sendMessage(s).subscribe(x=>{
        })
        this.orderSms.close();
      })
  }



    ngOnInit(): void {
      this.activatedRoute.data.subscribe((o:any)=>{
          this.orders = o.orders.filter((o:any)=>o.isDeleted === false);
            //index is 0 because the list is in ascending order.
            //return the last order id and pass it to the child component (Cart) to reference a Takeaway order.
            this.lastId = this.orders[0].orderID;
            this.cd.detectChanges();
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
      if(od.channel !== 'On-Site'){
        this.OrderEditModal.open(od);
      }else{
        this.OrderInSessionEditModal.open(od)
      }
      
    }

    sendMessage(x:Customer){
      this.orderSms.open(x);
    }

    //if order is approved; get the payment intent id from the server
    //store the returned id temporarily, using the order id as a key.
    onApprove(x:Order,y:string){
      if(y === "Approved" && x.orderStatus !== 'Approved'){
        let pk: PaymentObject = {
          CustomerEmail:'damexix7@gmail.com', 
          Amount : x.totalAmount*100, Currency : this.currencySymbol, SetupIntentId:x.paymentToken, OrderId: x.orderID,Description:`This sale is for order with reference ${x.orderID}`};

        this.paymentService.createDojoPaymentIntent(pk).subscribe((r:any)=>{
          localStorage.setItem(x.orderID,r);
          this.showChargeButton = false;
          x.orderStatus = "Approved";
          x.isApproved = true;
          this.cd.detectChanges()
        },(er)=>
        {x.paymentFeedback = 'This order cannot be approved. Either the Total value is 0 or it has already been charged.';
        
        },()=> {
          
          this.orderService.updateOrder(x.orderID,x).subscribe();
        });
      }else if(x.orderStatus === 'Approved'){
          this.showChargeButton = false;
          this.cd.detectChanges()
      }else{
        x.orderStatus = "Unapproved";
        this.cd.detectChanges()
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
          x.paymentFeedback = `Payment is ${r.status}`;
          this.showChargeButton = true;
          x.orderStatus = 'Completed';
          x.isCompleted = true;
          x.payment = 'Paid';
          x.paymentToken = paymentToken;
          this.cd.detectChanges();
          this.orderService.updateOrder(x.orderID,x).subscribe(r=>{
            this.updateCustomer(x);
          });
          };
          
        },(er:Error)=>{x.paymentFeedbackError = `Payment Error: ${er.message}`})}
      
      private updateCustomer(order:Order)
      {console.log(order);
        this.custSVR.getCustomer(order.customerRecordId).subscribe((c:Customer)=>{
          let pts:number = 0;
          order.orderDetails.forEach(o=>{
          //this.updateStock(o);
            let product = this.products.find(p=>p.name === o.name);
            let voucher:any = this.vouchers.find(v=>v.voucherNumber === o.name);
            if(voucher != undefined){
              voucher.units--;
              this.voucherSVR.updateVoucher(voucher.voucherId,voucher).subscribe();
            }
            pts += product !== undefined?product?.loyaltyPoints:0;
          });
          console.log(pts,'loyaltypts')
          c.loyaltyPoints += pts;
          c.totalAmountSpent += order.totalAmount
          console.log(order);
          this.custSVR.updateCustomer(order.customerRecordId,c).subscribe(); 
          });
    
        
      }

      
      

      /* this.paymentService.processOnlinePayment(r, x.paymentToken).then((r:any)=>{
        this.paymentFeedback = r.status;
        x.payment = r.status;
        this.orderService.updateOrder(x.orderID,x).subscribe(); */

      onDetailOpen(x: Order){
        x.opened = true;
        this.orderService.updateOrder(x.orderID,x).subscribe(()=>{
          this.orderService.getOrders().subscribe((o:Order[])=>{

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
