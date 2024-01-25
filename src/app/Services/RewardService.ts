import { HttpHeaders, HttpErrorResponse, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { catchError, throwError } from "rxjs";
import { Rewards } from "../Models/Rewards";

@Injectable({
    providedIn:'root'
})

export class RewardService
{
    rewardsCache: Rewards[] = [];
    baseUrl = "https://foodloyale-frontend.azurewebsites.net/api/rewards/";
  
     httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      
    };  
    constructor(private _httpclient: HttpClient) {
  
    }
  
    private handleError(error: HttpErrorResponse) {
      if (error.status === 0) {
        console.error('An error occurred:', error.error);
      } else {
        console.error(
          `Backend returned code ${error.status}, body was: `, error.error);
      }
      return throwError(() => new Error('Something bad happened; please try again later.'));
    }

    getRewards(){
        return this._httpclient.get<Rewards[]>(this.baseUrl)
        .pipe(catchError(this.handleError));
    }

    addRewards(r:Rewards){
        return this._httpclient.post(this.baseUrl,r)
        .pipe(catchError(this.handleError));
    }

    updateRewards(id:any,r:Rewards)
    {
        return this._httpclient.put(this.baseUrl+id,r)
        .pipe(catchError(this.handleError));
    }

    deleteRewards(id:any)
    {
        return this._httpclient.delete(this.baseUrl+id)
        .pipe(catchError(this.handleError))
    }


}