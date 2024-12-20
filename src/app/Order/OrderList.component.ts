import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { Order } from "../Models/Order.model";
import { Product } from "../Models/Product";
import { SignalrService } from "../Services/Signalr.Service";
import { OrderService } from "../Services/Order/OrderService";
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
import { ProductService } from "../Services/Product/ProductService";
import { voucherService } from "../Services/VoucherService";
import { voucher } from "../Models/Voucher";
import { OrderSmsComponent } from "./OrderSms.component";
import { SmsService } from "../Services/SmsService";
import { orderDetail } from "../Models/OrderDetails";
import { SmSActivatorService } from "../Services/SmsActivatorService";
import { OrderAnnulComponent } from "./OrderAnnul.component";
import { OrderReconcileComponent } from "./OrderReconcile.component";
import { BehaviorSubject, distinct, of } from "rxjs";
import { stockService } from "../Services/Stock/StockService";
import { ClarityIcons, eraserIcon, shrinkIcon } from "@cds/core/icon";
import { ActivatedRoute } from "@angular/router";
import { saveAs } from "file-saver";
import { ClrLoadingState } from "@clr/angular";
import { TableSessionService } from "../Services/TableSessionsService";
ClarityIcons.addIcons(eraserIcon,shrinkIcon)



@Component({
    selector:'app-orders',
    templateUrl:'./OrderList.component.html',
    styleUrl:'./OrderList.component.css',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class OrderListComponent implements OnInit, AfterViewInit{
  orderSignalRUpdate: any;


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
    private tableSvr: TableService, private waiterSvr: WaiterService, private signalrSVR: SignalrService, private _smsActivator:SmSActivatorService, private tableSessionSVR:TableSessionService,
    private paymentService: paymentService, private productSVR: ProductService, private _smsSvr: SmsService, private activatedRoute:ActivatedRoute) {

  }
    ngAfterViewInit(): void {
      
      this._smsActivator.getState.subscribe(a=>
        {
        
          this.enableSms = a;
          this.cd.detectChanges();
        });

      this.reconcileOrderModal.reconcileDialog.subscribe((o:Order[])=>{
        o.forEach(o=>{
          o.isDeleted = true;
          this.orderService.updateOrder(o.orderID,o).subscribe();

        });
        this.orderService.downloadReconcilationFile(o).subscribe(d=>saveAs(d,'reconcilation.pdf'));
        this.reconcileOrderModal.close();
      });

      this.annulOrderModal.annuldialog.subscribe((o:Order)=>{
        o.isCancelled = true;
        o.orderStatus = "Cancelled";
        o.tableSession.isPayable = false;
        this.orderService.updateOrder(o.orderID,o).subscribe(r=>{
          if(o.isCompleted){
            this.paymentService.refundDojoPayment(o).subscribe(r=> console.log(r));
          }
          this.tableSessionSVR.updateSession(o.tableSession, o.tableSession.id).subscribe();
          });

          this.annulOrderModal.close();
      });

      this.OrderEditModal.editdialog.subscribe(o=>{
        this.orderService.updateOrder(o.orderID,o).subscribe();
        
      });

      //add order from session to list from POS
      this.OrderAddModal.orda.subscribe(o => {
        let currentOrders = this.orders.getValue();
        currentOrders.unshift(o);
        this.orders.next(currentOrders);
          this.OrderAddModal.close();
        });


        this.orderInSession.OrderSessionCartModal.cart.subscribe((o:any)=>{
          
          let currentOrders = this.orders.getValue();
          let index = currentOrders.findIndex((x:Order)=> x.orderID === o.orderID);
          currentOrders[index] = o;
          this.orders.next(currentOrders);
          this.orderInSession.OrderSessionCartModal.applyVouchBtn = ClrLoadingState.DEFAULT
          this.orderInSession.close();
        });


      this.signalrSVR.AllOrderFeedObservable.subscribe((o:any)=>{
        console.log(o);
        let ord = JSON.parse(o);
        console.log(ord);
        this.orders.subscribe(or=>
          {
            or.unshift(ord);
            
          });
      })

      this.signalrSVR.AllOrderUpdateFeedObservable.subscribe((o: any) => {
        let ord = JSON.parse(o);
        let currentOrders = this.orders.getValue();
        let x = currentOrders.findIndex((x:any) => x.OrderID === ord.orderID);
        currentOrders[x].orderStatus = ord.OrderStatus;
        this.orders.next(currentOrders);
      });


      this.orderSms.smsForm.subscribe(s=>{
        this._smsSvr.sendMessage(s).subscribe(x=>{
        })
        this.orderSms.close();
      })
  }



    ngOnInit(): void {
      
      this.activatedRoute.data.subscribe((o:any)=>{
          let latestOrders= o.orders.filter((o:any)=>o.isDeleted === false);
          console.log(latestOrders)
            //index is 0 because the list is in ascending order.
            //return the last order id and pass it to the child component (Cart) to reference a Takeaway order.
            this.orders.next(latestOrders);
            this.orders.pipe(distinct())
            
          ;
        });
    

      this.getWaiters();
      this.getTables();
      this.getProducts();
      this.getVouchers();

    }

   

    selected: any[] = [];
  
    
    orders: BehaviorSubject<any> = new BehaviorSubject<Order[]>([]);
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
    
      if(od.channel !== 'In-Person'){
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
