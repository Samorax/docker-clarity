import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { ProductService } from "../Services/ProductService";
import { Product } from "../Models/Product";
import { Order } from "../Models/Order.model";
import { ECElementEvent, ECharts, EChartsOption } from "echarts";
import { OrderService } from "../Services/OrderService";
import { orderDetail } from "../Models/OrderDetails";
import moment from "moment";
import { StockWasteService } from "../Services/Stock/StockWasteService";
import { StockVarianceService } from "../Services/Stock/StockVarianceService";
import { BehaviorSubject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { Stock } from "../Models/Stock";

@Component({
    selector:'app-productoverview',
    templateUrl:'./InventoryOverview.component.html',
    styleUrl:'./InventoryOverview.component.css',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class InventoryOverviewComponent implements OnInit{


initialStockWasteChart:BehaviorSubject<EChartsOption> = new BehaviorSubject<EChartsOption>({})
drilledStockWasteChart!:EChartsOption;
stockVarianceChart: BehaviorSubject<EChartsOption> = new BehaviorSubject<EChartsOption>({});

stkWasteSVR = inject(StockWasteService)
stkVarianceSVR = inject(StockVarianceService)
stocks!: Stock[];


    constructor(private activatedRoute:ActivatedRoute,private cd: ChangeDetectorRef){}
    products: Product[] = [];
    productCount: number = 0;
    categoriesCount: number = 0;
    orders!: Order[];
    date!:Date
    today = new Date().toString()
    productDemandChart: BehaviorSubject<EChartsOption> = new BehaviorSubject<EChartsOption>({})
    productDemandChartInstance!: ECharts;

    ngOnInit(): void {
        this.initialize();
        
    };

    initialize(){
        
                this.activatedRoute.data.subscribe((p:any)=>{
                    this.products = p.products;
                    this.productCount = this.products.length;
                    this.getProductCategories(this.products).then(x=>{
                        this.categoriesCount = x.length;
                    });
                    this.getOrders();
                    this.getStocks();
                    this.getStockWasteChart('2024');
                    this.getStockVarianceChart('2024');
                    this.cd.detectChanges()
                });
            
    }

    onProductDemandChart(x:any) {
        this.productDemandChartInstance = x;
        }

    getOrders(){
                this.activatedRoute.data.subscribe((or:any)=> 
                    {
                        this.orders = or.orders;
                        this.getProductDemandChart();
                        this.cd.detectChanges()
                    });
    }

    getStocks(){
        this.activatedRoute.data.subscribe((stk:any)=>{
            this.stocks = stk.stocks;
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

    //default is the year chart - showing monthly food wast values
    getStockWasteChart(year:string){
    
        let months = ['jan','feb','mar','apr','may','jun','jul','aug','sept','oct','nov','dec']
        this.stkWasteSVR.getYearWasteStock(year,this.stocks).subscribe(r=>{
            this.initialStockWasteChart.next({
                animationDurationUpdate: 500,
                title:{
                    text:'Food Waste Value',
                    top:'auto',
                    left:'center',
                    textStyle:{ fontSize:'16px',fontWeight:'normal'}
                },
                tooltip:{
                    trigger:'axis',
                   
                },
                xAxis:{
                    type:"category",
                    axisTick:{ alignWithLabel:true},
                    axisLabel:{rotate:30},
                    data:months
        
                },
                yAxis:{
                    axisLabel:{ formatter: '{value}', align:'center'},
                    type:"value",
                },
                series: [
                    {
                      data: [r.jan.stockValue,r.feb.stockValue,r.mar.stockValue,r.apr.stockValue,r.may.stockValue,r.jun.stockValue,r.jul.stockValue,
                        r.aug.stockValue,r.sept.stockValue,r.oct.stockValue,r.nov.stockValue,r.dec.stockValue
                      ],
                      type: 'bar',
                      showBackground: true
                    },
                  ],
            });
        })
            
    }

    showMonthlyStockWaste($event: ECElementEvent) {
        let index = $event.dataIndex;
        let days:number[] = []

        this.stkWasteSVR.getMonthWasteStock('2024',index,this.stocks).subscribe(r=>{
            for (let i = 0; i < r.data.length; i++) {
                days.push(i+1)
            }
            
            let y:EChartsOption = this.initialStockWasteChart.getValue()
            let x:EChartsOption = {
            title:{
                    text:'Food Waste Value',
                    top:'auto',
                    left:'center',
                    textStyle:{ fontSize:'16px',fontWeight:'normal'}
                },
                tooltip:{
                    trigger:'axis',
                   
                },
                xAxis:{
                    type:"category",
                    axisTick:{ alignWithLabel:true},
                    axisLabel:{rotate:30},
                    data:days
        
                },
                yAxis:{
                    axisLabel:{ formatter: '{value}', align:'center'},
                    type:"value",
                },
                series: [
                    {
                      data: r.data.map(d=>d.stockValue),
                      type: 'bar',
                      showBackground: true,
                      universalTransition:{
                        enabled:true,
                        divideShape:'clone'
                      }
                    },
                  ],
                  graphic: [
                    {
                      type: 'text',
                      left: 50,
                      top: 20,
                      style: {
                        text: 'Back',
                        fontSize: 18
                      },
                      onclick: ()=>{this.initialStockWasteChart.next(y)}
                    }
                  ]
            }
            this.initialStockWasteChart.next(x);
        })
    }

    showMonthlyStockVariance($event:ECElementEvent){
        let index = $event.dataIndex;
        let days:number[] = []

        this.stkVarianceSVR.getMonthVariance("2024",index,this.stocks).subscribe(r=>{
            
            for (let i = 0; i < r.actualRevenue.length; i++) {
                days.push(i+1)
            }

            let init = this.stockVarianceChart.getValue();
            let latter:EChartsOption = {
                legend:{data:['ExpectedRevenue','ActualRevenue'], top:'bottom'},
                title:{
                    text:'Stock Variance',
                    left:'center',
                    top:'auto',
                    textStyle:{ fontSize:'16px',fontWeight:'normal'}
                },
                tooltip:{
                    trigger:'axis'
                },
                xAxis: {
                    data: days
                  },
                  yAxis: {},
                  series: [
                    {
                      name:'ActualRevenue',
                      data: r.actualRevenue,
                      type: 'line',
                      stack: 'Total'
                    },
                    {
                      name:'ExpectedRevenue',
                      data: r.expectedRevenue,
                      type: 'line',
                      stack: 'Total'
                    }
                  ],
                  graphic: [
                    {
                      type: 'text',
                      left: 50,
                      top: 20,
                      style: {
                        text: 'Back',
                        fontSize: 18
                      },
                      onclick: ()=>{this.stockVarianceChart.next(init)}
                    }
                  ]
            }
            this.stockVarianceChart.next(latter);
        })
    }
    //default chart is year chart - showing monthly variances
    getStockVarianceChart(year:string){
        
        let months = ['jan','feb','mar','apr','may','jun','jul','aug','sept','oct','nov','dec']
        this.stkVarianceSVR.getYearVariance(year, this.stocks).subscribe(r=>{
            this.stockVarianceChart.next({
                legend:{data:['ExpectedRevenue','ActualRevenue'], top:'bottom'},
                title:{
                    text:'Stock Variance',
                    left:'center',
                    top:'auto',
                    textStyle:{ fontSize:'16px',fontWeight:'normal'}
                },
                tooltip:{
                    trigger:'axis'
                },
                xAxis: {
                    data: months
                  },
                  yAxis: {},
                  series: [
                    {
                      name:'ActualRevenue',
                      data: r.actualRevenue,
                      type: 'line',
                      stack: 'Total'
                    },
                    {
                      name:'ExpectedRevenue',
                      data: r.expectedRevenue,
                      type: 'line',
                      stack: 'Total'
                    }
                  ]
            })
        })
        
    }

    getProductDemandChart(){
        this.productDemandChart.next({
            title:{
                text:'Product Demand (%)',
                left:'center',
                textStyle:{ fontSize:'16px',fontWeight:'normal'}
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
            });
            
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
          let n = Math.round(this.calculatePercentageDemand(this.orders.length, x));
            ns.push(n);
        });
        return ns;
    }

    
}
