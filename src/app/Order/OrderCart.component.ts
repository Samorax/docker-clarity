import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Product } from "../Models/Product";
import { Order } from "../Models/Order.model";
import { CartOrder } from "../Models/CartOder";
import { voucherService } from "../Services/VoucherService";
import { voucher } from "../Models/Voucher";
import { CartItem } from "../Models/CartItem";
import { TableSession } from "../Models/Session";
import { TableSessionService } from "../Services/TableSessionsService";
import { OrderDetailService } from "../Services/Order/OrderDetailService";
import { OrderService } from "../Services/Order/OrderService";
import { TableService } from "../Services/TableService";
import { Table } from "../Models/Table";
import { Waiter } from "../Models/Waiter";
import { BehaviorSubject, first, Observable, of } from "rxjs";
import { OrderCartService } from "../Services/Order/OrderCartService";
import { ClarityIcons, timesIcon } from "@cds/core/icon";
import { CustomerService } from "../Services/Customer/CustomerService";
import { Customer } from "../Models/Customer";
import { ClrLoading, ClrLoadingState } from "@clr/angular";
import { Stock } from "../Models/Stock";
import { stockService } from "../Services/Stock/StockService";
import { appUserService } from "../Services/AppUserService";
ClarityIcons.addIcons(timesIcon)

@Component({
    selector:'order-cart',
    templateUrl:'./OrderCart.component.html',
    styleUrl:'./OrderCart.component.css'
    
})

export class OrderCartComponent implements OnInit, AfterViewInit {
getVoucherAmouunt($event: Event) {
}
selectedOption: any;
selectedCustomer:any
    custId!: string;
    rId: any;
    vat:any;
    sCharge:any



    constructor(private tableSessionSvr: TableSessionService,private stkSvr:stockService, private appUserSvr:appUserService,
        private orderDetailSvr:OrderDetailService,
         private _voucherSvr:voucherService, private odSvr:OrderService, private tableSvr: TableService,private customerSvr:CustomerService,
        private cartOrderSVR: OrderCartService){
            
         }
    ngAfterViewInit(): void {
        this.appUserSvr.getAppUserInfo().subscribe(r=>
            {
                this.vat = r.vatCharge;
                this.sCharge = r.serviceCharge;
                this.SubTotal.subscribe(s=>{
                    this.VatCharge.next((this.vat/100)*s);
                    this.ServiceCharge.next((this.sCharge/100)*s);
                    this.TotalAmount.next(s+this.VatCharge.getValue()+this.ServiceCharge.getValue());
                });
            })
            

            
            
       ;
    }

    ngOnInit(): void {
        this.getVouchers();
        this.getCustomers();
        
        
    }

    appId = localStorage.getItem("user_id");
    @Output()cart: EventEmitter<Order> = new EventEmitter<Order>();
    lastorderId:BehaviorSubject<number> = new BehaviorSubject<number>(0)
    @Input()table!:Table;
    newOder!:Order;
    @Input()Products!: Product[];
    @Input()SubTotal!: BehaviorSubject<number>;
    @Input()CartItems!:BehaviorSubject<CartItem[]> ;
    @Input()sessionType:any;
    @Input()stocks!:BehaviorSubject<Stock[]>;
    feedBack!:string;
    spinnerStatus:boolean = false;

    vouchers:voucher[] = [];
    customers:Customer[] = []
    voucherToApply!: voucher;
    currencySymbol:any = localStorage.getItem('currency_iso_code');
    payButtonStatus:boolean = false;
    paymentMethod!:string;
    @Input()tableSession!:TableSession;

    VatCharge:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    ServiceCharge:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    TotalAmount:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    applyVouchBtn:ClrLoadingState = ClrLoadingState.DEFAULT

    @ViewChild('myInput') myInputRef!: ElementRef;
    getVouchers(){
            this._voucherSvr.getVouchers().subscribe((v:any) => 
            {
                this.vouchers = v;
            });
    }

    getCustomers(){
        this.customerSvr.getCustomers().subscribe(c=>{
            this.customers = c;
        })
    }

 

    //on applying a voucher, the applied vocher should be validated
    //if validation is successful, charges should be affected and changed
    //otherwise, vice-versa.
     onApply(){
        let voucherCartItem:CartItem;
        this.applyVouchBtn = ClrLoadingState.LOADING;
        
    
        this.voucherToApply = <voucher>this.vouchers.find(v=>v.voucherNumber === this.selectedOption)

        if(this.voucherToApply !== undefined)
        {
            let voucherAmount = this.voucherToApply.valueType === 1?this.voucherToApply.voucherCreditAmount:(this.voucherToApply.voucherCreditAmount/100)*this.SubTotal.getValue()
            this.SubTotal.next(this.SubTotal.getValue() - voucherAmount);
            this.VatCharge.next((this.vat/100)*this.SubTotal.getValue());
            this.ServiceCharge.next((this.sCharge/100)*this.SubTotal.getValue());
            this.TotalAmount.next(this.SubTotal.getValue()+this.VatCharge.getValue()+this.ServiceCharge.getValue());

            voucherCartItem = {name: this.voucherToApply.voucherNumber+'(Voucher)',unitPrice:-(voucherAmount),count:1 }
            this.CartItems.next([...this.CartItems.getValue(),voucherCartItem]);
        }
        
        this.applyVouchBtn = ClrLoadingState.DEFAULT;
        
    } 
    
