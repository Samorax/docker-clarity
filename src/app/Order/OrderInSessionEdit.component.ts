import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable, of } from "rxjs";
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

    sessionType: any;
    tableSession!:TableSession;

    showDineInSessionForm:boolean = false;
    currencySymbol:any = this.paymentSvr.currencySymbol;
    cartitems: CartItem[] = [];
    constructor(private paymentSvr: paymentService, private orderSvr: OrderService,
        private productService: ProductService, private sanitizer: DomSanitizer){}

    ngAfterViewInit(): void {
        this.OrderSessionCartModal.cart.subscribe(o=>{
            this.orderSessionUpdateModal.emit(o);
 
        })

        console.log(this.order);

    }

    convertImgByte(x: Product):Observable<Product>{
        let objectURL = 'data:image/jpeg;base64,' + x.photosUrl;
        x.photosUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        return of(x);
    };

    

    ngOnInit(): void {
        

        this.productService.productssCache = [];
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
    totalAmount:number =0;

    @Output() orderSessionUpdateModal: EventEmitter<Order> = new EventEmitter<Order>();
    @ViewChild(OrderInSessionEditCartComponent)OrderSessionCartModal!: OrderInSessionEditCartComponent;

    show:boolean = false;

    getSum(p: Product[]):number{
        let sum = 0;
        if(p.length >=1){
            p.forEach(pr=>{
                sum = sum+pr.price
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
        this.selected.push(p);
        this.totalAmount = this.getSum(this.selected);
        if(this.cartitems.length == 0){
            let c:CartItem= {productId: p.productID, count : 1, unitPrice:p.price};
            this.cartitems.push(c);
        }else{
            this.cartitems.forEach((x:any) => {
                if(x.productId === p.productID){
                    x.count++;
                }else{
                    let c:CartItem= {productId: p.productID, count : 1, unitPrice:p.price};
                    this.cartitems.push(c);
                }
            });
        }
    }
    
    open(x:Order){
        this.order = x;
        
        this.order.orderDetails.forEach(item=> this.selected.push(item.product));
        this.totalAmount = this.getSum(this.selected);
        this.tableSession = this.order.tableSession;
        
        this.waiter = this.tableSession.waiter;
        this.table = this.tableSession.table;
        this.show = true;

    }
    close(){
        this.totalAmount = 0;
        this.selected = [];
        this.show = false;
    }

    
}
