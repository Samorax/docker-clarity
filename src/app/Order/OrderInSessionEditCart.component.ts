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
import { OrderDetailService } from "../Services/Order/OrderDetailService";
import { OrderService } from "../Services/Order/OrderService";
import { TableService } from "../Services/TableService";
import { Table } from "../Models/Table";
import { Waiter } from "../Models/Waiter";
import { BehaviorSubject, Observable, first, map, of } from "rxjs";
import { OrderCartService } from "../Services/Order/OrderCartService";
import { CustomerService } from "../Services/Customer/CustomerService";
import { ClrLoadingState } from "@clr/angular";
import { Stock } from "../Models/Stock";
import { appUserService } from "../Services/AppUserService";
import { Customer } from "../Models/Customer";

@Component({
    selector:'order-EditCart',
    templateUrl:'./OrderInSessionEditCart.component.html',
    styleUrl:'./OrderCart.component.css'
})

export class OrderInSessionEditCartComponent implements OnInit, AfterViewInit {
customers: any;
selectedCustomer: any;
@Input()stocks!: BehaviorSubject<Stock[]>;
    sCharge!: number;
    vat!: number;
    lastorderId: any;
    rId: undefined;
    custId: any;

selectedOption: any;
applyVouchBtn: ClrLoadingState = ClrLoadingState.DEFAULT;


