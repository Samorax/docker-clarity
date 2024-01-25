import { Component, OnInit } from "@angular/core";
import { ProductService } from "../Services/ProductService";
import { Product } from "../Models/Product";
import { Order } from "../Models/Order.model";
import { CartOrder } from "../Models/CartOder";
import { EChartsOption } from "echarts";
import { Observable } from "rxjs";
import { promises } from "dns";
import { OrderService } from "../Services/OrderService";

@Component({
    selector:'app-productoverview',
    templateUrl:'./ProductOverview.component.html'
})

export class ProductOverviewComponent implements OnInit{
    constructor(private productSvr:ProductService, private orderSvr: OrderService){}
    products: Product[] = [];
    productCount: number = 0;
    categoriesCount: number = 0;
    orders!: Order[];
    productDemandChart!: EChartsOption

    ngOnInit(): void {
        this.initialize().then(p=>{
            this.products = p;
            this.productCount = p.length;

            this.getOrders().then(o=>{
                this.orders = o;
                this.productDemandChart = this.getProductDemandChart();
            })
            
            this.getProductCategories(this.products).then(x=>{
                this.categoriesCount = x.length;
            });
        })
       
    };

    initialize():Promise<Product[]>{
        return new Promise((resolve)=>{
            if(this.productSvr.productssCache.length != 0){
                resolve(this.productSvr.productssCache)
            }else{
                this.productSvr.getProducts().subscribe(p=>{
                 resolve(p);   
                })
            };
        }); 
    };

    getOrders():Promise<Order[]>{
        return new Promise((resolve)=>{
            if(this.orderSvr.ordersCache.length != 0){
                resolve(this.orderSvr.ordersCache);
            }else{
                this.orderSvr.getOrders().subscribe(or=> resolve(or));
            };
        })
        
    }

    getProductCategories(p: Array<Product>):Promise<string[]>{
    return new Promise((resolve)=>{
    let cats: string[] = [];
        let distinctCAtegories: string[] = [];
        p.forEach(p=> cats.push(p.category));
        if(cats.length != 0){
          distinctCAtegories = cats.filter(this.onlyUnique)
        resolve(distinctCAtegories);
      }})
    }

    onlyUnique(value:any, index:any, array:any) {
        return array.indexOf(value) === index;
      }

    getProductDemandChart(){
        let wc: EChartsOption = {
            xAxis:{
                type:"category",
                axisTick:{ alignWithLabel:true},
                axisLabel:{rotate:30},
                data:this.getTheNamesOfProducts(this.products)
    
            },
            yAxis:{
                axisLabel:{ formatter: '{value}%', align:'center'},
                type:"value",
            },
            series: [
                {
                  data: this.calculateThePercentageDemandOfAllProducts(this.products),
                  type: 'bar',
                },
              ],
            };

            return wc;
    }

    calculatePercentageDemand(x:number,y: number): number{
        let totalNumberOfOrders: number =x;
        let totalNumberOfUniqueProduct: number = y;

        return (totalNumberOfUniqueProduct/totalNumberOfOrders)*100;
    }

    getTotalNumberOfUniqueProducts(p:Product, o:Order[]){
        let uniqueProductArray:CartOrder[] = [];
        o.forEach(or=>{
            let x = or.products.filter(pr=> p.name == pr.name);
            x.forEach(a=> uniqueProductArray.push(a));
            x = [];
        });
        return uniqueProductArray.length;
    }

    getTheNamesOfProducts(p:Product[]):string[]{
        let names:string[]  = [];
        p.forEach(pr=> 
            {
                names.push(pr.name);
                console.log(pr.name);
            });
        return names;
    }

    calculateThePercentageDemandOfAllProducts(p:Product[]):number[]{
        let ns:number[] = [];
        p.forEach(pr => {
            let x = this.getTotalNumberOfUniqueProducts(pr,this.orders);
            let n = this.calculatePercentageDemand(this.orders.length, x);
            ns.push(n);
        });
        return ns;
    }

    
}