import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { TableSession } from "../Models/Session";
import { AppComponent } from "../app.component";

@Injectable({
    providedIn:"root"
})

export class TableSessionService
{

    constructor(private _httpClient: HttpClient){}
    baseUrl = AppComponent.apiBaseUrl+"/api/tablesessions/";
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

      
    addSession(session:TableSession){
        return this._httpClient.post<TableSession>(this.baseUrl,session)
        .pipe(catchError(this.handleError))
    }

    updateSession(session:TableSession, id:any)
    {
        return this._httpClient.put(this.baseUrl+id, session)
        .pipe(catchError(this.handleError))
    }
    
}

