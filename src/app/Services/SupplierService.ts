import { inject, Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class SupplierService{
    supUrl = environment.apiBaseUrl+"api/inventory/suppliers/";
    _httpclient = inject(HttpClient);

     private handleError(error: HttpErrorResponse) {
             if (error.status === 0) {
               console.error('An error occurred:', error.error);
             } else {
               console.error(
                 `Backend returned code ${error.status}, body was: `, error.error);
             }
             return throwError(() => new Error('Something bad happened; please try again later.'));
           }
    
    getsuppliers(){
        return this._httpclient.get(this.supUrl)
        .pipe(catchError(this.handleError));
    }

    addSupplier(y:any){
        return this._httpclient.post(this.supUrl,y)
        .pipe(catchError(this.handleError));
    }

    updateSupplier(y:any){
        return this._httpclient.put(this.supUrl,y)
        .pipe(catchError(this.handleError));
    }

    deleteSupplier(id:any){
        return this._httpclient.delete(this.supUrl+id)
        .pipe(catchError(this.handleError));
    }
}