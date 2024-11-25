import { Injectable } from "@angular/core";
import { Order } from "../../Models/Order.model";
import { daySales } from "./DaySales.Interface";

@Injectable({
    providedIn:'root'
})

export class monthlySalesChart{

    getMonthlySales(o:Order[], year:string):number[]
    {
        let yearOrder:Order[] = o.filter(or=>new Date(or.orderDate).getFullYear() === Number(year) && or.orderStatus === "Completed");
        let yearLength = 12;
        let monthsData: number[] = [yearLength]

        for (let i = 0; i < yearLength; i++) {

            monthsData[i] = i > 0 ? 0 : i;
            
        }

        yearOrder.forEach(o=>{
            let month = new Date(o.orderDate).getMonth();
            monthsData[month] += o.totalAmount;
        })
        
        let yearSale = monthsData.reduce((x,y)=>x+y,0);
        return monthsData.map(i=>Math.round((i/yearSale)*100));
    }

    getDaySales(o:Order[], month:number, year:string):number[]
    {
        let monthOrder:Order[] = o.filter(or=>new Date(or.orderDate).getMonth() === month && or.orderStatus === 'Completed' && new Date(or.orderDate).getFullYear() === Number(year));
        let monthLength = new Date(Number(year),month,0).getDate();
        let daySalesData:number[] = new Array<number>(monthLength).fill(0);
        

        monthOrder.forEach(od=>{
            let day = new Date(od.orderDate).getDate();
            
            daySalesData[day - 1] += od.totalAmount;
        })

        
        let sumAllDaySale = daySalesData.reduce((x,y)=>x+y,0);
        return daySalesData.map(i=>Math.round((i/sumAllDaySale)*100))

    }
}