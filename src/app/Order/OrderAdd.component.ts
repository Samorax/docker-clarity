import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, Sanitizer, SimpleChanges, ViewChild } from "@angular/core";
import { Order } from "../Models/Order.model";
import { Product } from "../Models/Product";
import { OrderService } from "../Services/Order/OrderService";
import { ProductService } from "../Services/Product/ProductService";
import { OrderCartComponent } from "./OrderCart.component";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { paymentService } from "../Services/PaymentService";
import { NgForm } from "@angular/forms";
import { TableSessionService } from "../Services/TableSessionsService";
import { TableSession } from "../Models/Session";
import { Waiter } from "../Models/Waiter";
import { Table } from "../Models/Table";
import { TableService } from "../Services/TableService";
import { WaiterService } from "../Services/WaiterService";
import { CartItem } from "../Models/CartItem";
import { CartOrder } from "../Models/CartOder";
import { stockService } from "../Services/Stock/StockService";
import { Stock } from "../Models/Stock";
import { forEach, initial } from "lodash";

@Component({
    selector:'add-order',
    templateUrl:'./OrderAdd.component.html',
    styleUrl:'./OrderAdd.component.css'
})

export class OrderAddComponent implements OnInit, AfterViewInit{
    @Output()orda:EventEmitter<Order> = new EventEmitter<Order>();
    userId = localStorage.getItem("user_id");
    waiter:Waiter = new Waiter();
    @Input()waiters!:Waiter[];

    lastorderId:BehaviorSubject<any> = new BehaviorSubject<number>(1)

    table: Table = new Table();
    @Input()tables!:Table[];

    sessionType: any = "Takeaway";
    tableSession:TableSession = new TableSession();

    stocks:BehaviorSubject<Stock[]> = new BehaviorSubject<Stock[]>([])
    stocks$ = this.stocks.asObservable();

    showDineInSessionForm:boolean = false;
    currencySymbol:any = this.paymentSvr.currencySymbol;
    constructor(private paymentSvr: paymentService, private tableSessionSvr: TableSessionService, private orderSvr:OrderService,private tableSvr:TableService, 
        private stktService: stockService, private sanitizer: DomSanitizer){}
    
      

    ngAfterViewInit(): void {
      this.OrderCartModal.cart.subscribe(o => {
            this.orda.emit(o);
        })

        

    }

    convertImgByte(x: Product):Observable<Product>{
        let objectURL = 'data:image/jpeg;base64,' + x.photosUrl;
        x.photosUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        return of(x);
    };

    

    ngOnInit(): void {
        
        this.stktService.getStocks().subscribe(s=>{
            let realStocks = s.filter(i=>i.isExpired !== true && !i.isDeleted)
            let excludeSameNameStocks = this.filterItems(realStocks);
            
            excludeSameNameStocks.forEach(stk=> {
                this.convertImgByte(<Product>stk.product).subscribe(p=>{
                    excludeSameNameStocks[excludeSameNameStocks.indexOf(stk)].product =p; 
                })
            });
            this.stocks.next(excludeSameNameStocks);
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
    cartitems: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>([]);
    
    selected:Product[] = [];
    totalAmount = new BehaviorSubject<number>(0);

    @Output() orderAddModal: EventEmitter<Order> = new EventEmitter<Order>();
    @ViewChild(OrderCartComponent)OrderCartModal!: OrderCartComponent;

    show:boolean = false;

    getSum(p: CartItem[]):number{
        let sum = 0;
        if(p.length >=1){
            p.forEach(pr=>{
                sum += pr.unitPrice*pr.count
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
        this.table = x!;
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

    
   


    onSelect(p:Stock){
        //if the cart is empty and the seleted stock is still available.
        //add product of stock to cart.
        this.configureCartItems(p);
    }

    onCloseCart(){
        let currentCartItems = this.cartitems.getValue();
        if(currentCartItems.length > 0)
        {
               let changeStk!:Stock
               let updatedStk!:Stock[];
               let stk = this.stocks.getValue();
               stk.forEach(s=>{
                for (let i = 0; i < currentCartItems.length; i++) {
                    const element = currentCartItems[i];
                    if(s.product?.name === element.name && !s.hasWaste && !s.isExpired){
                        changeStk = {...s, remainingUnits: s.remainingUnits+element.count}
                        stk[stk.indexOf(s)] = changeStk;
                    }   
                }
               })
               this.stocks.next(stk);
        };
        this.cartitems.next([]);
        this.show = false;
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

    open(){
        this.show = true;
    }
    close(){
        this.selected = [];
        this.show = false;
    }

    
}
