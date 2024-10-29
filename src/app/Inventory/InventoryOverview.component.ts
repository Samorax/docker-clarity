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

@Component({
    selector:'app-productoverview',
    templateUrl:'./InventoryOverview.component.html',
    styleUrl:'./InventoryOverview.component.css',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class InventoryOverviewComponent implements OnInit{


initialStockWasteChart!: EChartsOption;
drilledStockWasteChart!:EChartsOption;
stockVarianceChart!: EChartsOption;

stkWasteSVR = inject(StockWasteService)
stkVarianceSVR = inject(StockVarianceService)


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
                    this.getStockWasteChart('2024');
                    this.stockVarianceChart = this.getStockVarianceChart('2024');
                    this.cd.detectChanges()
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

    //default is the year chart - showing monthly food wast values
    getStockWasteChart(year:string){
    
        let months = ['jan','feb','mar','apr','may','jun','jul','aug','sept','oct','nov','dec']
        this.stkWasteSVR.getYearWasteStock(year).subscribe(r=>{
            this.initialStockWasteChart  = {
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
            };
        })
            
    }

    showMonthlyStockWaste($event: ECElementEvent) {
        let index = $event.dataIndex;
        let days:number[] = []

        this.stkWasteSVR.getMonthWasteStock('2024',index).subscribe(r=>{
            for (let i = 0; i < r.data.length; i++) {
                days.push(i+1)
            }
            
            let y:EChartsOption = this.initialStockWasteChart
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
                      onclick: ()=>{this.initialStockWasteChart = y}
                    }
                  ]
            }
            this.initialStockWasteChart = x;
        })
    }

    //default chart is year chart - showing monthly variances
    getStockVarianceChart(year:string){
        let stkVC!:EChartsOption
        let months = ['jan','feb','mar','apr','may','jun','jul','aug','sept','oct','nov','dec']
        this.stkVarianceSVR.getYearVariance(year).subscribe(r=>{
            stkVC = {
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
                      data: [r[0].actualRevenue,r[1].actualRevenue,r[2].actualRevenue,r[3].actualRevenue,
                      r[4].actualRevenue,r[5].actualRevenue,r[6].actualRevenue,r[7].actualRevenue,r[8].actualRevenue,r[9].actualRevenue,r[10].actualRevenue,r[11].actualRevenue],
                      type: 'line',
                      stack: 'Total'
                    },
                    {
                      name:'ExpectedRevenue',
                      data: [r[0].expectedRevenue,r[1].expectedRevenue,r[2].expectedRevenue,r[3].expectedRevenue,r[4].expectedRevenue,r[5].expectedRevenue,r[6].expectedRevenue,
                      r[7].expectedRevenue,r[8].expectedRevenue,r[9].expectedRevenue,r[10].expectedRevenue,r[11].expectedRevenue],
                      type: 'line',
                      stack: 'Total'
                    }
                  ]
            }
        })
        return stkVC
    }

    getProductDemandChart(){
        let wc: EChartsOption = {
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
