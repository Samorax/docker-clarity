import { inject, Injectable } from "@angular/core";
import { Stock } from "../../Models/Stock";
import { stockService } from "./StockService";
import { BehaviorSubject, Observable } from "rxjs";
import { StockVariance } from "./StockVariance.Interface";

@Injectable({
    providedIn:'root'
})

export class StockVarianceService {

   expectedRevenueCalc(stK:Stock){
    return  Math.round(stK.initialUnits * stK.product?.price)
   }

   actualRevenueCalc(stk:Stock){
    let sold = stk.initialUnits - stk.remainingUnits
    return Math.round(sold * stk.product?.price);
   }

   getMonthVariance(year:string, month: number,stocks:Stock[]):Observable<StockVariance>{
        let monthStocks = stocks.filter(s=>new Date(s.stockedDate).getMonth() === month && new Date(s.stockedDate).getFullYear() === Number(year))
        let monthLength = new Date(Number(year),month,0).getDate();
        let monthDataExpRevenue: number[] = new Array<number>(monthLength).fill(0);
        let monthDataActRevenue: number[] = new Array<number>(monthLength).fill(0);
        let days:number[] = []

        for (let i = 0; i < monthLength; i++) {
            days.push(i+1)          
        }

        let result: BehaviorSubject<StockVariance> = new BehaviorSubject<StockVariance>({actualRevenue:[],expectedRevenue:[]});
        if(monthStocks.length !== 0){
            monthStocks.forEach(stk=>{
                let day = new Date(stk.stockedDate).getDate()
                if(days.includes(day)){
                    monthDataExpRevenue[day-1] += this.actualRevenueCalc(stk);
                    monthDataActRevenue[day-1] += this.expectedRevenueCalc(stk);
                  
                }
            })
           
        }
        

        result.next({actualRevenue:monthDataActRevenue,expectedRevenue:monthDataExpRevenue});
        return result.asObservable();
   }

   getYearVariance(year:string,stocks:Stock[]):Observable<StockVariance>{
    let yearLength = 12;
    let yearDataExRevenue: number[] = new Array<number>(yearLength).fill(0);
    let yearActRevenue:number[] = new Array<number>(yearLength).fill(0);

    let result: BehaviorSubject<StockVariance> = new BehaviorSubject<StockVariance>({actualRevenue:[],expectedRevenue:[]});
    let months:number[] = []

  
    let yearStocks = stocks.filter(s=>new Date(s.stockedDate).getFullYear() === Number(year))
    

        if(yearStocks.length !== 0){
    
            yearStocks.forEach(stk=>{
                let month = new Date(stk.stockedDate).getMonth();
                
                yearDataExRevenue[month] += this.expectedRevenueCalc(stk);
                yearActRevenue[month] += this.actualRevenueCalc(stk);
            
            } )
        }
        
        result.next({actualRevenue:yearActRevenue,expectedRevenue:yearDataExRevenue});
        return result.asObservable()

   }

}