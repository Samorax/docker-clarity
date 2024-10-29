import { inject, Injectable } from "@angular/core";
import { Stock } from "../../Models/Stock";
import { stockService } from "./StockService";
import { BehaviorSubject, Observable, of } from "rxjs";
import { AttributeData, MonthData, YearData } from "./YearData.model";

@Injectable({
    providedIn:'root'
})

export class StockWasteService{
    stockService = inject(stockService)
    wasteStock!:Stock[]

    constructor(){
        this.getWasteStock();
    }

    getWasteStock(){
        this.stockService.getStocks().subscribe(stk=>{
            this.wasteStock = stk.filter(s=>s.hasWaste === true);
        })
    }

    getMonthWasteStock(year:string, month:number):Observable<MonthData>{
        let monthLength = new Date(Number(year),month,0).getDate();
        let monthData: MonthData = {data: new Array<AttributeData>(monthLength).fill({stockQuanity:0,stockValue:0})}
        let result: BehaviorSubject<MonthData> = new BehaviorSubject<MonthData>(monthData);
        let days:number[] = []

        for (let i = 0; i < monthLength; i++) {
            days.push(i+1)          
        }

        if(this.wasteStock.length !== 0){
            let monthWasteStock = this.wasteStock.filter(s=>new Date(s.stockedDate).getFullYear().toString() === year && new Date(s.stockedDate).getMonth() === month);
            if(monthWasteStock.length !== 0){
                monthWasteStock.forEach(stk=>{
                    let day = new Date(stk.stockedDate).getDate()
                    if(days.includes(day)){
                        monthData.data[day-1] = {stockQuanity: +stk.remainingUnits, stockValue: +stk.product?.price * stk.remainingUnits};
                        
                    } 
                })
                
            } 
        }

        result.next(monthData);
        return result.asObservable();
    }

    getYearWasteStock(year:string):Observable<YearData>{
        let yearWasteStock = this.wasteStock.filter(s=>new Date(s.stockedDate).getFullYear().toString() === year);
        let yearData: YearData = {
            jan:{stockQuanity:0,stockValue:0},
            feb:{stockQuanity:0,stockValue:0},
            mar:{stockQuanity:0,stockValue:0},
            apr:{stockQuanity:0,stockValue:0},
            may:{stockQuanity:0,stockValue:0},
            jun:{stockQuanity:0,stockValue:0},
            jul:{stockQuanity:0,stockValue:0},
            aug:{stockQuanity:0,stockValue:0},
            sept:{stockQuanity:0,stockValue:0},
            oct:{stockQuanity:0,stockValue:0},
            nov:{stockQuanity:0,stockValue:0},
            dec:{stockQuanity:0,stockValue:0}
        };
        let result:BehaviorSubject<YearData> = new BehaviorSubject<YearData>(yearData);
   
    
        if(this.wasteStock.length !== 0){
            if(yearWasteStock.length !== 0){
                yearWasteStock.forEach(stk=> {
                    switch (new Date(stk.stockedDate).getMonth()) {
                        case 0:
                            yearData.jan.stockValue += stk.remainingUnits * stk.product?.price
                            break;
                        case 1:
                            yearData.feb.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        case 2:
                            yearData.mar.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        case 3:
                            yearData.apr.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        case 4:
                            yearData.may.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        case 5:
                            yearData.jun.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        case 6:
                            yearData.jul.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        case 7:
                            yearData.aug.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        case 8:
                            yearData.sept.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        case 9:
                            yearData.oct.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        case 10:
                            yearData.nov.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        case 11:
                            yearData.dec.stockValue += stk.remainingUnits * stk.product?.price;
                            break;
                        default:
                            break;
                    }
                });
        }
        
    }
        result.next(yearData); 
        return result.asObservable();
}


}