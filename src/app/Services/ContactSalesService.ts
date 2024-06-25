import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { environment } from "../../environment/environment";

@Injectable({
    providedIn:'root'
})

export class ContactSalesService{
    constructor(private _httpClient: HttpClient) { }
    baseUrl: string = environment.apiBaseUrl+"api/contactSales/"
  
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

    contactSales(x:any){
        return this._httpClient.post(this.baseUrl,x)
        .pipe(catchError(this.handleError))
    }
}