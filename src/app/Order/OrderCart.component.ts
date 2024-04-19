import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Product } from "../Models/Product";
import { Order } from "../Models/Order.model";
import { paymentService } from "../Services/PaymentService";
import { CartOrder } from "../Models/CartOder";
import { voucherService } from "../Services/VoucherService";
import { voucher } from "../Models/Voucher";
import { CartItem } from "../Models/CartItem";
import { orderDetail } from "../Models/OrderDetails";
import { TableSession } from "../Models/Session";
import { TableSessionService } from "../Services/TableSessionsService";
import { OrderDetailService } from "../Services/OrderDetailService";
import { OrderService } from "../Services/OrderService";
import { TableService } from "../Services/TableService";
import { Table } from "../Models/Table";
import { Waiter } from "../Models/Waiter";
import { detailCollapseIcon } from "@cds/core/icon";
import { number } from "echarts";
import { Observable, map, of, scheduled } from "rxjs";
import { sumAndSubtract } from "@cds/core/internal";
import { OrderCartService } from "../Services/OrderCartService";
import { randomUUID } from "crypto";

@Component({
    selector:'order-cart',
    templateUrl:'./OrderCart.component.html'
})

export class OrderCartComponent implements OnInit, AfterViewInit {
    constructor(private tableSessionSvr: TableSessionService,
        private orderDetailSvr:OrderDetailService,private orderSvr:OrderService,
         private _voucherSvr:voucherService, private odSvr:OrderService, private tableSvr: TableService,
        private cartOrderSVR: OrderCartService){
            
         }
    ngAfterViewInit(): void {
       this.SubTotal.subscribe(s=>{
            let vat:any = localStorage.getItem('vatCharge');
            let sCharge:any = localStorage.getItem('serviceCharge');
            this.VatCharge = (vat/100)*s;
            this.ServiceCharge = (sCharge/100)*s;
            this.TotalAmount = s+this.VatCharge+this.ServiceCharge;
       });
    }

    ngOnInit(): void {
        this.getVouchers();
    }

    appId = localStorage.getItem("user_id");
    @Output()cart: EventEmitter<Order> = new EventEmitter<Order>();
    @Input()lastorderId:any
    @Input()table!:Table;
    newOder!:Order;
    @Input()Products!: Product[];
    @Input()SubTotal!: Observable<number>;
    @Input()CartItems!:CartItem[];
    @Input()sessionType:any;
    feedBack!:string;
    spinnerStatus:boolean = false;
    vouchers:voucher[] = [];
    voucherToApply!: voucher;
    currencySymbol:any = localStorage.getItem('currency_iso_code');
    payButtonStatus:boolean = false;
    paymentMethod!:string;
    @Input()tableSession!:TableSession;
    vat:any = localStorage.getItem('vatCharge');
    sCharge:any = localStorage.getItem('serviceCharge');
    VatCharge:any;
    ServiceCharge:any;
    TotalAmount:any

    getVouchers(){
        let cache = this._voucherSvr.getVoucherCache;
        if(cache.length != 0){
            this.vouchers = cache;

        }else{
            this._voucherSvr.getVouchers().subscribe((v:any) => 
            {
                this.vouchers = v;
                this._voucherSvr.getVoucherCache = v;
                
            });
        }
    }

    onSelected(x:any){
        this.voucherToApply = this.vouchers.filter(v=>v.voucherNumber === x)[0];
    }

    onApply(){
        this.SubTotal.pipe(map(s=>{
            this.SubTotal = of(s - this.voucherToApply.voucherCreditAmount); 
            if(s <= 0){
            this.payButtonStatus = true;
            this.spinnerStatus = true;
            this.feedBack = 'Payment Succeeded!!'
        }
        }))
        
    }
    
    onCancel(p:CartItem){
        this.CartItems.splice(this.CartItems.indexOf(p),1);
        this.SubTotal = of(this.getSum(this.CartItems));
    }

