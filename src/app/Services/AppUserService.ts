import { Injectable } from "@angular/core";
import { RegisterCredentials } from "../Models/RegisterCredentials";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class appUserService{
    constructor(private _httpClient: HttpClient){}
    baseUrl:string = "http://localhost:5241/api/AppUser/";

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          console.error('An error occurred:', error.error);
        } else {
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }

    getAppUserInfo(){
        return this._httpClient.get(this.baseUrl)
        .pipe(catchError(this.handleError))
    }
      
    updateAppUserInfo(id:string,appUser: RegisterCredentials){
        return this._httpClient.put(this.baseUrl+id, appUser)
        .pipe(catchError(this.handleError))
    }
}