import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subscription, catchError, retry, throwError } from "rxjs";
import { Order } from "../Models/Order.model";

@Injectable({
  providedIn:"root"
})
export class OrderService {
  ordersCache: Order[] = [];
  constructor(private _httpClient: HttpClient) { }
  baseUrl: string = "http://localhost:5241/api/orders/"

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



  getOrders(){
    return this._httpClient.get<Order[]>(this.baseUrl).
      pipe(retry(3), catchError(this.handleError));
  }

  addOrder(odr:Order) {
    return this._httpClient.post<any>(this.baseUrl, odr, this.httpOptions).
      pipe(catchError(this.handleError));
  }

  updateOrder(Id: any, oder: Order) {
    return this._httpClient.put(this.baseUrl + Id, oder, this.httpOptions).
      pipe(catchError(this.handleError));
  }

}