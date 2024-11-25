import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { Customer } from "../Models/Customer";
import { Order } from "../Models/Order.model";
import { BehaviorSubject } from "rxjs";
import { EChartsOption } from "echarts";
import moment from "moment";
import { ActivatedRoute } from "@angular/router";
import { ageDemographicService } from "../Services/Customer/AgeDemographicService";
import { averageHighSpendingService } from "../Services/Customer/Average.V.HighSpendingService";
import { customerRepeatRateService } from "../Services/Customer/CustomerRepeatRateService";

@Component({
    selector:'app-customeroverview',
    templateUrl:'./customeroverview.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class CustomerOverviewComponent implements OnInit{
    
    
    WRepeatChartOption: BehaviorSubject<EChartsOption> = new BehaviorSubject<EChartsOption>({});
    gPieChart: BehaviorSubject<EChartsOption> = new BehaviorSubject<EChartsOption>({});
    rPieChart: BehaviorSubject<EChartsOption> = new BehaviorSubject<EChartsOption>({});
    AverageSpendingsChart: BehaviorSubject<EChartsOption> = new BehaviorSubject<EChartsOption>({});

    ageDemographicSvr = inject(ageDemographicService)
    customerRepeatRateSvr = inject(customerRepeatRateService)
    averageSpendingsSvr = inject(averageHighSpendingService)
    cd = inject(ChangeDetectorRef)
    activatedRoute = inject(ActivatedRoute)

    
    customers: BehaviorSubject<Customer[]> = new BehaviorSubject<Customer[]>([])
    orders: BehaviorSubject<Order[]> = new BehaviorSubject<Order[]>([])
    totalRegisteredCustomers: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    totalRepeatCustomers:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    totalMonthBirthdays: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    totalHighSpenders:  BehaviorSubject<number> = new BehaviorSubject<number>(0);
    highSpenders: BehaviorSubject<Customer[]> = new BehaviorSubject<Customer[]>([]);
    repeatCustomers: BehaviorSubject<Customer[]> = new BehaviorSubject<Customer[]>([]);;

    

    ngOnInit(): void {
       this.getCustomers();
       this.getOrders();

        this.calBirthdays();
        this.drawDemographPieChart();
        this.calRepeatCusts();
        this.calHighSpenders();

        this.drawAverageSpendingsBarChart(11,"2024")
        this.drawMRepeatChart(11,"2024");

        this.cd.detectChanges();
        
       };
        

    //load customers from cache or from database. Replenish cache, if empty.
    getCustomers(){
          this.activatedRoute.data.subscribe((o:any)=>{
            this.customers.next(o.customers)
            this.totalRegisteredCustomers.next(o.customers.length)
          })
        }

     getOrders(){
        this.activatedRoute.data.subscribe((o:any)=>{
            this.orders.next(o.orders)
        })
       
     }


    //total number of customers having their birthdays in a typical month.
    calBirthdays(){
        let month = new Date().getUTCMonth();
        let months: number[] = [];
        this.customers.subscribe(cust=>{
            cust.forEach(c=> months.push(moment(c.birthday,"DD/MM/YYYY").toDate().getMonth()));
        this.totalMonthBirthdays.next(months.filter(m=> m == month).length);
        
      });
    }
    

    //calculates repeat customers
    //argument: array of orders, array of customers
    //return object with properties: totalnumber and array of repeat customers
    calRepeatCusts(){
        let rCustomers = []; 
        this.orders.subscribe(o=>{
            this.customers.subscribe(y=>{
                if(o.length > 1){
                    for (let c = 0; c < y.length; c++) {
                        let r = o.filter(o=> o.customerID == y[c].id);
                        if(r.length >= 2){
                            rCustomers.push(y[c]);
                        } 
                    }
                }
            })
            this.totalRepeatCustomers.next(rCustomers.length)
        })
    }

    
    drawDemographPieChart(){
        let ageSegment = this.ageDemographicSvr.calDRepeatCustomers(this.customers);
        this.gPieChart.next({
            title:{
                text:'Age Demographics of Customers',
                top:'auto',
                left:'center',
                textStyle:{ fontSize:'13px',fontWeight:'normal'}
            },
            tooltip:{
                trigger:'item'
            },
            series: [
                {
                  data: [
                    {value: ageSegment["18-26"] , name: "18-26 (GenZ)"}, 
                    {value: ageSegment["27-42"] , name: "27-42 (Millenials)"}, 
                    {value: ageSegment["43-58"] , name: "43-58 (GenX)"},
                    {value: ageSegment["59-and-above"] , name: "59-and-above (BabyBoomers)"},
                    {value: ageSegment["below-18"], name: "below-18 (Children)"},
                ],
                  type: 'pie',
                },
              ],
        })
    
    }

    drawAverageSpendingsBarChart(month:number, year:string)
    {  
        let days:number[] = []
        let months = ['jan','feb','mar','apr','may','jun','jul','aug','sept','oct','nov','dec']

        this.customers.subscribe(c=>{
            this.orders.subscribe(o=>{
                let mdataSeries = this.averageSpendingsSvr.getMonthlyAverageSpendings(o,c,month,year);
                let ydataSeries = this.averageSpendingsSvr.getYearlyAverageSpendings(o,c,month,year);

                for (let i = 0; i < mdataSeries.length; i++) {
                     days.push(i+1)
                }
                let init:EChartsOption;
                let latter:EChartsOption;

                latter = {
                    title:{
                        text:'Average Spendings of Customers',
                        top:'auto',
                        left:'center',
                        textStyle:{ fontSize:'13px',fontWeight:'normal'}
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
                          data: ydataSeries,
                          type: 'bar',
                          showBackground: true
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
                          onclick: ()=>{this.AverageSpendingsChart.next(init)}
                        }
                      ]
                    };
                init = {
                    title:{
                        text:'Average Spendings of Customers',
                        top:'auto',
                        left:'center',
                        textStyle:{ fontSize:'13px',fontWeight:'normal'}
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
                          data: mdataSeries,
                          type: 'bar',
                          showBackground: true,
                          universalTransition:{
                            enabled:true,
                            divideShape:'clone'
                          }
                        }
                      ],
                }

                this.AverageSpendingsChart.next(init)
            })
        })
        
    }

    

    drawMRepeatChart(m:number,y:string){
        let months = ['jan','feb','mar','apr','may','jun','jul','aug','sept','oct','nov','dec']
        let weeks =  ['Week 1', 'Week 2','Week 3','Week 4','Week 5'];
        this.customers.subscribe(c=>{
            this.orders.subscribe(o=>{
                let mDataSeries = this.customerRepeatRateSvr.getMontlyRepeatRate(c,o,y);
                let wDataSeries = this.customerRepeatRateSvr.getWeeklyRepeatRate(c,o,m,y);

                let init: EChartsOption;
                let latter: EChartsOption;
                init = {
                    title:{
                        text:'Rate of Repeat Customers',
                        top:'auto',
                        left:'center',
                        textStyle:{ fontSize:'13px',fontWeight:'normal'}
                    },
                    tooltip:{
                        trigger:'axis'
                    },
                    xAxis:{
                        type:"category",
                        axisTick:{ alignWithLabel:true},
                        axisLabel:{rotate:30},
                        data:months
            
                    },
                    yAxis:{
                        type:"value",
                    },
                    series: [
                        {
                          data: mDataSeries,
                          type: 'bar',
                          showBackground: true,
                          universalTransition:{
                            enabled:true,
                            divideShape:'clone'
                          }
                        },
                      ]
                    };
                latter = {
                    title:{
                        text:'Rate of Repeat Customers',
                        top:'auto',
                        left:'center',
                        textStyle:{ fontSize:'13px',fontWeight:'normal'}
                    },
                    tooltip:{
                        trigger:'axis'
                    },
                    xAxis:{
                        type:"category",
                        axisTick:{ alignWithLabel:true},
                        axisLabel:{rotate:30},
                        data:weeks
            
                    },
                    yAxis:{
                        type:"value",
                    },
                    series: [
                        {
                          data: wDataSeries,
                          type: 'bar',
                          showBackground: true
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
                          onclick: ()=>{this.WRepeatChartOption.next(init)}
                        }
                      ]
                }
                this.WRepeatChartOption.next(init)
            })
        })
        
    }
    

    //get the number of high spending customers and the list.
    //argument: array of customers, array of orders
    calHighSpenders(){
        let highSpenders: Customer[] = [];
        this.customers.subscribe(x=>{
            this.orders.subscribe(y=>{
                let orderOfMonth = y.filter(o=>{
                    new Date(o.orderDate).getUTCMonth() == new Date().getUTCMonth();
                });
                let revenueAverage = this.getRevenue(orderOfMonth)/orderOfMonth.length;
                for (let c = 0; c < x.length; c++) {
                    const element = x[c];
                    orderOfMonth.forEach(o=>{
                        if(o.customerID == element.id && o.totalAmount >= revenueAverage){
                            highSpenders.push(element);
                        }
                    });
                };
            })
            this.totalHighSpenders.next(highSpenders.length)
            this.highSpenders.next(highSpenders)
        })
    }

    //Get the age of a customer. Arguments: new Date(birthday of customer)
    

    //Get the total value of all orders.
    getRevenue(o: Order[]):number{
        let sum: number = 0;
        o.forEach(or=>{
            sum += or.totalAmount;
        })
        return sum;
    }
}