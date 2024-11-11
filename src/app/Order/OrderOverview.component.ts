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

    constructor(private _orderService: OrderService, private _paymentSvr: paymentService, private cd:ChangeDetectorRef){}

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

        monthlySales["Jan"] = Math.round((jan/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["Feb"] = Math.round((feb/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["Mar"] = Math.round((mar/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["Apr"] = Math.round((apr/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["May"] = Math.round((may/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["Jun"] = Math.round((jun/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["Jul"] = Math.round((jul/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["Aug"] = Math.round((aug/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["Sep"] = Math.round((sep/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["Oct"] = Math.round((oct/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["Nov"] = Math.round((nov/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);
        monthlySales["Dec"] = Math.round((dec/(jan+feb+mar+apr+may+jun+jul+aug+sep+oct+nov+dec))*100);


         this.wc = {
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
                axisLabel:{ formatter: '{value}', align:'center'}
            },
            series: [
                {
                  data: [monthlySales["Jan"]  ,monthlySales["Feb"],monthlySales["Mar"],monthlySales["Apr"],
                  monthlySales["May"] , monthlySales["Jun"],monthlySales["Jul"], monthlySales["Aug"],
                  monthlySales["Sep"],  monthlySales["Oct"],monthlySales["Nov"],monthlySales["Dec"]
                ],
                type: 'bar',
                showBackground: true
                },
              ],
              
            };

    }


    displayDaysOfMothsChart(x:any){
        this.getDataforMonth(x.dataIndex, this.orders).subscribe((newData:dayMonthlySale[])=>{
            
            this.saleChart = this.wc;
            this.saleChartInstance = {
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
                  data: newData.map((item)=> item.day),
                  type:"category",
                  axisTick:{ alignWithLabel:true},
                  axisLabel:{rotate:30},
                },
                yAxis:{
                    axisLabel:{ formatter: '{value}%', align:'center'},
                    type:"value",
                },
                series:{
                    data:newData.map((item)=> Math.round(item.value)),
                    type:'bar',
                    showBackground:true,
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
                      onclick: ()=>{this.wc = this.saleChart;}
                      }
                  ]}
                  this.wc = this.saleChartInstance;
        });
       

             
              
    } 


    getDataforMonth(n:any,o:Order[]):Observable<any>{
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
        return of(newData);
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