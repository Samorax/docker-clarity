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
import { ProductService } from "../Services/Product/ProductService";
import { TableSessionService } from "../Services/TableSessionsService";
import { OrderCartComponent } from "./OrderCart.component";
import { OrderService } from "../Services/Order/OrderService";
import { CartItem } from "../Models/CartItem";
import { OrderInSessionEditCartComponent } from "./OrderInSessionEditCart.component";
import { OrderCartService } from "../Services/Order/OrderCartService";
import { CartOrder } from "../Models/CartOder";
import { Stock } from "../Models/Stock";
import { stockService } from "../Services/Stock/StockService";

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

    stocks = new BehaviorSubject<Stock[]>([])

    showDineInSessionForm:boolean = false;
    currencySymbol:any = this.paymentSvr.currencySymbol;
    cart:CartItem[] = [];
    cartitems = new BehaviorSubject<CartItem[]>([]);
    cartOrders!: Observable<CartOrder[]>;
    selectedDetails = [];
    cartOrderToUpdate: CartOrder[] = [];
    constructor(private paymentSvr: paymentService, private orderSvr: OrderService, private cartOrderSVR: OrderCartService,
        private productService: ProductService,private stktService:stockService, private sanitizer: DomSanitizer){
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
        this.stktService.getStocks().subscribe(s=>{
            let realStocks = s.filter(i=>i.isExpired !== true)
            let excludeSameNameStocks = this.filterItems(realStocks);
            
            excludeSameNameStocks.forEach(stk=> {
                this.convertImgByte(<Product>stk.product).subscribe(p=>{
                    excludeSameNameStocks[excludeSameNameStocks.indexOf(stk)].product =p;
                    let latestArray = [...excludeSameNameStocks];
                    this.stocks.next(latestArray);
                })
            });
        });
    }

    filterItems(items: Stock[]): Stock[] {
        let filteredItems: Stock[] = [];
        items.forEach(item=>{
            for (let index = 0; index < items.length; index++) {
                const element = items[index];
                if(item.product?.name === element.product?.name){
                    if(item.remainingUnits > element.remainingUnits){
                        filteredItems.push(item);
                    }
                }
            }
            
                
        })
        return filteredItems = filteredItems.length === 0? items: filteredItems;
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


    onSelect(p:Stock)
    {
        //this.selected.push(p);
        this.configureCartItems(p);
    }

        private configureCartItems(p: Stock) {
            if (this.cartitems.getValue().length === 0 && p.remainingUnits > 0) {
    
                let cy: CartItem = { name: p.product?.name, count: 1, unitPrice: p.product?.price };
                let latestArray = [...this.cartitems.getValue(), cy];
                this.cartitems.next(latestArray);
                p.remainingUnits--;
    
    
                //if the cart is not empty and the selected stock is still available.
                //check if the stock product is in the cart. if yes - increase quantity, otherwise, add it as new.
            } else if (this.cartitems.getValue().length !== 0 && p.remainingUnits > 0) {
                let x = this.cartitems.getValue();
                let dup = x.find(i => i.name === p.product?.name);
                if (dup === undefined) {
                    let cy: CartItem = { name: p.product?.name, count: 1, unitPrice: p.product?.price };
                    let latestArray = [...x, cy];
                    this.cartitems.next(latestArray);
                    p.remainingUnits--;
    
                } else {
                    let index = x.indexOf(dup);
                    x[index].count++;
                    p.remainingUnits--;
    
                }
    
    
    
            }
            this.totalAmount.next(this.getSum(this.cartitems.getValue()));
        }
    
    open(xi:Order){
    
        this.order = xi;
        
        this.showDineInSessionForm = xi.tableSession.name.includes('Takeaway')?false:true;
        
        
                let x:CartItem[] = [];
                xi.orderDetails.forEach(y=>
            {
                let cu:CartItem = {name: y.name, count :y.quantity, unitPrice:y.unitPrice,recordId:y.orderDetailId}
                x.push(cu);
            });
            this.cartitems.next(x);  
        this.totalAmount.next(this.getSum(this.cartitems.getValue()));      
        
        
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
