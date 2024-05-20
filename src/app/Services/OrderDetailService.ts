import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { orderDetail } from "../Models/OrderDetails";
import { AppComponent } from "../app.component";
import { environment } from "../../environment/environment";

@Injectable({
    providedIn:'root'
})

export class OrderDetailService {
    constructor(private _httpClient: HttpClient) {
    }

    baseUrl:string = environment.apiBaseUrl+"api/orderDetails/"

    httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
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

      addOrderDetail(x:orderDetail){
        return this._httpClient.post<orderDetail>(this.baseUrl,x)
        .pipe(catchError(this.handleError));
      }

      updateOrderDetail(x:orderDetail, id:any){
        return this._httpClient.put(this.baseUrl+id,x)
        .pipe(catchError(this.handleError));
      }

      removeOrderDetail(id:any){
        return this._httpClient.delete(this.baseUrl+id)
        .pipe(catchError(this.handleError));
      }


}