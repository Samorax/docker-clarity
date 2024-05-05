import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, retry, throwError } from "rxjs";
import { Product } from "../Models/Product";
import { AppComponent } from "../app.component";

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  productssCache: Product[] = [];
  baseUrl =  AppComponent.apiBaseUrl+'api/products/';

   httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
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

  getProducts() {
    return this._httpclient.get<Product[]>(this.baseUrl).
      pipe(retry(3),catchError(this.handleError));
  }
 
  addProduct(prod: any) {
    return this._httpclient.post<any>(this.baseUrl,prod).
      pipe(catchError(this.handleError));

  }

  updateProduct(Id: any, prod:FormData) {
    return this._httpclient.put(this.baseUrl + Id, prod).
      pipe(catchError(this.handleError));
  }

  removeProduct(Id: any) {
    return this._httpclient.delete(this.baseUrl + Id)
      .pipe(catchError(this.handleError));
  }
}
