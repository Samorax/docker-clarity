import { Injectable } from "@angular/core";
import { voucher } from "../Models/Voucher";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class voucherService{
    public getVoucherCache:voucher[] = [];
    baseUrl:string = 'https://foodloyaleopenapi.azurewebsites.net/api/vouchers/';

    constructor(private _httpClient: HttpClient){}

    httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
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

      getVouchers(){
        return this._httpClient.get(this.baseUrl,this.httpOptions)
        .pipe(catchError(this.handleError));
      }

      updateVoucher(id:any, v:voucher){
        return this._httpClient.put(this.baseUrl+id,v,this.httpOptions)
        .pipe(catchError(this.handleError))
      }

      addVoucher(v:voucher){
        return this._httpClient.post(this.baseUrl,v,this.httpOptions)
        .pipe(catchError(this.handleError));

      }

      deleteVoucher(id:string){
        return this._httpClient.delete(this.baseUrl+id,this.httpOptions)
        .pipe(catchError(this.handleError));
      }




}