import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { BehaviorSubject, Observable, Subject, of } from "rxjs";
import { Order } from "../Models/Order.model";
import { Product } from "../Models/Product";
import { TableSession } from "../Models/Session";
import { Table } from "../Models/Table";
import { Waiter } from "../Models/Waiter";
import { paymentService } from "../Services/PaymentService";
import { ProductService } from "../Services/ProductService";
import { TableSessionService } from "../Services/TableSessionsService";
import { OrderCartComponent } from "./OrderCart.component";
import { OrderService } from "../Services/OrderService";
import { CartItem } from "../Models/CartItem";
import { OrderInSessionEditCartComponent } from "./OrderInSessionEditCart.component";
import { OrderCartService } from "../Services/OrderCartService";
import { CartOrder } from "../Models/CartOder";

@Component({
    selector:'app-orderInSession',
    templateUrl:'./OrderInSessionEdit.component.html'

})

export class OrderInSessionEditComponent implements OnInit, AfterViewInit{
    order!:Order
    userId = localStorage.getItem("user_id");
    waiter:any;
    @Input()waiters!: Waiter[];

    table: any;
    @Input()tables!: Table[];
    appId = localStorage.getItem("user_id");

    sessionType: any;
    tableSession!:TableSession;

    showDineInSessionForm:boolean = false;
    currencySymbol:any = this.paymentSvr.currencySymbol;
    cart:CartItem[] = [];
    cartitems = new Subject<CartItem>();
    cartOrders!: Observable<CartOrder[]>;
    selectedDetails = [];
    cartOrderToUpdate: CartOrder[] = [];
    constructor(private paymentSvr: paymentService, private orderSvr: OrderService, private cartOrderSVR: OrderCartService,
        private productService: ProductService, private sanitizer: DomSanitizer){
            this.cartOrders = this.cartOrderSVR.getCartOrders();
        }

    ngAfterViewInit(): void {
        this.OrderSessionCartModal.cart.subscribe(o=>{
            this.orderSessionUpdateModal.emit(o);
 
        })
    }

    convertImgByte(x: Product):Observable<Product>{
        let objectURL = 'data:image/jpeg;base64,' + x.photosUrl;
        x.photosUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        return of(x);
    };

    

    ngOnInit(): void {
        this.productService.getProducts().subscribe(p=>{
            p.forEach(product=> {
                this.convertImgByte(product).subscribe(p=>{
                    this.products.push(p)
                    this.productService.productssCache.push(p)
                })
            });
        });
    }

    products:Product[] = [];
    selected:Product[] = [];
    totalAmount = new BehaviorSubject<number>(0);

    @Output() orderSessionUpdateModal: EventEmitter<Order> = new EventEmitter<Order>();
    @ViewChild(OrderInSessionEditCartComponent)OrderSessionCartModal!: OrderInSessionEditCartComponent;

    show:boolean = false;

    getSum(p: CartItem[]):number{
        let sum = 0;
        if(p.length >=1){
            p.forEach(pr=>{
                sum += pr.unitPrice*pr.count;
            })
        }
        return sum;
    }

    

   onChangeSessionType(x:string){
    this.sessionType = x;
    if(this.sessionType == 'Dine-In'){
        this.showDineInSessionForm = true;
    }else{
        this.showDineInSessionForm = false;
    }
   }

    //select session table. 
    //session name should be the same as table name by convention - Dojo documentation.
    onChangeSessionTable(y:any){
        var x = this.tables.find(t=> t.name == y);
        this.tableSession.name = x!.name;
        this.tableSession.tableId = x!.id;
    }

    onChangeSessionWaiter(y:any){
        var x = this.waiters.find(w=>w.name == y);
        this.tableSession.waiterId = x!.id;
    }

    /* saveSession(x:NgForm){
        this.tableSession.applicationUserID = this.userId;
        this.tableSession.createdAt = new Date();
         this.tableSessionSvr.addSession(this.tableSession).subscribe((r:TableSession)=>{
            let od = new Order(); od.orderStatus = 'In-Session'; od.applicationUserID = r.applicationUserID;od.orderDate = r.createdAt; 
            od.channel="On-Site";
            this.orderAddModal.emit(od);
        }); 
    }
 */


    onSelect(p:Product){
        //this.selected.push(p);
        
        if(this.cart.length === 0){
            let cy:CartItem= {name: p.name, count : 1, unitPrice:p.price};
            let nCartOrder: CartOrder = {name:cy.name,count:cy.count,price:cy.unitPrice,applicationUserID:this.appId,orderId:this.order.orderID,cartOrderId:this.appId,dateCreated:new Date()}
            this.cartOrderSVR.addCartOrder(nCartOrder).subscribe(c=> {this.cartOrderToUpdate.push(c); cy.recordId= c.recordId;this.cart.push(cy);});
        }else{
            let dup = this.cart.filter(i=>i.name === p.name);
            if(dup.length === 0){
                let cy:CartItem= {name: p.name, count : 1, unitPrice:p.price};
                let nCartOrder: CartOrder = {name:cy.name,count:cy.count,price:cy.unitPrice,applicationUserID:this.appId,orderId:this.order.orderID,cartOrderId:this.appId,dateCreated:new Date()}
                this.cartOrderSVR.addCartOrder(nCartOrder).subscribe(c=> {this.cartOrderToUpdate.push(c); cy.recordId= c.recordId;this.cart.push(cy);});
            }else{
                let index = this.cart.indexOf(dup[0]);
                this.cart[index].count++;
                this.cartOrders.subscribe(c=> {
                    let nCartOrder:any = c.find(c=> c.name === this.cart[index].name);
                    nCartOrder.count++;
                   this.cartOrderSVR.updateCartOrder(nCartOrder).subscribe();
                });
            }
    }
            this.totalAmount.next(this.getSum(this.cart));
        }
    
    open(x:Order){
        console.log(x);
        this.order = x;
        this.showDineInSessionForm = x.tableSession.name.includes('Takeaway')?false:true;
        this.cartOrders.subscribe(c=>{c.forEach(y=>{this.cart.push({name: y.name, count :y.count, unitPrice:y.price,recordId:y.recordId})});  
        this.totalAmount.next(this.getSum(this.cart));      
        });
        
        this.tableSession = this.order.tableSession;

        this.waiter = this.tableSession.waiter;
        this.table = this.tableSession.table;
        this.show = true;

    }
    close(){
        this.cart = [];
        this.selected = [];
        this.show = false;
    }

    
}
