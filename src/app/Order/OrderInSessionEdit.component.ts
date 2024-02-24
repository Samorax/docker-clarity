import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
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

@Component({
    selector:'app-orderInSession',
    templateUrl:'./OrderInSessionEdit.component.html'

})

export class OrderInSessionEditComponent{
    order!:Order
    userId = localStorage.getItem("user_id");
    waiter:Waiter = new Waiter();
    @Input()waiters!:Waiter[];

    table: Table = new Table();
    @Input()tables!:Table[];

    sessionType: any;
    tableSession:TableSession = new TableSession();

    showDineInSessionForm:boolean = false;
    currencySymbol:any = this.paymentSvr.currencySymbol;
    constructor(private paymentSvr: paymentService, private tableSessionSvr: TableSessionService, 
        private productService: ProductService, private sanitizer: DomSanitizer){}

    ngAfterViewInit(): void {
        this.OrderCartModal.cart.subscribe(o=>{
            this.orderAddModal.emit(o);
            
        })

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

    @Output() orderAddModal: EventEmitter<Order> = new EventEmitter<Order>();
    @ViewChild(OrderCartComponent)OrderCartModal!: OrderCartComponent;

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

    saveSession(x:NgForm){
        this.tableSession.applicationUserID = this.userId;
        this.tableSession.createdAt = new Date();
         this.tableSessionSvr.addSession(this.tableSession).subscribe((r:TableSession)=>{
            let od = new Order(); od.orderStatus = 'In-Session'; od.applicationUserID = r.applicationUserID;od.orderDate = r.createdAt; 
            od.channel="On-Site";
            this.orderAddModal.emit(od);
        }); 
    }



    onSelect(p:Product){
        this.selected.push(p);
        this.totalAmount = this.getSum(this.selected);
    }
    
    open(x:Order){
        this.order = x;
        this.show = true;
    }
    close(){
        this.totalAmount = 0;
        this.selected = [];
        this.show = false;
    }

    
}