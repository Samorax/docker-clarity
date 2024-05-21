import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, of, retry, throwError } from "rxjs";
import { tap, window } from "rxjs/operators";
import { loginCredentials } from "../Models/LoginCredentials";
import { RegisterCredentials } from "../Models/RegisterCredentials";
import { TokenObject } from "../Models/TokenObject";
import { Token } from "@angular/compiler";
import { ProductService } from "./ProductService";
import { OrderService } from "./OrderService";
import { CustomerService } from "./CustomerService";
import moment from "moment";
import { json } from "stream/consumers";
import { AppComponent } from "../app.component";
import { environment } from "../../environment/environment";
import { unsubscribe } from "diagnostics_channel";

@Injectable({
  providedIn: "root"
})

export class AuthenticationService {
  baseUrl:string = environment.apiBaseUrl+"api/"

  constructor(private _httpClient: HttpClient,
     private _pService: ProductService, private _oService: OrderService, private _cService: CustomerService) { }

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
    return throwError(() => new Error(error.error));
  }

  logIn(credentials: loginCredentials) {
    
    return this._httpClient.post<TokenObject>(this.baseUrl + "login", credentials)
      .pipe(tap(this.setSession), catchError(this.handleError));
  }
  setSession(tokenObject: TokenObject) {
    
    let d = new Date(tokenObject.expiry_date);
    const expiresAt = moment().add(d.getUTCHours(), "hour");
  
    localStorage.setItem("access_token", tokenObject.access_token);
    localStorage.setItem("user_id", tokenObject.user_id);
    localStorage.setItem("expiry_date", JSON.stringify(expiresAt.valueOf()));
    localStorage.setItem("currency_iso_code", tokenObject.currency_iso_code);
    localStorage.setItem("apikey1", tokenObject.api_key_1);
    localStorage.setItem("mSID",tokenObject.MessagingSID);
    localStorage.setItem("vatCharge",tokenObject.vatCharge);
    localStorage.setItem("serviceCharge",tokenObject.serviceCharge);
      
    }

  register(credentials:RegisterCredentials) {
    return this._httpClient.post(this.baseUrl + "register", credentials)
    .pipe(catchError(x => this.handleError(x)))
  }

  //Delete Access_Token to prevent unauthorised users.
  //Empty Caches to prevent previous authenticated user's data showing for another user.
  logOut() {
    return new Observable(()=>
    {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("expiry_date");
      localStorage.removeItem("currency_iso_code");
      localStorage.removeItem("apikey1");
      localStorage.removeItem("mSID");

      location.reload()
      
  });
  }

  isLoggedOut(){
    return !this.isAuthenticated();
  }

  isAuthenticated():boolean
  {

    return moment().isBefore(this.getExpiration());

  }

  getExpiration() {
        const expiration = localStorage.getItem("expiry_date") as string;
        const expiresAt = JSON.parse(expiration);
        return moment(expiresAt);

    }    
}
