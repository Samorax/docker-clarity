import { HttpHeaders, HttpErrorResponse, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError, retry, catchError } from "rxjs";
import { Customer } from "../Models/Customer";

@Injectable({
    providedIn:'root'
})

export class CustomerService{
    customersCache: Customer[] = [];
    constructor(private _httpClient: HttpClient) { }
    baseUrl: string = "https://foodloyale-frontend.azurewebsites.net/api/customers/"
  
    httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        
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
  
  
    getCustomers(){
      return this._httpClient.get<Customer[]>(this.baseUrl).
        pipe(retry(3), catchError(this.handleError));
    }

    removeCustomers(Id: any){
        return this._httpClient.delete(this.baseUrl + Id, this.httpOptions)
        .pipe(catchError(this.handleError));
    }

}