    //remove the cancelled item from the cart.
    //as the item is removed, stock quantity has to be increased
    //as the item is removed, charges has to be changed
    onCancel(p:CartItem){
        let vat:any = localStorage.getItem('vatCharge');
        let sCharge:any = localStorage.getItem('serviceCharge');

        this.CartItems.pipe(first()).subscribe(c=>{
            let updatedCart = c.filter(ci=>ci.name !== p.name);
            this.CartItems.next(updatedCart);
        });

        this.stocks.pipe(first()).subscribe(stks=>{
            let updatedStks = stks.map(s=>{
                if(s.product?.name === p.name){
                    return {...s, remainingUnits:s.remainingUnits+p.count}
                }else{
                    return s;
                }
            })
            this.stocks.next(updatedStks);
        })
        
  
        let c = this.CartItems.getValue();
        this.SubTotal.next(this.getSum(c));

        this.VatCharge.next((vat/100)*this.SubTotal.getValue());
        this.ServiceCharge.next((sCharge/100)*this.SubTotal.getValue());
        this.TotalAmount.next(this.SubTotal.getValue()+this.VatCharge.getValue()+this.ServiceCharge.getValue());

    }

    //update session isPayable to true, if items are in cart.
    //update or create order details
    //update order.
    //table status to occupied.
    onLockSession(){
        
    if(this.sessionType === "Takeaway")
    {
        this.odSvr.getOrders().subscribe(or=>{
            let ids = or.map(n=> n.orderID);
            let biggerId = Math.max(...ids);
            this.tableSession.name =  this.sessionType+" "+(biggerId + Number(1));
            let virtualTable :Table = {name: this.tableSession.name, maxCovers: 1, status:"Occupied", applicationUserID:this.appId, type:'virtual'};
        let virtualWaiter:Waiter = {name: this.tableSession.name, applicationUserID:this.appId};
        this.tableSession.waiter = virtualWaiter;
        this.tableSession.table = virtualTable;
        })   
        //let cache = this.orderSvr.ordersCache; 
        //let lastorderid = cache.length >= 1 ? cache[cache.length - 1].orderID: 1;
        
       
        
        
    }else{
        this.table.status = 'Occupied';
        this.tableSvr.updateTable(this.table,this.table.id).subscribe();
    }
        this.tableSession.applicationUserID = this.appId;
        this.tableSession.createdAt = new Date();
        this.tableSession.isPayable = this.CartItems.getValue().length >=1;
        
            //add session to database
        this.tableSessionSvr.addSession(this.tableSession).subscribe((r: TableSession) => {
           //create new order
    
           let od = new Order(); od.orderStatus = 'In-Session'; od.applicationUserID = r.applicationUserID;od.orderDate = r.createdAt;
        od.channel = "In-Person";od.totalAmount = this.TotalAmount.getValue();od.tableSessionId = r.id; od.vatCharge = this.VatCharge.getValue();od.serviceCharge = this.ServiceCharge.getValue();
        if(this.rId !== undefined && this.custId !== undefined)
        {
            od.customerRecordId = this.rId, od.customerId = this.custId;
        }
        
        
            //add order to database
        this.odSvr.addOrder(od).subscribe((or:Order) => {
                //emit order to parent component
        or.tableSession = r;
          //if there are items in cart, create order details and add to database.
                if(this.CartItems.getValue().length >=1){
                    
                    or.orderDetails = [];
                    
                    this.CartItems.forEach(x => { x.forEach(x=>{
                        let cd:CartOrder = {name:x.name,count:x.count,price:x.unitPrice,applicationUserID:this.appId,orderId:or.orderID,cartOrderId:this.appId,dateCreated:new Date()};
                        this.cartOrderSVR.addCartOrder(cd).subscribe();
                        or.orderDetails.push({name:x.name, quantity:x.count,unitPrice:x.unitPrice,applicationUserID:this.appId, orderId:or.orderID});
                    })});
                    or.orderDetails.forEach(d => {
                        this.orderDetailSvr.addOrderDetail(d).subscribe();
              });
             
              this.CartItems.next([]);
              this.cart.emit(or);
              
            //if Dine-In, then update a stored table
        };
        }); 

        //update stocks
        /* this.stocks.subscribe(s=>{
            
            s.forEach(stk=>{
                console.log(stk);
                let stkTopudate:Stock = {
                    prepDate:stk.prepDate,
                    stockedDate:stk.stockedDate,
                    remainingUnits:stk.remainingUnits,
                    applicationUserID:stk.applicationUserID,
                    productID:stk.productID,
                    hasWaste:stk.hasWaste,initialUnits:stk.initialUnits,id:stk.id,isDeleted:stk.isDeleted,isExpired:stk.isExpired
                } 
                this.stkSvr.updateStock(<number>stkTopudate.id,stkTopudate).subscribe();
            });
        }) */
        
        
    })
    }

    getCustomerId(x:Event){
        let customerId = <string>this.customers.find(c=>c.recordId == this.selectedCustomer)?.id
        this.rId = this.selectedCustomer; this.custId = customerId;
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
