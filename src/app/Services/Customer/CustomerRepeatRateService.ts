import { Injectable } from "@angular/core";
import { Customer } from "../../Models/Customer";
import { Order } from "../../Models/Order.model";
import { WeekDay } from "@angular/common";
import { WeeklyRepeatCustomers } from "./WeeklyRepeatCustomers.Interface";
import { MonthlyRepeatCustomers } from "./MonthlyRepeatCustomers.Interface";

@Injectable({
    providedIn:'root'
})
export class customerRepeatRateService
{

    getMontlyRepeatRate(a:Customer[],o:Order[],year:string)
    {
        let rates:number[] = []
        let q = this.getQualifiedOrders(o);
        let mReturnCustomers = this.getMonthlyReturningCustomers(a,q,year);
        for (let i = 0; i< mReturnCustomers.numberOfReturningCustomers.length; i++) 
        {
            let x = Math.round((mReturnCustomers.numberOfReturningCustomers[i]/mReturnCustomers.totalYearCustomers[i])*100)
            rates.push(x);
        }
        return rates;
    }
    
    getWeeklyRepeatRate(a:Customer[],o:Order[], month:number, year:string):number[]
    {
        let q = this.getQualifiedOrders(o);
        let wReturnCustomers = this.getWeelyReturningCustomers(a,q,month,year);
        let x = Object.values(wReturnCustomers);
        let t = x.splice(x.indexOf(x.length - 1),1);
        return x.map(i=> Math.round((i/t[0])*100))
    }

    private getMonthlyReturningCustomers(allCustomers:Customer[], qualifiedOrders:Order[], year:string):MonthlyRepeatCustomers
    {
        let yearLength = 12;
        let qualifiedCustomers:Customer[] = allCustomers.filter(c=>new Date(c.registrationDate).getFullYear() <= Number(year));
        let yearOrder:Order[] = qualifiedOrders.filter(o=>new Date(o.orderDate).getFullYear() === Number(year));
        let yearData:MonthlyRepeatCustomers;
        let yearDataYearCust:number[]=[yearLength].fill(0);
        let yearDataReturningCust:number[]=[yearLength].fill(0)
        let months:number[] = [];
        let monthsArbitaryData:number[] = [12].fill(0);

        for (let i = 0; i < yearLength; i++) {
                  months.push(i)
        }

        if(yearOrder.length !== 0){
            allCustomers.forEach(c=>{
                let customerOrders = yearOrder.filter(o=>o.customerID === c.id);
                customerOrders.forEach(o=>{
                    let month = new Date(o.orderDate).getMonth();
                    if(months.includes(month)){
                        monthsArbitaryData[months.indexOf(month)]++;
                    }
                });
                for(let i = 0;i < monthsArbitaryData.length;i++){
                    if(monthsArbitaryData[i] > 1){
                        yearDataReturningCust[i]++;
                        yearDataYearCust[i] = qualifiedCustomers.length;
                    }
                }
            });
        }

        return yearData = {totalYearCustomers:yearDataYearCust,numberOfReturningCustomers:yearDataReturningCust};
    }

    private getWeelyReturningCustomers(allCustomers:Customer[], qualifiedOrders:Order[], month:number, year:string):WeeklyRepeatCustomers
    {
        
        let monthOrders:Order[] = qualifiedOrders.filter(q=>new Date(q.orderDate).getMonth() === month && new Date(q.orderDate).getFullYear() === Number(year))
        let qualifiedCustomer:Customer[] = allCustomers.filter(a=>new Date(a.registrationDate).getMonth() <= month && new Date(a.registrationDate).getFullYear() <= Number(year))
        let WeeklyData: WeeklyRepeatCustomers= {Week1:0,Week2:0,Week3:0,Week4:0,Week5:0,MonthTotalCustomer:qualifiedCustomer.length}
       
        if(monthOrders.length !== 0)
        {
            qualifiedCustomer.forEach(c=>{
                let w1:number=0,w2:number=0,w3:number =0,w4:number = 0,w5:number=0;
                let customerOrders = monthOrders.filter(o=>o.customerID === c.id);
                if(customerOrders.length > 1){
                    customerOrders.forEach(co=>{
                        let day = new Date(co.orderDate).getDate();
                        if(day <= 7){
                            w1++;
                        }else if(day <=14 && day > 7){
                            w2++;
                        }else if(day > 14 && day <= 21){
                            w3++;
                        }else if(day > 21 && day <= 28){
                            w4++;
                        }else{
                            w5++;
                        }
                    })
                    if(w1 > 1){
                        WeeklyData.Week1++;
                    }else if(w2 > 1){
                        WeeklyData.Week2++;
                    }else if(w3 > 1){
                        WeeklyData.Week3++;
                    }else if(w4 > 1){
                        WeeklyData.Week4++;
                    }else if(w5 > 1){
                        WeeklyData.Week5++;
                    }
                }
            })
        }
        return WeeklyData;

    }

    private getQualifiedOrders(x:Order[])
    {
        return x.filter(o=>o.isCompleted && o.customerID !== null);
    }

    private calculateRepeatRate(totalNumberOfCustomers:number[], totalReturningCustomer:number[])
    {
        let repeatRate:number[] = []
        for (let i = 0; i < totalNumberOfCustomers.length; i++) {
            let result = (totalReturningCustomer[i]/totalNumberOfCustomers[i])*100;
            repeatRate.push(result);
        }
        return repeatRate;
    }
}