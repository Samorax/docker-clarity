import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class ContactService{
    constructor(private _httpClient: HttpClient){}
    baseUrl = environment.apiBaseUrl+"api/contact/"

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          console.error('An error occurred:', error.error);
        } else {
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }

    sendSalesContactForm(x:any){
        return this._httpClient.post(this.baseUrl+"salescontact",x)
        .pipe(catchError(this.handleError));
    }

    sendPartnershipForm(v:any){
        return this._httpClient.post(this.baseUrl+"partnercontact",v)
        .pipe(catchError(this.handleError));
    }
}