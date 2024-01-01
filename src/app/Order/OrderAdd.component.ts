import { AfterViewInit, Component, EventEmitter, OnInit, Output, Sanitizer, ViewChild } from "@angular/core";
import { Order } from "../Models/Order.model";
import { Product } from "../Models/Product";
import { OrderService } from "../Services/OrderService";
import { ProductService } from "../Services/ProductService";
import { OrderCartComponent } from "./OrderCart.component";
import { Observable, of } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector:'add-order',
    templateUrl:'./OrderAdd.component.html'
})

export class OrderAddComponent implements OnInit, AfterViewInit{
    constructor(private productService: ProductService, private sanitizer: DomSanitizer){}

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
        this.productService.getProducts().subscribe(p=>{
            p.forEach(product=> {
                this.convertImgByte(product).subscribe(p=>{
                    this.products.push(p)
                    this.productService.productssCache.push(p)
                })
                ;
            });
        })
        this.products = this.productService.productssCache;
        
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

    onSelect(p:Product){
        this.selected.push(p);
        this.totalAmount = this.getSum(this.selected);
    }
    
    open(){
        this.show = true;
    }
    close(){
        this.show = false;
    }

    
}