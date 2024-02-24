import { AfterViewInit, Component, OnInit } from "@angular/core";
import { Customer } from "../Models/Customer";
import { CustomerService } from "../Services/CustomerService";
import { OrderService } from "../Services/OrderService";
import { Order } from "../Models/Order.model";
import { BehaviorSubject, Observable, of } from "rxjs";
import { EChartsOption } from "echarts";
import moment from "moment";

@Component({
    selector:'app-customeroverview',
    templateUrl:'./customeroverview.component.html'
})

export class CustomerOverviewComponent implements OnInit{
    
    
    WRepeatChartOption!: EChartsOption;
    gPieChart!: EChartsOption;
    rPieChart!: EChartsOption;
    constructor(private _customerService: CustomerService, private _orderService: OrderService){}
    
    customers: Customer[] = []
    totalRegisteredCustomers!: number;
    totalRepeatCustomers!:number;
    totalMonthBirthdays!: number;
    totalHighSpenders: number = 0;
    highSpenders: Customer[] = [];
    repeatCustomers: Customer[] = [];

    ngOnInit(): void {
        this.loadInitOrders().subscribe(o=>{
            this.loadInit().subscribe(c=>{
                this.totalRegisteredCustomers = c.length;
                this.totalMonthBirthdays = this.calBirthdays(c);
                this.gPieChart = this.drawDemographPieChart(c);
                let cr = this.calRepeatCusts(o,c);
                this.totalRepeatCustomers = cr.total;
                let hSp = this.calHighSpenders(c,o);
                this.totalHighSpenders = hSp.total;
              
                //charts
                this.WRepeatChartOption = this.drawWRepeatChart(c,o);
                
                this.rPieChart = this.drawDemographPieChart(cr.repeatCustomers);
    
                })
        });
       };
        
        
  
        
                  
                

    //load customers from cache or from database. Replenish cache, if empty.
    loadInit(){
        let cacheC = this._customerService.customersCache;
        if(cacheC.length == 0){
         this._customerService.getCustomers().subscribe(c=>{
             c.forEach(cust => {
                 cacheC.push(cust);
             });
         })};
        return of(cacheC);
    };

     loadInitOrders(): Observable<Order[]>{
        let cacheO = this._orderService.ordersCache;
         if(cacheO.length == 0){
            this._orderService.getOrders().subscribe(o=>{
            o.forEach(k=> cacheO.push(k));
         })};

         return of(cacheO);
     }


    //total number of customers having their birthdays in a typical month.
    calBirthdays(c: Customer[]){
        let month = new Date().getUTCMonth();
        let months: number[] = [];
        c.forEach(c=> months.push(moment(c.birthday,"DD/MM/YYYY").toDate().getMonth()));
        return months.filter(m=> m == month).length;
        
      };

    

    //calculates repeat customers
    //argument: array of orders, array of customers
    //return object with properties: totalnumber and array of repeat customers
    calRepeatCusts(o: Order[], y: Customer[] ){
        let rCustomers = [];
        if(o.length > 1){
            for (let c = 0; c < y.length; c++) {
                let r = o.filter(o=> o.customerID == y[c].id);
                if(r.length >= 2){
                    rCustomers.push(y[c]);
                } 
            }
        }
        return {total: rCustomers.length, repeatCustomers: rCustomers};
    }

    //using a pie chart, display the %s of repate customers based on their ages.
    //argument: array of repeat customers or ALL Customers.
    calDRepeatCustomers(x:Customer[]): any{
        let teenagers: Customer[] = [];
        let youngAdults: Customer[] = [];
        let adults: Customer[] = [] = []
        let olderPeople: Customer[] = []

        type stringDictionay = Record<string,number>;
        let ages: stringDictionay = {
            "18-24":0,
            "25-31":0,
            "32-38":0
        };

        x.forEach(c=>{
            let age = this.getAge(new Date(c.birthday));
            if(age >= 18 && age <=24){
                youngAdults.push(c);
            }else if(age >= 25 && age<= 31){
                adults.push(c);
            }else if(age >= 32 && age <= 38){
                olderPeople.push(c);
            }
        });
        ages["18-24"] = (youngAdults.length/x.length)*100;
        ages["25-31"] = (adults.length/x.length)*100;
        ages["32-38"] = (olderPeople.length/x.length)*100;

        return ages;
    }

