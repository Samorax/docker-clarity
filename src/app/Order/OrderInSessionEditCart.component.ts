import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
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

@Component({
    selector:'order-EditCart',
    templateUrl:'./OrderInSessionEditCart.component.html'
})

export class OrderInSessionEditCartComponent implements OnInit {
    constructor(private PaymentSvr: paymentService, private tableSessionSvr: TableSessionService,
        private orderSvr:OrderService, private  oddSVr: OrderDetailService,
         private _voucherSvr:voucherService){}

    ngOnInit(): void {
        this.getVouchers();
    }

    appId = localStorage.getItem("user_id");
    @Output()cart: EventEmitter<Order> = new EventEmitter<Order>();
    @Input()table!:Table;
    newOder!:Order;
    @Input()order!:Order;
    @Input()Products!: Product[];
    @Input()TotalAmount: number = 0;
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
        this.TotalAmount = this.TotalAmount - this.voucherToApply.voucherCreditAmount; 
        if(this.TotalAmount <= 0){
            this.payButtonStatus = true;
            this.spinnerStatus = true;
            this.feedBack = 'Payment Succeeded!!'
        }
    }
    
    onCancel(p:Product){
        this.Products.splice(this.Products.indexOf(p),1);
        this.TotalAmount = this.getSum(this.Products);
    }

    //update session isPayable to true, if items are in cart.
    //update or create order details
    //update order.
    //table status to occupied.
    onLockSession(){
      this.tableSession.isPayable = this.CartItems.length >=1;
      this.order.tableSession = this.tableSession;
      this.order.totalAmount = this.TotalAmount*100;
      if(this.CartItems.length >=1){
        this.CartItems.forEach((x:CartItem )=> {
            let o:orderDetail = {productId:x.productId, quantity:x.count,unitPrice:x.unitPrice,applicationUserID:this.appId, orderId:this.order.orderID};
            this.oddSVr.addOrderDetail(o).subscribe();
    })};
    //console.log(this.order);
    this.orderSvr.updateOrder(this.order.orderID,this.order).subscribe((o:any)=>{
        this.cart.emit(o);
    });
        
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
    

    getSum(p: Product[]):number{
        let sum = 0;
        if(p.length >=1){
            p.forEach(pr=>{
                sum = sum+pr.price
            })
        }
        return sum;
    }

    createCartProducts(y:Product[]):Promise<CartOrder[]>{
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
        
    }



    
}
