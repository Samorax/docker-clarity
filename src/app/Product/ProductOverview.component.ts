import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ProductService } from "../Services/ProductService";
import { Product } from "../Models/Product";
import { Order } from "../Models/Order.model";
import { CartOrder } from "../Models/CartOder";
import { ECharts, EChartsOption } from "echarts";
import { Observable } from "rxjs";
import { promises } from "dns";
import { OrderService } from "../Services/OrderService";
import { orderDetail } from "../Models/OrderDetails";
import moment from "moment";

@Component({
    selector:'app-productoverview',
    templateUrl:'./ProductOverview.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class ProductOverviewComponent implements OnInit{


    constructor(private productSvr:ProductService, private orderSvr: OrderService,private cd: ChangeDetectorRef){}
    products: Product[] = [];
    productCount: number = 0;
    categoriesCount: number = 0;
    orders!: Order[];
    date!:Date
    today = new Date().toString()
    productDemandChart!: EChartsOption
    productDemandChartInstance!: ECharts;

    ngOnInit(): void {
        this.initialize();
        
    };

    initialize(){
        
                this.productSvr.getProducts().subscribe(p=>{
                    this.products = p;
                    this.productCount = p.length;
                    this.getProductCategories(p).then(x=>{
                        this.categoriesCount = x.length;
                    });
                    this.getOrders();
                });
            
    }

    onProductDemandChart(x:any) {
        this.productDemandChartInstance = x;
        }

    getOrders(){
                this.orderSvr.getOrders().subscribe(or=> 
                    {
                        this.orderSvr.ordersCache = or;
                        this.orders = or;
                        this.productDemandChart = this.getProductDemandChart();
                        this.cd.detectChanges()
                    });
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
            title:{
                text:'Product Demand (%)',
                right:'middle',
                textStyle:{ fontSize:'18px'}
            },
            tooltip:{
                trigger:'axis'
            },
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
                  showBackground: true
                },
              ],
            };
            
            return wc;
    }

    onSelectedDate(){
        let ns:number[] = [];
        this.products.forEach(pr => {
            let x = this.getProductDemandByDate(pr,this.orders);
            let n = this.calculatePercentageDemand(this.orders.length, x);
            ns.push(n);
        });
        this.productDemandChartInstance.setOption({
            xAxis:{
                data:this.getTheNamesOfProducts(this.products) 
              },
              series:{
                  data:ns,
                  universalTransition:{
                      enabled:true,
                      divideShape:'clone'
                    }
              },
              graphic: [
                  {
                    type: 'text',
                    left: 50,
                    top: 20,
                    style: {
                      text: 'Back',
                      fontSize: 18
                    },
                    onclick: ()=>{
                      if(this.productDemandChartInstance){
                          this.productDemandChartInstance.setOption(
                            {
                            title:{
                                text:'Product Demand (%)',
                                right:'middle',
                                textStyle:{ fontSize:'18px'}
                            },
                            tooltip:{
                                trigger:'axis'
                            },
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
                                  showBackground: true
                                },
                              ],
                          }

                          );
                      }
                    }
                  }
                ]
        })
        return ns;
    }

    getProductDemandByDate(p:Product, o:Order[]){
        let uniqueProductArray: orderDetail[] = [];
        o.filter(o=>o.orderStatus === "Completed" && moment(o.orderDate).toDate().toDateString() === this.date.toDateString()).forEach(or=>{
            console.log(or)
            let x = or.orderDetails.filter(pr=> p.name === pr.name);
            x.forEach(a=> uniqueProductArray.push(a));
            x = [];
        });
        return uniqueProductArray.length;
    }

    calculatePercentageDemand(x:number,y: number): number{
        let totalNumberOfOrders: number =x;
        let totalNumberOfUniqueProduct: number = y;
      
        return (totalNumberOfUniqueProduct/totalNumberOfOrders)*100;
    }

    getTotalNumberOfUniqueProducts(p:Product, o:Order[]){
        let uniqueProductArray: orderDetail[] = [];
        o.filter(o=>o.orderStatus === "Completed").forEach(or=>{
            let x = or.orderDetails.filter(pr=> p.name === pr.name);
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
