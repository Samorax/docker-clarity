import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { catchError, throwError } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class AccountingService{
    _httpClient = inject(HttpClient);
    _baseUrl = environment.apiBaseUrl+"api/accountingService/";

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          console.error('An error occurred:', error.error);
        } else {
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }

      addAccountingSystem(y:any){
        return this._httpClient.post(this._baseUrl,y)
        .pipe(catchError(this.handleError));
      }
}