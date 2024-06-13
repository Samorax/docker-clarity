import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable, Signal, signal } from "@angular/core";
import { environment } from "../../environment/environment";
import { catchError, throwError } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class testModeService{
constructor(private _httpClient: HttpClient){}
baseUrl = environment.apiBaseUrl+"api/restaurant/testmode/";
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



  setMode(state:any){
    return this._httpClient.get<string>(this.baseUrl+state)
    .pipe(catchError(this.handleError))
  }

}