    //update session isPayable to true, if items are in cart.
    //update or create order details
    //update order.
    //table status to occupied.
    onLockSession(){
    if(this.sessionType === "Takeaway")
    {
        console.log(this.lastorderId)
        //let cache = this.orderSvr.ordersCache; 
        //let lastorderid = cache.length >= 1 ? cache[cache.length - 1].orderID: 1;

        this.tableSession.name =  this.sessionType+" "+this.lastorderId;
        let virtualTable :Table = {name: this.tableSession.name, maxCovers: 1, status:"Occupied", applicationUserID:this.appId, type:'virtual'};
        let virtualWaiter:Waiter = {name: this.tableSession.name, applicationUserID:this.appId};
        this.tableSession.waiter = virtualWaiter;
        this.tableSession.table = virtualTable;
        
    }else{
        this.table.status = 'Occupied';
        this.tableSvr.updateTable(this.table,this.table.id).subscribe();
    }
        this.tableSession.applicationUserID = this.appId;
        this.tableSession.createdAt = new Date();
        this.tableSession.isPayable = this.CartItems.length >=1;
        
            //add session to database
        this.tableSessionSvr.addSession(this.tableSession).subscribe((r: TableSession) => {
           //create new order
        let od = new Order(); od.orderStatus = 'In-Session'; od.applicationUserID = r.applicationUserID;od.orderDate = r.createdAt; 
        od.channel = "In-Person";od.totalAmount = this.TotalAmount;od.tableSessionId = r.id; od.vatCharge = this.VatCharge;od.serviceCharge = this.ServiceCharge;
            //add order to database
        this.odSvr.addOrder(od).subscribe((or:Order) => {
                //emit order to parent component
        or.tableSession = r;
          //if there are items in cart, create order details and add to database.
                if(this.CartItems.length >=1){
                    

                    or.orderDetails = [];
                    

                    this.CartItems.forEach(x => {
                        let cd:CartOrder = {name:x.name,count:x.count,price:x.unitPrice,applicationUserID:this.appId,orderId:or.orderID,cartOrderId:this.appId,dateCreated:new Date()};
                        this.cartOrderSVR.addCartOrder(cd).subscribe();
                        or.orderDetails.push({name:x.name, quantity:x.count,unitPrice:x.unitPrice,applicationUserID:this.appId, orderId:or.orderID});
                    });
                    or.orderDetails.forEach(d => {
                        this.orderDetailSvr.addOrderDetail(d).subscribe();
              });
             
              this.CartItems = [];
              this.cart.emit(or);
              
            //if Dine-In, then update a stored table
        };
        }); 
        
    })
    }

    onCharge(){
        //if(this.paymentMethod === 'Card'){
        //    let ob: terminalPaymentObject = { amount: (this.TotalAmount*100).toString(), currency:this.PaymentSvr.currencySymbol}
        //    this.PaymentSvr.discoverReader().then((result:Reader)=>{
        //        this.spinnerStatus = true;
        //        this.feedBack = "Reader discovered: "+result.label;
        //        this.PaymentSvr.connectReader(result).then((status:string)=>{
        //            this.feedBack = status;
        //            this.PaymentSvr.processPayment(ob).then(g=>{
        //                let p: PaymentIntentRequest = {PaymentIntentId : g};
        //                this.PaymentSvr.capturePayment(p).subscribe((r:any)=> {
        //                  this.feedBack = r.status;
        //                  this.spinnerStatus = false;
        //                  if(this.feedBack === 'succeeded'){
        //                    this.createCartProducts(this.Products).then(p=>{
        //                        this.newOder = {products : p,totalAmount:this.TotalAmount,opened:true, orderStatus:"Approved", 
        //                        channel:'in-person', orderDate:Date.now(), orderID:0,customerID:0,payment:"succeeded", applicationUserID: this.appId }
        //                        this.cart.emit(this.newOder);
        //                    });
        //                  }
        //                });
        //              },(err:any)=> {this.feedBack = err;  }); //if payment could not be processed.
        //        })
        //    },(er:any)=> {this.feedBack = er;}); //if reader is not discovered.
        //}else if(this.paymentMethod === 'Cash'){
            
        //}
           
        }
        
    onPaymentSelection(x:any){
        this.paymentMethod = x;
    }
    

    getSum(p: CartItem[]):number{
        let sum = 0;
        if(p.length >=1){
            p.forEach(pr=>{
                sum += pr.unitPrice*pr.count
            })
        }
        return sum;
    }

    /* createCartProducts(y:Product[]):Promise<CartOrder[]>{
        return new Promise((resolve)=>{
            let cartProducts: CartOrder[] = [];
            if(y.length !== 0){
                y.forEach(p=>{
                    let cart: CartOrder = {cartOrderId:0,orderId:0, name: p.name, category: p.category, price:p.price, description: p.description, code:p.code};
                    cartProducts.push(cart);
                })
            }
            resolve(cartProducts);
        });
        
    } */



    
}
