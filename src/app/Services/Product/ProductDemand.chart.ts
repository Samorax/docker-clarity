import { Injectable } from "@angular/core";
import { Product } from "../../Models/Product";
import { Order } from "../../Models/Order.model";
import { orderDetail } from "../../Models/OrderDetails";
import { arrayBuffer } from "stream/consumers";
import { OverallProductDemandData } from "./OverallProductDemandData.interface";
import { Observable, of } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class productDemandChartService
{
    private calculatePercentageDemand(x:number,y: number): number{
        let totalNumberOfOrders: number =x;
        let totalNumberOfUniqueProduct: number = y;
      
        return (totalNumberOfUniqueProduct/totalNumberOfOrders)*100;
    }


    //
    getMonthlyProductPercentageDemand(o:Order[],p:Product,year:string):number[]
    {
        let yearOrders = o.filter(or=>new Date(or.orderDate).getFullYear() === Number(year) && or.orderStatus === 'Completed');
        let months: number[] = new Array<number>(12).fill(0);
        let monthOrders: number[] = new Array<number>(12).fill(0);
        let pds:number[] = [];

        yearOrders.forEach(yo=>{
            let month = new Date(yo.orderDate).getMonth();
            monthOrders[month]++;

            yo.orderDetails.forEach(od=>{
                months[month] += od.name === p.name?od.quantity:0;
            });
        })

        monthOrders.forEach(mo=>{
            for (let i  = 0; i < months.length; i++) {
                const element = months[i];
                let pd = this.calculatePercentageDemand(mo,element);
                pds.push(pd);
            }
        })

        return pds;
    }

    getDailyProductPercentageDemand(o:Order[],p:Product,month:number,year:string):number[]
    {
        let monthOrders = o.filter(or=>new Date(or.orderDate).getMonth() === month && or.orderStatus === 'Completed' && new Date(or.orderDate).getFullYear() === Number(year));
        let monthLength = new Date(Number(year),month,0).getDate();
        let days:number[] = new Array<number>(monthLength).fill(0)
        let dayOrders:number[] = new Array<number>(monthLength).fill(0);
        let pds:number[] = [];

        monthOrders.forEach(mo=>{
            let day = new Date(mo.orderDate).getDate();
            dayOrders[day-1]++;

            mo.orderDetails.forEach(od=>{
                days[day-1] += od.name === p.name?od.quantity:0;
            });

        });

        dayOrders.forEach(dos=>{
            for (let i  = 0; i < days.length; i++) {
                const element = days[i];
                let pd = this.calculatePercentageDemand(dos,element);
                pds.push(pd);
            }
        })

        return pds;


    }

    getOverallProductPercentageDemand(o:Order[],p:Product[],year:string):Observable<OverallProductDemandData>
    {
        
        let productData:number[] = new Array<number>(p.length).fill(0);
        let qualifiedOrders = o.filter(or=>new Date(or.orderDate).getFullYear() === Number(year) && or.orderStatus === 'Completed')
        let orderData = 0
        let uniqueProductArray:string[] = new Array<string>(p.length);
        let pd:OverallProductDemandData

        for (let n = 0; n < p.length; n++) {
            const element = p[n];
            uniqueProductArray[n] = element.name;
            
            
        };

        for (let i = 0; i < p.length; i++) {
            const element = p[i];
            qualifiedOrders.forEach(qo=>{
                qo.orderDetails.forEach(od=>{
                    orderData += od.quantity
                    if(od.name === element.name){
                        productData[i] += od.quantity;
                    }
                })
            })
            
        };
        console.log(productData,orderData)

        let x = productData.map(pr=> Math.round(this.calculatePercentageDemand(orderData,pr)));

        pd = {productNames:uniqueProductArray,productDemand:x}

        return of(pd);
        
    }

    
}