import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { smsModel } from "../Models/SmsModel";
import { AppComponent } from "../app.component";

@Injectable({
    providedIn:"root"
})

export class SmsService {
    constructor(private _httpClient:HttpClient){}
    baseUrl = AppComponent.apiBaseUrl+"/api/sms/";
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

      sendMessage(message: smsModel){
        return this._httpClient.post(this.baseUrl,message)
        .pipe(catchError(this.handleError))
      }
   
}