import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { AppComponent } from "../app.component";

@Injectable({
    providedIn:'root'
})

export class apiKeyRequestService{
    constructor(private _httpClient: HttpClient){

    }
    baseUrl:string = AppComponent.apiBaseUrl+"api/apikeygenerator"

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          console.error('An error occurred:', error.error);
        } else {
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }

    getApiKey(){
        return this._httpClient.get(this.baseUrl).pipe(catchError(this.handleError))
    }
}