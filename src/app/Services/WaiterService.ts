import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { Waiter } from "../Models/Waiter";

@Injectable({
    providedIn:"root"
})

export class WaiterService{
    constructor(private _httpClient:HttpClient){}
    baseUrl = "http://localhost:5241/api/waiters/";
    httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        }),
        
      };
      
      
    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          console.error('An error occurred:', error.error);
        } else {
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }

    getWaiters(){
        return this._httpClient.get(this.baseUrl).
        pipe(catchError(this.handleError))
    }

    addWaiter(waiter: Waiter){
        return this._httpClient.post(this.baseUrl,waiter)
        .pipe(catchError(this.handleError))
    }

    updateWaiter(waiter:Waiter, id:any){
        return this._httpClient.put(this.baseUrl+id,waiter)
        .pipe(catchError(this.handleError))
    }
}