    constructor(
        private odSvr:OrderService, private  oddSVr: OrderDetailService, 
        private cartOrderSVR: OrderCartService,private customerSvr:CustomerService,
        private orderDetailSvr:OrderDetailService,
        private _voucherSvr:voucherService, private appUserSvr:appUserService, 
        private tableSvr:TableService,private tableSessionSvr:TableSessionService){}

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
            

            
    }

    ngOnInit(): void {
        this.getVouchers();
        this.getCustomers();
    }



    appId = localStorage.getItem("user_id");
    @Output()cart: EventEmitter<Order> = new EventEmitter<Order>();
    @Input()table!:Table;
    newOder!:Order;
    @Input()order!:Order;
    @Input()Products!: Product[];
    @Input()SubTotal!:BehaviorSubject<number>;
    @Input()CartItems!:BehaviorSubject<CartItem[]>;
    @Input()sessionType:any;
    feedBack!:string;
    spinnerStatus:boolean = false;
    vouchers:voucher[] = [];
    voucherToApply!: voucher;
    currencySymbol:any = localStorage.getItem('currency_iso_code');
    payButtonStatus:boolean = false;
    paymentMethod!:string;
    @Input()tableSession!:TableSession;
    VatCharge:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    ServiceCharge:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    TotalAmount:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    @Input()orders!:CartItem[];
    prevCartOrder:CartItem[] = [];

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

    getCustomers(){
        this.customerSvr.getCustomers().subscribe(c=>{
            this.customers = c;
        })
    }

    onSelected(x:any){
        this.voucherToApply = this.vouchers.filter(v=>v.voucherNumber === x)[0];
    }

    onApply(){
        let voucherCartItem:CartItem;
        this.applyVouchBtn = ClrLoadingState.LOADING;
        
    
        this.voucherToApply = <voucher>this.vouchers.find(v=>v.voucherNumber === this.selectedOption)

        if(this.voucherToApply !== undefined)
        {
            let voucherAmount = this.voucherToApply.valueType === 1?this.voucherToApply.voucherCreditAmount:(this.voucherToApply.voucherCreditAmount/100)*this.SubTotal.getValue()
            this.SubTotal.next(this.SubTotal.getValue() - voucherAmount);

            this.ServiceCharge.next((this.sCharge/100)*this.SubTotal.getValue());
            this.VatCharge.next((this.vat/100)*(this.SubTotal.getValue() + this.ServiceCharge.getValue()));
            
            this.TotalAmount.next(this.SubTotal.getValue()+this.VatCharge.getValue()+this.ServiceCharge.getValue());

            voucherCartItem = {name: this.voucherToApply.voucherNumber+'(Voucher)',unitPrice:-(voucherAmount),count:1 }
            this.CartItems.next([...this.CartItems.getValue(),voucherCartItem]);
        }
        
        this.applyVouchBtn = ClrLoadingState.DEFAULT;
    }
    
    onCancel(p:CartItem){
        let vat:any = localStorage.getItem('vatCharge');
        let sCharge:any = localStorage.getItem('serviceCharge');

        this.CartItems.pipe(first()).subscribe(c=>{
            let updatedCart = c.filter(ci=>ci.name !== p.name);
            this.CartItems.next(updatedCart);

            this.SubTotal.next(this.getSum(updatedCart));
            this.VatCharge.next((vat/100)*this.SubTotal.getValue());
            this.ServiceCharge.next((sCharge/100)*this.SubTotal.getValue());
            this.TotalAmount.next(this.SubTotal.getValue()+this.VatCharge.getValue()+this.ServiceCharge.getValue());
        });

        this.stocks.pipe(first()).subscribe(stks=>{
            let updatedStks = stks.map(s=>{
                if(s.product?.name === p.name){
                    return {...s, remainingUnits: s.remainingUnits+p.count}
                }else{
                    return s;
                }
            })
            this.stocks.next(updatedStks);
        })
        
  
  
       
    }

    //update session isPayable to true, if items are in cart.
    //update or create order details
    //update order.
    //table status to occupied.
    onLockSession(){
        this.applyVouchBtn = ClrLoadingState.LOADING
        if(this.sessionType === "Takeaway")
            {
                
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
                this.tableSession.isPayable = this.CartItems.getValue().length >=1;
                
                    //add session to database
                this.tableSessionSvr.updateSession(this.tableSession,this.tableSession.id).subscribe();
                   //create new order
                let od = this.order;
                od.orderDate = this.tableSession.createdAt;od.totalAmount = this.TotalAmount.getValue(); 
                od.vatCharge = this.VatCharge.getValue();
                od.serviceCharge = this.ServiceCharge.getValue();

                if(this.rId !== undefined && this.custId !== undefined)
                {
                    od.customerRecordId = this.rId, od.customerId = this.custId;
                }
                
                    //add order to database
                this.odSvr.updateOrder(od.orderID,od).subscribe();
                        //emit order to parent component
                  //if there are items in cart, create order details and add to database.
                if(this.CartItems.getValue().length >=1){
                    let ct = this.CartItems.getValue();
                    // items in cart remain the same but quantity may not
                    if(ct.length === od.orderDetails.length){
                        ct.forEach(c=>{
                            let prevPresent = od.orderDetails.find(os=>os.name === c.name && os.quantity !== c.count);
                            if(prevPresent !== undefined){
                                let ch = {...prevPresent, quantity: c.count}
                                let index = od.orderDetails.findIndex(o=>o.name === c.name);
                                od.orderDetails[index] = ch;
                                this.orderDetailSvr.updateOrderDetail(ch,ch.orderDetailId).subscribe();
                            }
                        })
                        
                    }
                    // items have been removed from cart. quantity may also have changed
                    if(ct.length < od.orderDetails.length){
                        let deleted = od.orderDetails.filter(e=> !ct.includes(e.name))
                        deleted.forEach(d=>{
                            let update = od.orderDetails.filter(o=>o.name !== d?.name)
                            let index = od.orderDetails.findIndex(os=>os.name === d?.name);
                            od.orderDetails = update;
                            this.orderDetailSvr.removeOrderDetail(d.orderDetailId).subscribe()
                        });
                        ct.forEach(c=>{
                            let prevPresent = od.orderDetails.find(os=>os.name === c.name && os.quantity !== c.count);
                            if(prevPresent !== undefined){
                                let ch = {...prevPresent, quantity: c.count}
                                let index = od.orderDetails.findIndex(o=>o.name === c.name);
                                od.orderDetails[index] = ch;
                                this.orderDetailSvr.updateOrderDetail(ch,ch.orderDetailId).subscribe();
                            }
                        })  
                    }
                    // new items have been added to cart. quantity of previous items may also have changed.
                    if(ct.length > od.orderDetails.length){
                        ct.forEach(c=>{
                            let present = od.orderDetails.find(os=>os.name === c.name && os.quantity === c.count);
                            if(present === undefined){
                                let odetail:orderDetail = {name:c.name, quantity:c.count,unitPrice:c.unitPrice,applicationUserID:this.appId, orderId:od.orderID};  
                                od.orderDetails.push(odetail);
                                this.orderDetailSvr.addOrderDetail(odetail).subscribe();
                            };
                            let prevPresent = od.orderDetails.find(os=>os.name === c.name && os.quantity !== c.count);
                            if(prevPresent !== undefined){
                                let ch = {...prevPresent, quantity: c.count}
                                let index = od.orderDetails.findIndex(o=>o.name === c.name);
                                od.orderDetails[index] = ch;
                                this.orderDetailSvr.updateOrderDetail(ch,ch.orderDetailId).subscribe();
                            }
                        });
                    }


                  /*   if(newlyAddedCartItems.length > 0)
                    {
                            newlyAddedCartItems.forEach(xi=>
                                {
                                    let cd:CartOrder = {name:xi.name,count:xi.count,price:xi.unitPrice,applicationUserID:this.appId,orderId:od.orderID,cartOrderId:this.appId,dateCreated:new Date()};
                                    this.cartOrderSVR.addCartOrder(cd).subscribe();
            
                                    
                                    od.orderDetails.push(odetail);
                                });
                                
                    }
                        
                    if(updatedCartItems.length > 0)
                    {
                        updatedCartItems.forEach((xi:CartItem) => {
                            let cd:CartOrder = {name:xi.name,count:xi.count,price:xi.unitPrice,applicationUserID:this.appId,orderId:od.orderID,cartOrderId:this.appId,dateCreated:new Date(),recordId:xi.recordId};
                            this.cartOrderSVR.updateCartOrder(cd).subscribe();

                            

                        });
                    } */

                    this.CartItems.next([]);
                   
                   
                }

                
            
                this.cart.emit(od);
        
    }

    getCustomerId(x:Event){
        let customerId = <string>this.customers.find((c:Customer)=>c.recordId == this.selectedCustomer)?.id
        this.rId = this.selectedCustomer; this.custId = customerId;
    }

    createNewOrder(x:Order,y:CartItem[])
      {
        return new Observable<Order>((observer)=>{
            let details: orderDetail[] = [];
            
            y.forEach(o=>{
              let detail:orderDetail = {orderId:this.order.orderID,name:o.name,unitPrice:o.unitPrice,quantity:o.count,applicationUserID:this.appId};
              details.push(detail);
            });

            x.orderDetails = details;
            details.forEach(o=>this.oddSVr.addOrderDetail(o).subscribe(o=>{
                x.orderDetails.push(o);
              }));

            observer.next(x);
            
        });
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




    
}
