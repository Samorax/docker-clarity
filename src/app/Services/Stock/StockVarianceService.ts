import { inject, Injectable } from "@angular/core";
import { Stock } from "../../Models/Stock";
import { stockService } from "./StockService";
import { BehaviorSubject, Observable } from "rxjs";
import { StockVariance } from "./StockVariance.Interface";

@Injectable({
    providedIn:'root'
})

export class StockVarianceService {

   stkSVR = inject(stockService)
   expectedRevenue: number = 0
   actualRevenue: number = 0
   stocks!:Stock[] 

   constructor(){
        this.stkSVR.getStocks().subscribe(r=>{
            this.stocks = r;
        });
   }

   expectedRevenueCalc(stK:Stock){
    return (stK.initialUnits * stK.product?.price)
   }

   actualRevenueCalc(stk:Stock){
    return (<number>stk.soldUnits * stk.product?.price)
   }

   getMonthVariance(year:string, month: number):Observable<StockVariance[]>{
        let monthStocks = this.stocks.filter(s=>new Date(s.stockedDate).getMonth() === month && new Date(s.stockedDate).getFullYear() === Number(year))
        let monthLength = new Date(Number(year),month,0).getDate();
        let monthData: StockVariance[] = new Array<StockVariance>(monthLength).fill({actualRevenue:0,expectedRevenue:0,date:new Date()});
        let days:number[] = []

        for (let i = 0; i < monthLength; i++) {
            days.push(i+1)          
        }

        let result: BehaviorSubject<StockVariance[]> = new BehaviorSubject<StockVariance[]>(monthData);
        if(monthStocks.length !== 0){
            monthStocks.forEach(stk=>{
                let day = new Date(stk.stockedDate).getDate()
                if(days.includes(day)){
                    monthData[day-1] = {actualRevenue: +this.actualRevenueCalc(stk),expectedRevenue:+this.expectedRevenueCalc(stk),date:stk.stockedDate};       
                }
            })
           
        }
        
        result.next(monthData);
        return result.asObservable();
   }

   getYearVariance(year:string):Observable<StockVariance[]>{
    let yearLength = 12;
    let yearData: StockVariance[] = new Array<StockVariance>(yearLength).fill({expectedRevenue:0,actualRevenue:0,date:new Date()});

    let result: BehaviorSubject<StockVariance[]> = new BehaviorSubject<StockVariance[]>(yearData);
    let months:number[] = []

    for (let i = 0; i < yearLength; i++) {
              months.push(i)
    }

    if(this.stocks.length !== 0){

        let yearStocks = this.stocks.filter(s=>new Date(s.stockedDate).getFullYear() === Number(year))
        
        if(yearStocks.length !== 0){
            yearStocks.forEach(stk=>{
                let month = new Date(stk.stockedDate).getMonth();
                if(months.includes(month)){
                    yearData[month] = {actualRevenue: +this.actualRevenueCalc(stk), expectedRevenue: +this.expectedRevenueCalc(stk),date:new Date(stk.stockedDate)};
                }
            })           
            } 
        }
        result.next(yearData);
        return result.asObservable()

   }

}