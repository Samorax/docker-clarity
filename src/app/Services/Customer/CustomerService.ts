import { HttpHeaders, HttpErrorResponse, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError, retry, catchError } from "rxjs";
import { Customer } from "../../Models/Customer";
import { AppComponent } from "../../app.component";
import { environment } from "../../../environment/environment";

@Injectable({
    providedIn:'root'
})

export class CustomerService{
    
    customersCache: Customer[] = [];
    constructor(private _httpClient: HttpClient) { }
    baseUrl: string = environment.apiBaseUrl+"api/customers/"
  
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

    updateCustomer(customerID: any, c: Customer) {
      return this._httpClient.put(this.baseUrl+customerID,c)
        .pipe(retry(3),catchError(this.handleError));
    }

    getCustomer(customerID: any) {
      return this._httpClient.get<Customer>(this.baseUrl+customerID)
      .pipe(retry(3),catchError(this.handleError));
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