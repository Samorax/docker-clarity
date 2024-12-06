import { Injectable, Injector } from "@angular/core";
import { Order } from "../../Models/Order.model";
import { TotalSpendings } from "./TotalSpendings.Interface";
import { Customer } from "../../Models/Customer";
import { number } from "echarts";
import { TotalCustomers } from "./TotalCustomers.Interface";

@Injectable({
    providedIn:'root'
})
export class averageHighSpendingService {
    
    //get the average spendings of each day in a particualr month.
    getMonthlyAverageSpendings(allOrders:Order[],allCustomers:Customer[], month:number,year:string):number[]
    {
        let qualifiedOrders = this.getSpendingsByRegisteredCustomers(allOrders);
        let totalMonthSpendings = this.groupSpendingsByDaysOfTheMonth(month,year,qualifiedOrders);
        let totalMonthCustomers = this.groupTotalCustomersByDaysOfTheMonth(year,month,allCustomers);
        return this.calculateAverageSpending(totalMonthCustomers,totalMonthSpendings);
    }

    getYearlyAverageSpendings(allOrders:Order[],allCustomers:Customer[], month:number,year:string){
        let qualifiedOrders = this.getSpendingsByRegisteredCustomers(allOrders);
        let totalYearSpendings = this.groupSpendingsByMonthsOfTheYear(year,qualifiedOrders);
        let totalYearCustomers = this.groupTotalCustomersByMonthsOfTheYear(year,month,allCustomers);
        return this.calculateAverageSpending(totalYearCustomers,totalYearSpendings);
    }

    //calculate average spendings per customer.
    //formular = (totalspendings in a given period / total number of customer in a given period)
    calculateAverageSpending(numberofcustomers:number[],totalSpendings:number[]):number[]
    {
        let monthAverageSpendings:number[] = [];
        for (let i = 0; i < numberofcustomers.length; i++) {

            let result = totalSpendings[i]/numberofcustomers[i]
            monthAverageSpendings.push(result);
        }
        return monthAverageSpendings;
    }

    getSpendingsByRegisteredCustomers(x:Order[]):Order[]
    {
        return x.filter(o=>o.isCompleted && o.customerId !== null)
    }

    //get the total amount of customers for each day of the month
    //this is important because new customers may may impact the correct calculation
    groupTotalCustomersByDaysOfTheMonth(year:string, month:number, c:Customer[]):number[]
    {
        let monthCustomers:Customer[] = c.filter(cut=>new Date(cut.registrationDate).getMonth() <= month && new Date(cut.registrationDate).getFullYear() <= Number(year));
        let monthLength = new Date(Number(year),month,0).getDate();
        let monthData: number[] = new Array<number>(monthLength).fill(0);
        let days:number[] = []

        for (let i = 0; i < monthLength; i++) {
            days.push(i+1)          
        }

        if(monthCustomers.length !== 0){
            monthCustomers.forEach(c=>{
                let day = new Date(c.registrationDate).getDate()
                if(days.includes(day)){
                    
                monthData[day - 1]++;
                        
                    
                }
            })
        }
        return monthData;
    }

    //get the total amount spent by registered customers for each day of the month.
    //arguments: month, year and orders by registered customers
    groupSpendingsByDaysOfTheMonth(month:number,year:string,x:Order[]):number[]
    {
        let monthOrder:Order[] = x.filter(o=>new Date(o.orderDate).getMonth() === month && new Date(o.orderDate).getFullYear() === Number(year))
        let monthLength = new Date(Number(year),month,0).getDate();
        let monthData: number[] = new Array<number>(monthLength).fill(0);
        let days:number[] = []

        for (let i = 0; i < monthLength; i++) {
            days.push(i+1)          
        }

        if(monthOrder.length !== 0){
            monthOrder.forEach(o=>{
                let day = new Date(o.orderDate).getDate()
                if(days.includes(day)){
                    monthData[day-1] += o.totalAmount;
                }
            })
        }
        return monthData;
    }

    //get the total amount spent by registered customers for each month of the year.
    //arguments:  year and orders by registered customers
    groupSpendingsByMonthsOfTheYear(year:string, x:Order[]):number[]
    {
        let yearOrder:Order[] = x.filter(o=>new Date(o.orderDate).getFullYear() === Number(year));
        let yearLength = 12;
        let yearData: number[] = new Array<number>(yearLength).fill(0);
        let months:number[] = []

        for (let i = 0; i < yearLength; i++) {
                  months.push(i)
        }

        if(yearOrder.length !== 0){
            yearOrder.forEach(o=>{
                let month = new Date(o.orderDate).getMonth();
                yearData[month] += o.totalAmount;
   
            })
        }

        return yearData;
    }

    groupTotalCustomersByMonthsOfTheYear(year:string,month:number,c:Customer[]):number[]
    {
        let yearCustomer:Customer[] = c.filter(cut=>new Date(cut.registrationDate).getFullYear() <= Number(year));
        let yearLength = 12;
        let yearData: number[] = new Array<number>(yearLength).fill(0);
        let months:number[] = []

        for (let i = 0; i < yearLength; i++) {
                  months.push(i)
        }

        if(yearCustomer.length !== 0){
            yearCustomer.forEach(c=>{
                let month = new Date(c.registrationDate).getMonth()
                yearData[month]++; 
                    
                
            })
        }
        return yearData;

    }
}