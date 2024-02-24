import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Product } from "../Models/Product";
import { Order } from "../Models/Order.model";
import { paymentService } from "../Services/PaymentService";
import { terminalIcon } from "@cds/core/icon";
import { terminalPaymentObject } from "../Models/TerminalPaymentObject";
import { CartOrder } from "../Models/CartOder";
import { PaymentIntentRequest } from "../Models/PaymentIntentRequest";
import { Reader } from "@stripe/terminal-js";
import { voucherService } from "../Services/VoucherService";
import { voucher } from "../Models/Voucher";

@Component({
    selector:'order-cart',
    templateUrl:'./OrderCart.component.html'
})

export class OrderCartComponent implements OnInit {
    constructor(private PaymentSvr: paymentService, private _voucherSvr:voucherService){}

    ngOnInit(): void {
        this.getVouchers();
        
        
    }

    appId = localStorage.getItem("user_id");
    @Output() cart: EventEmitter<Order> = new EventEmitter<Order>();
    newOder!:Order;
    @Input()Products!: Product[];
    @Input()TotalAmount: number = 0;
    feedBack!:string;
    spinnerStatus:boolean = false;
    vouchers:voucher[] = [];
    voucherToApply!: voucher;
    currencySymbol:any;
    payButtonStatus:boolean = false;
    paymentMethod!:string;

    getVouchers(){
        let cache = this._voucherSvr.getVoucherCache;
        if(cache.length != 0){
            this.vouchers = cache;
            this.currencySymbol = localStorage.getItem('currency_iso_code');
        }else{
            this._voucherSvr.getVouchers().subscribe((v:any) => 
            {
                this.vouchers = v;
                this._voucherSvr.getVoucherCache = v;
                this.currencySymbol = localStorage.getItem('currency_iso_code');
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

    onLockSession(){
        
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