    drawDemographPieChart(c:Customer[]){
        let ageSegment = this.calDRepeatCustomers(c);
        let chart: EChartsOption = {
            series: [
                {
                  data: [{value: ageSegment['18-24'] , name: "18-24"}, {value: ageSegment["25-31"] , name: "25-31"}, {value: ageSegment["32-38"] , name: "32-38"}],
                  type: 'pie',
                },
              ],
        }
        return chart;
    }

    //using a bar chart, display the %s of weekly rate of repeat customers in a month
    //argument: array of repeat customers, array of orders.
    calWRepeatCustomers(x:Customer[], or: Order[]): any{
        let w1: any[] = [];let w2: any[] = []; let w3: any[] = [];let w4: any[] = [];

        type stringDictionay = Record<string, number>;
        let weeks: stringDictionay = {"week1":0,"week2":0,"week3":0,"week4":0};

        let monthOrder = or.filter(o=> new Date(o.orderDate).getUTCMonth() == new Date().getUTCMonth());
        if(monthOrder.length >= 1){
            for (let c = 0; c < x.length; c++) {
                const element = x[c];
                let o1: Order[] = []; let o2: Order[] = []; let o3: Order[] = []; let o4: Order[] = [];
                monthOrder.forEach(o=>{
                    let dateOfMonth = new Date(o.orderDate).getDate();
                    if(dateOfMonth >= 1 && dateOfMonth <=7){
                        if(element.id == o.customerID){
                            o1.push(o);
                        }
                    }else if( dateOfMonth >=8 && dateOfMonth <= 15){
                        console.log("this is the week");
                        console.log(element);
                        console.log(o.customerID);
                        if(element.id == o.customerID){
                            o2.push(o);
                        }
                    }else if(dateOfMonth >= 16 && dateOfMonth <= 23){
                        if(element.id == o.customerID){
                            o3.push(o);
                        }
                    }else{
                        if(element.id == o.customerID){
                            o4.push(o);
                        }
                    }
                });
                if(o1.length >= 2){
                    w1.push(element);
                }
                if(o2.length >= 2){
                    w2.push(element);
                }
                if(o3.length >= 2){
                    w3.push(element);
                }
                if(o4.length >= 2){
                    w4.push(element);
                }
            } 
        }
        weeks["week1"] = (w1.length/x.length)*100;
        weeks["week2"] = (w2.length/x.length)*100;
        weeks["week3"] = (w3.length/x.length)*100;
        weeks["week4"] = (w4.length/x.length)*100;
       
        return weeks;
    }

    drawWRepeatChart(x: Customer[],o: Order[]):EChartsOption{
        let w = this.calWRepeatCustomers(x,o);
        let wc: EChartsOption = {
            xAxis:{
                type:"category",
                data:['week 1', 'week 2', 'week 3', 'week 4']
    
            },
            yAxis:{
                type:"value",
            },
            series: [
                {
                  data: [ w["week1"], w["week2"], w["week3"], w["week4"]],
                  type: 'bar',
                },
              ],
            };
            return wc;
    }
    

    //get the number of high spending customers and the list.
    //argument: array of customers, array of orders
    calHighSpenders(x: Customer[], y: Order[]){
        let highSpenders: Customer[] = [];
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
        return {total: highSpenders.length, highSpenders: highSpenders};
    }

    //Get the age of a customer. Arguments: new Date(birthday of customer)
    getAge(d1:any, d2?:any){
        d2 = d2 || new Date();
        var diff = d2.getTime() - d1.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
    }

    //Get the total value of all orders.
    getRevenue(o: Order[]):number{
        let sum: number = 0;
        o.forEach(or=>{
            sum += or.totalAmount;
        })
        return sum;
    }
}