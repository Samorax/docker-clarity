import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { environment } from "../../environment/environment";
import { FoodIngredients } from "../Models/FoodIngredients";

@Injectable({
    providedIn:'root'
})
export class FIService{

   constructor(private _httpclient: HttpClient) { }
   fiUrl = environment.apiBaseUrl+"api/inventory/foodingredients/";
     
       private handleError(error: HttpErrorResponse) {
         if (error.status === 0) {
           console.error('An error occurred:', error.error);
         } else {
           console.error(
             `Backend returned code ${error.status}, body was: `, error.error);
         }
         return throwError(() => new Error('Something bad happened; please try again later.'));
       }

         getFoodIngredients(){
          return this._httpclient.get(this.fiUrl)
          .pipe(catchError(this.handleError));
         }

         addFoodIngredient(y:any){
          return this._httpclient.post<FoodIngredients>(this.fiUrl,y)
          .pipe(catchError(this.handleError));
         }

            updateFoodIngredient(y:any){
            return this._httpclient.put(this.fiUrl,y)
            .pipe(catchError(this.handleError));
            }

            deleteFoodIngredient(id:any){
            return this._httpclient.delete(this.fiUrl+id)
            }
}