import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environment/environment";
import { catchError, Observable, throwError } from "rxjs";
import { Stock } from "../../Models/Stock";

@Injectable({
    providedIn:'root'
})

export class stockService
{
    constructor(private _httpClient: HttpClient){}
    baseUrl = environment.apiBaseUrl+"api/inventory/stock/"


    
    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          console.error('An error occurred:', error.error);
        } else {
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }

      getStocks():Observable<Stock[]>{
        return this._httpClient.get<Stock[]>(this.baseUrl).pipe(catchError(this.handleError))
      }

      addStock(s:Stock){
        return this._httpClient.post<Stock>(this.baseUrl,s).pipe(catchError(this.handleError))
      }

      updateStock(x:number,s:Stock){
        return this._httpClient.put(this.baseUrl+x,s).pipe(catchError(this.handleError))
      }

      deleteStock(x:number){
        return this._httpClient.delete(this.baseUrl+x).pipe(catchError(this.handleError))
      }
}