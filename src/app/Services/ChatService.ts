import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, retry, throwError } from "rxjs";
import { environment } from "../../environment/environment";

@Injectable({
    providedIn:'root'
})

export class chatService {
    _httpClient = inject(HttpClient)
    baseUrl = environment.apiBaseUrl+ "api/manageraiagent"

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
    sendMessage(x:any):Observable<any>{
        return this._httpClient.post(this.baseUrl,x,this.httpOptions)
        .pipe(retry(3),catchError(this.handleError))
    }
}