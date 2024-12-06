import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { CartItem } from "../../Models/CartItem";
import { CartOrder } from "../../Models/CartOder";
import { environment } from "../../../environment/environment";

@Injectable({
    providedIn:'root'
})

export class OrderCartService{
    
    _httpClient = inject(HttpClient);
    baseUrl:string = environment.apiBaseUrl+"api/cartorders/"

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

      getCartOrders(){
        return this._httpClient.get<CartOrder[]>(this.baseUrl)
        .pipe(catchError(this.handleError));
      }

      addCartOrder(c:CartOrder){
        return this._httpClient.post<CartOrder>(this.baseUrl,c)
        .pipe(catchError(this.handleError))
      }

      updateCartOrder(c: CartOrder) {
        return this._httpClient.put(this.baseUrl+c.recordId,c)
        .pipe(catchError(this.handleError))
    }

      deleteCartOrder(id:any,){
        return this._httpClient.delete(this.baseUrl+id)
        .pipe(catchError(this.handleError))
      }
}