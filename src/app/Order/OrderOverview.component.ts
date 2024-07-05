import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ECharts, EChartsOption} from "echarts";
import { Order } from "../Models/Order.model";
import { Observable, Subscription, of, scheduled } from "rxjs";
import { OrderService } from "../Services/OrderService";
import moment from "moment";
import { paymentService } from "../Services/PaymentService";
import { dayMonthlySale } from "../Models/dayMonthlySale";


@Component({
    selector:'app-orderoverview',
    templateUrl:'./orderoverview.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class OrderOverviewComponent implements OnInit{
    wc!: EChartsOption;
    orders!: Order[];
    ngOnInit(): void {
    this.loadOrders().then(o=>{
        this.orders = o;
        this.salesRevenue = this.getRevenue(o);
        this.numberApprovedOrders = this.getApproved(o);
        this.numberUnApprovedOrders = this.getUnapproved(o);
        this.saleChart = this.getMonthlySales(o);
        this.customerChart = this.getCustomerSegmentChart(o);
        this.channelChart = this.getRevenueChannelChart(o);
        this.cd.detectChanges();
    })

    
    }
    currency:string = this._paymentSvr.currencySymbol;
    salesRevenue!: Observable<number>;
    numberApprovedOrders!: Observable<number>;
    numberUnApprovedOrders!: Observable<number>;
    saleChartInstance!:ECharts
    saleChart!: EChartsOption; // bar chart showing the sales made per month.
    channelChart!: Observable<EChartsOption>; // what percentage of in-person vs online channel sales pie chart
    customerChart!: Observable<EChartsOption>; //what percentage of registered customers vs unregistered customers sales pie chart.

    constructor(private _orderService: OrderService, private _paymentSvr: paymentService, private cd:ChangeDetectorRef){}

    loadOrders(): Promise<Order[]>{
        return new Promise((resolve)=>{
            let cache = this._orderService.ordersCache;
            if(cache.length != 0){
                resolve(cache);
            }else{
                this._orderService.getOrders()
                .subscribe(o=>{
                    cache = o;
                    resolve(cache);
                    this.cd.detectChanges()
                });
            }
        }) 
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
        type stringDictionay = Record<string,number>;
        let monthlySales: stringDictionay = {"Jan":0, "Feb":0, 'Mar':0, 'Apr':0,"May":0, "Jun":0,"Jul":0,"Aug":0,"Sep":0,"Oct":0,"Nov":0,"Dec":0};
        let jan = 0; let feb =0; let mar =0; let apr = 0; let may =0; let jun = 0; let jul =0; let aug =0;
        let sep = 0; let oct = 0; let nov =0 ; let dec =0 ;
        o.filter(o=>o.orderStatus === "Completed").forEach(o=>{
            let oDate = moment(o.orderDate).toDate();
            let m = oDate.getUTCMonth();
            let oy = oDate.getUTCFullYear();
            let ny = new Date().getUTCFullYear();
            if(oy == ny){
                switch (m) {
                    case 0:
                        jan += o.totalAmount;
                        break;
                    case 1:
                        feb += o.totalAmount;
                        break;
                    case 2:
                        mar += o.totalAmount;
                        break;
                    case 3:
                        apr += o.totalAmount;
                        break;
                    case 4:
                        may += o.totalAmount;
                        break;
                    case 5:
                        jun += o.totalAmount;
                        break;
                    case 6:
                        jul += o.totalAmount;
                        break;
                    case 7:
                        aug += o.totalAmount;
                        break;
                    case 8:
                        sep += o.totalAmount;
                        break;
                    case 9:
                        oct += o.totalAmount;
                        break;
                    case 10:
                        nov += o.totalAmount;
                        break;
                    case 11:
                        dec += o.totalAmount;
                        break;
                    default:
                        break;
                }
            }
        });

        monthlySales["Jan"] = (jan/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["Feb"] = (feb/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["Mar"] = (mar/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["Apr"] = (apr/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["May"] = (may/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["Jun"] = (jun/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["Jul"] = (jul/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["Aug"] = (aug/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["Sep"] = (sep/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["Oct"] = (oct/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["Nov"] = (nov/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;
        monthlySales["Dec"] = (dec/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100;


         this.wc = {
            tooltip:{
                trigger:'axis'
            },
            animationDurationUpdate: 500,
            title:{
                text:'Monthly Sales',
                top:'left',
                textStyle:{ fontSize:'18px'}
            },
            xAxis:{
                type:"category",
                data:["Jan", 'Feb', 'Mar', 'Apr',"May", "Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
            },
            yAxis:{
                type:"value",
            },
            series: [
                {
                  data: [monthlySales["Jan"]  ,monthlySales["Feb"],monthlySales["Mar"],monthlySales["Apr"],
                  monthlySales["May"] , monthlySales["Jun"],monthlySales["Jul"], monthlySales["Aug"],
                  monthlySales["Sep"],  monthlySales["Oct"],monthlySales["Nov"],monthlySales["Dec"]
                ],
                  type: 'bar'
                },
              ],
              
            };
            return this.wc;

    }

    getSaleChartInstance(x:ECharts){
        this.saleChartInstance = x;
        this.cd.detectChanges()
    }


    displayDaysOfMothsChart(x:any){
        let newData:dayMonthlySale[] = this.getDataforMonth(x.dataIndex, this.orders);
        this.saleChartInstance.setOption({
            xAxis:{
              data: newData.map((item)=> item.day)
            },
            series:{
                data:newData.map((item)=> item.value),
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
                    if(this.saleChartInstance){
                        console.log(this.saleChart)
                            this.saleChartInstance.setOption(this.saleChart);
                            this.cd.detectChanges()
                        
                    }
                  }
                }
              ]
        });
    } 


    getDataforMonth(n:any,o:Order[]){
        let completedMonthOrder = o.filter(or=>or.orderStatus == 'Completed' && n+1 == moment(or.orderDate).toDate().getMonth()+1);
        let totaldaysofMonth = new Date(new Date().getUTCFullYear(),n+1,0).getDate();
        let i = 1; let newData= []; 
        while (i < totaldaysofMonth) {
            let daySales:dayMonthlySale = <dayMonthlySale>{};
            daySales.day = i++;
            daySales.value = 0;
            completedMonthOrder.forEach(o=>{
                if(new Date(o.orderDate).getDate() === daySales.day){
                    daySales.value += o.totalAmount;
                }
            });
            newData.push(daySales);
        }
        return newData;
    }

    getCustomerSegmentChart(o:Order[]){
        type stringDictionay = Record<string,number>;
        let segement: stringDictionay = {"Unregistered":0,"Registered":0};
        let anonymous = 0; let registered = 0;
        if(o.length >= 1){
            o.filter(o=>o.orderStatus === "Completed").forEach(o=>{
                if(o.customerID == 0){
                    anonymous += o.totalAmount;
                }else{
                    registered += o.totalAmount;
                }
            })
        };
        segement["Unregistered"] = (anonymous/registered +anonymous)*100;
        segement["Registered"] = (registered/registered +anonymous)*100;


        let sChart: EChartsOption = {
            tooltip:{
                trigger:'item'
            },
            title:{
                text:'Revenue by Segment',
                top:'top',
                textStyle:{ fontSize:'18px'}
            },
            legend:{
                orient:'vertical',
                left:'left',
                top:'24px',
                data:['Unregistered','Registered']
            },
            series: [
                {
                  data: [{value: segement["Unregistered"] , name: "Unregistered"}, {value: segement["Registered"], name: "Registered"}],
                  type: 'pie',
                  top:'20%',
                  height:'100%'

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

        let percentageInPersonRevenue = (inPersonRevenue/(inPersonRevenue+onlineMobileAppRevenue+onlineWebsiteRevenue))*100;
        let percentageOnlineMobileAppRevenue = (onlineMobileAppRevenue/(inPersonRevenue+onlineMobileAppRevenue+onlineWebsiteRevenue))*100;
        let percentageOnlineWebsiteRevenue= (onlineWebsiteRevenue/(inPersonRevenue+onlineMobileAppRevenue+onlineWebsiteRevenue))*100

        let cChart: EChartsOption = {
            tooltip:{
                trigger:'item'
            },
            title:{
                text:'Revenue by Channel',
                top:'top',
                textStyle:{ fontSize:'18px'}
            },
            legend:{
                orient:'vertical',
                left:'left',
                top:'24px',
                data:['in-person','mobile app','website']
            },
            series: [
                {
                  data: [{value: percentageInPersonRevenue , name: "in-person"},
                         {value: percentageOnlineMobileAppRevenue, name: "mobile app"},
                         {value: percentageOnlineWebsiteRevenue ,name:'website'}],
                  type: 'pie',
                  top:'20%',
                  height:'100%'
                  
                },
              ],
        }

        return of(cChart);
    }

}