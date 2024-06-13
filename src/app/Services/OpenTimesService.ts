import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { catchError, throwError } from "rxjs";
import { OpenTimes } from "../Models/OpenTimes";

@Injectable({
    providedIn:'root'
})

export class openTimesService{

    constructor(private _httpClient: HttpClient) { }
    baseUrl: string = environment.apiBaseUrl+"api/openingtimes/"
  
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

    addOpenTime(x:any){
        return this._httpClient.post(this.baseUrl,x)
        .pipe(catchError(this.handleError))
    }

    getOpenTime(){
        return this._httpClient.get(this.baseUrl)
        .pipe(catchError(this.handleError))
    }

    updateOpenTime(o:OpenTimes){
      return this._httpClient.put(this.baseUrl+o.id,o)
      .pipe(catchError(this.handleError))
    }

    deleteOpenTime(o:OpenTimes){
      return this._httpClient.delete(this.baseUrl+o.id)
      .pipe(catchError(this.handleError))
    }
}