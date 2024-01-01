import { AfterViewInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { Product } from "../Models/Product";
import { Order } from "../Models/Order.model";
import { paymentService } from "../Services/PaymentService";
import { terminalIcon } from "@cds/core/icon";
import { terminalPaymentObject } from "../Models/TerminalPaymentObject";
import { CartOrder } from "../Models/CartOder";

@Component({
    selector:'order-cart',
    templateUrl:'./OrderCart.component.html'
})

export class OrderCartComponent {
    constructor(private PaymentSvr: paymentService){}
    appId = localStorage.getItem("user_id");
    @Output() cart: EventEmitter<Order> = new EventEmitter<Order>();
    newOder!:Order;
    @Input()Products!: Product[];
    @Input()TotalAmount: number = 0;

    
    
    onCancel(p:Product){
        this.Products.splice(this.Products.indexOf(p),1);
        this.TotalAmount = this.getSum(this.Products);
    }

    onCharge(){
        let ob: terminalPaymentObject = { amount: (this.TotalAmount*100).toString(), currency:'gbp' }
        this.PaymentSvr.connect2Reader(ob);
        this.createCartProducts(this.Products).then(p=>{
            this.newOder = {products : p,totalAmount:this.TotalAmount, orderStatus:"Approved", orderDate:Date.now(), orderID:0,customerID:0,payment:"succeeded", applicationUserID: this.appId }
            this.cart.emit(this.newOder);
        });
       
        
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