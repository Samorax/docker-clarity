import { HttpHeaders, HttpErrorResponse, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { catchError, throwError } from "rxjs";
import { Table } from "../Models/Table";
import { AppComponent } from "../app.component";

@Injectable({
    providedIn:"root"
})

export class TableService{
    constructor(private _httpClient:HttpClient){}
    baseUrl = AppComponent.apiBaseUrl+"/api/tables/";
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

    addTable(table: Table){
        return this._httpClient.post(this.baseUrl,table)
        .pipe(catchError(this.handleError))
    }

    updateTable(table:Table, id:any){
        return this._httpClient.put(this.baseUrl+id,table)
        .pipe(catchError(this.handleError))
    }

    deleteTable(table:Table){
      return this._httpClient.delete(this.baseUrl+table.id)
      .pipe(catchError(this.handleError));
    }

    getTables(){
        return this._httpClient.get(this.baseUrl)
        .pipe(catchError(this.handleError))
    }
}