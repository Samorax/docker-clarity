import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ECharts, EChartsOption} from "echarts";
import { Order } from "../Models/Order.model";
import { BehaviorSubject, Observable, Subscription, of, scheduled } from "rxjs";
import { OrderService } from "../Services/Order/OrderService";
import moment from "moment";
import { paymentService } from "../Services/PaymentService";
import { dayMonthlySale } from "../Models/dayMonthlySale";
import { monthlySalesChart } from "../Services/Order/MonthlySales.Chart";


@Component({
    selector:'app-orderoverview',
    templateUrl:'./orderoverview.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class OrderOverviewComponent implements OnInit{
    wc: BehaviorSubject<EChartsOption> = new BehaviorSubject<EChartsOption>({});
    orders!: Order[];
    ngOnInit(): void {
    this.loadOrders().subscribe(o=>{
        this.orders = o;
        this.salesRevenue = this.getRevenue(o);
        this.numberApprovedOrders = this.getApproved(o);
        this.numberUnApprovedOrders = this.getUnapproved(o);
        this.getMonthlySales(o);
        this.customerChart = this.getCustomerSegmentChart(o);
        this.channelChart = this.getRevenueChannelChart(o);
        this.cd.detectChanges();
    })

    
    }
    currency:string = this._paymentSvr.currencySymbol;
    salesRevenue!: Observable<number>;
    numberApprovedOrders!: Observable<number>;
    numberUnApprovedOrders!: Observable<number>;
    saleChartInstance!:EChartsOption
    saleChart!: EChartsOption; // bar chart showing the sales made per month.
    channelChart!: Observable<EChartsOption>; // what percentage of in-person vs online channel sales pie chart
    customerChart!: Observable<EChartsOption>; //what percentage of registered customers vs unregistered customers sales pie chart.

    constructor(private _orderService: OrderService, private _paymentSvr: paymentService, private cd:ChangeDetectorRef, private monthlySaleSVR: monthlySalesChart){}

    loadOrders(): Observable<Order[]>{    
                return this._orderService.getOrders()
    
            }

    getRevenue(o: Order[]):Observable<number>{
        let revenue = 0;
        o.filter(o=>o.orderStatus === 'Completed').forEach(o=> revenue += o.totalAmount);
        return of(revenue);
    };

    getApproved(o:Order[]):Observable<number>{
        let approvedNo = 0;
        approvedNo = o.filter(o=> o.orderStatus == "Approved").length;
        return of(approvedNo);
    }

    getUnapproved(o:Order[]):Observable<number>{
        let unApproved = 0;
        unApproved = o.filter(o=> o.orderStatus == "Unapproved").length;
        return of(unApproved);
    }

    
    getMonthlySales(o: Order[]){
        let r = this.monthlySaleSVR.getMonthlySales(o,'2024');
         this.wc.next( {
            tooltip:{
                trigger:'axis'
            },
            animationDurationUpdate: 500,
            title:{
                text:'Monthly Sales',
                top:'auto',
                left:'center',
                textStyle:{ fontSize:'16px',fontWeight:'normal'}
            },
            xAxis:{
                type:"category",
                data:["Jan", 'Feb', 'Mar', 'Apr',"May", "Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                axisTick:{ alignWithLabel:true},
                  axisLabel:{rotate:30}
            },
            yAxis:{
                type:"value",
                axisLabel:{ formatter: '{value}%', align:'center'}
            },
            series: [
                {
                  data: r,
                type: 'bar',
                showBackground: true,
                universalTransition:{
                    enabled:true,
                    divideShape:'clone'
                  }
                },
              ],
              
            });

    }


    displayDaysOfMothsChart(x:any){
        
        this.getDataforMonth(x.dataIndex, this.orders).subscribe((r:number[])=>{
            let monthLength = new Date(2024,x.dataIndex+1,0).getDate()
            console.log(monthLength)
            let days:number[] = [monthLength]
            for (let i = 0; i < monthLength; i++) {
                days[i] = i+1;
                
            }
            
            let init:EChartsOption = this.wc.getValue();
            let latter:EChartsOption = {
                animationDurationUpdate: 500,
                title:{
                    text:'Monthly Sales',
                    top:'auto',
                    left:'center',
                    textStyle:{ fontSize:'16px',fontWeight:'normal'}
                },
                tooltip:{
                    trigger:'axis',
                   
                },
                xAxis:{
                  data: days,
                  type:"category",
                  axisTick:{ alignWithLabel:true},
                  axisLabel:{rotate:30},
                },
                yAxis:{
                    axisLabel:{ formatter: '{value}%', align:'center'},
                    type:"value",
                },
                series:[{
                    data:r,
                    type:'bar',
                    showBackground:true,
                    universalTransition:{
                        enabled:true,
                        divideShape:'clone'
                      }
                }],
                graphic: [
                    {
                      type: 'text',
                      left: 50,
                      top: 20,
                      style: {
                        text: 'Back',
                        fontSize: 18
                      },
                      onclick: ()=>{this.wc.next(init)}
                      }
                  ]}
                  this.wc.next(latter);
        });
       

             
              
    } 


    getDataforMonth(n:any,o:Order[]):Observable<number[]>{
        return of(this.monthlySaleSVR.getDaySales(o,n,'2024'));
    }

    getCustomerSegmentChart(o:Order[]){
        type stringDictionay = Record<string,number>;
        let segement: stringDictionay = {"Unregistered":0,"Registered":0};
        let anonymous = 0; let registered = 0;
        if(o.length >= 1){
            o.filter(or=>or.orderStatus === "Completed").forEach(op=>{
            
                if(op.customerRecordId === 0){
                    anonymous += op.totalAmount;
                }else{
                    registered += op.totalAmount;
                }
            })
        };
        segement["Unregistered"] = Math.round(anonymous/(registered + anonymous)*100);
        segement["Registered"] = Math.round(registered/(registered + anonymous)*100);

        let sChart: EChartsOption = {
            tooltip:{
                trigger:'item'
            },
            title:{
                text:'Revenue by Customer Types',
                top:'auto',
                left:'center',
                textStyle:{ fontSize:'13px',fontWeight:'normal'}
            },
            
            series: [
                {
                  data: [{value: segement["Unregistered"] , name: "Unregistered"}, {value: segement["Registered"], name: "Registered"}],
                  type: 'pie'

                },
              ],
        }

        return of(sChart);
    }

    getRevenueChannelChart(o:Order[]){
        let inPersonRevenue:number = 0;
        let onlineMobileAppRevenue:number = 0;
        let onlineWebsiteRevenue:number = 0;
        o.filter(o=>o.orderStatus === "Completed").forEach(or=>{
            switch (or.channel) {
                case 'In-Person':
                    inPersonRevenue += or.totalAmount;
                    break;
                case 'Mobile App':
                    onlineMobileAppRevenue += or.totalAmount;
                    break;
                case 'Website':
                    onlineWebsiteRevenue += or.totalAmount;
                    break;
                default:
                    break;
            }
        });

        let percentageInPersonRevenue = Math.round((inPersonRevenue/(inPersonRevenue+onlineMobileAppRevenue+onlineWebsiteRevenue))*100);
        let percentageOnlineMobileAppRevenue = Math.round((onlineMobileAppRevenue/(inPersonRevenue+onlineMobileAppRevenue+onlineWebsiteRevenue))*100);
        let percentageOnlineWebsiteRevenue= Math.round((onlineWebsiteRevenue/(inPersonRevenue+onlineMobileAppRevenue+onlineWebsiteRevenue))*100);

        let cChart: EChartsOption = {
            tooltip:{
                trigger:'item'
            },
            title:{
                text:'Revenue by Channels',
                top:'auto',
                left:'center',
                textStyle:{ fontSize:'13px',fontWeight:'normal'}
            },
            series: [
                {
                  data: [{value: percentageInPersonRevenue , name: "in-person"},
                         {value: percentageOnlineMobileAppRevenue, name: "mobile app"},
                         {value: percentageOnlineWebsiteRevenue ,name:'website'}],
                  type: 'pie'
                  
                },
              ],
        }

        return of(cChart);
    }

}