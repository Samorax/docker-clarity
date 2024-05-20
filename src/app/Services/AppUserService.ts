import { Injectable } from "@angular/core";
import { RegisterCredentials } from "../Models/RegisterCredentials";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, shareReplay, throwError } from "rxjs";
import { AppComponent } from "../app.component";
import { appUser } from "../Models/AppUser";

@Injectable({
    providedIn:'root'
})
export class appUserService{
    constructor(private _httpClient: HttpClient){}
    baseUrl = AppComponent.apiBaseUrl+"api/Restaurant/";

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
        return this._httpClient.get<appUser>(this.baseUrl)
        .pipe(catchError(this.handleError),shareReplay(1))
    }
      
    updateAppUserInfo(id:string,appUser: appUser){
        return this._httpClient.put(this.baseUrl+id, appUser)
        .pipe(catchError(this.handleError))
    }
}