import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { PaymentObject } from "../Models/PaymentObject";
import {Reader, Terminal, loadStripeTerminal} from "@stripe/terminal-js";
import { terminalPaymentObject } from "../Models/TerminalPaymentObject";
import { PaymentIntentRequest } from "../Models/PaymentIntentRequest";
import { PaymentIntentResult, loadStripe } from "@stripe/stripe-js";
import { resolve } from "path";

@Injectable({
    providedIn:"root"
})

export class paymentService{
  currencySymbol:any = localStorage.getItem('currency_iso_code');
  apiKey:any = localStorage.getItem('apikey1');
    terminal!: Terminal;
    baseUrl = "http://localhost:5241/api/payment";
    dojoBaseUrl = "http://localhost:5241/api/payment";

    httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      
    };
  paymentIntentId: any;
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

    //on initialization of app. Get connection Token for card reader.

    getConnectionToken(){
      return this._httpclient.get(this.baseUrl+ "/terminal/connectiontoken", this.httpOptions)
      .pipe(catchError(this.handleError));
    };

    createPaymentIntent(y:any){
      return this._httpclient.post(this.baseUrl +"/terminal/paymentIntent",y,this.httpOptions)
      .pipe(catchError(this.handleError));
    };

    capturePayment(Y:PaymentIntentRequest){
      return this._httpclient.post(this.baseUrl +"/terminal/capturePayment",Y, this.httpOptions)
      .pipe(catchError(this.handleError));
    };

    connect2Reader(o:terminalPaymentObject){
      this.discoverReader();
    }

    processPayment(y:terminalPaymentObject): Promise<string>{
      return new Promise((resolve,err)=>{
        let paymentStatus:string ='';
        this.createPaymentIntent(y).subscribe((r:any )=>{ console.log(r);
        this.terminal.setSimulatorConfiguration({testCardNumber: '4000000000009995'});
        this.terminal.collectPaymentMethod(r.client_secret).then((r:any)=>{
          if(r.error){
            err("Something is wrong with Payment Method!!");
          }else{
            this.terminal.processPayment(r.paymentIntent).then((r:any)=>{
              if(r.error){
                err("Payment could not be processed");
              }else if(r.paymentIntent){
                resolve(r.paymentIntent.id);
              }})}})
      });
      })
    };


    async createTerminal(){
      let token:any;
      const stripeTerminal = await loadStripeTerminal();
      let terminal: any = stripeTerminal?.create({
        onFetchConnectionToken: ()=>{
        return new Promise(resolve=>{
          this.getConnectionToken().subscribe((r:any)=>resolve(r.secret))
        });
        }, 
        onUnexpectedReaderDisconnect: ()=>{
          console.log("Reader is not connected!!");
        }});
        this.terminal = terminal;
        /* this.discoverReader().subscribe(r=>{
          this.connectReader(r.reader);
        });  */
    };

    discoverReader(): Promise<any>{
      return new Promise((resolve,err)=>{
        let config = {simulated: true};
        let reader:any
      this.terminal.discoverReaders(config).then((r:any) => {
        if(r.error){
          err(r.error);
        }else if(r.discoveredReaders.length === 0){
           err("No readers found")     
        }else{
          reader = r.discoveredReaders[0];
          resolve(reader);
        }});
        
    })
  };

    connectReader(y:any):Promise<string>{
      return new Promise ((resolve,err)=>{
        let connectionStatus:string ='';
        this.terminal.connectReader(y).then((connectResult:any) => {
        if (connectResult.error) {
           connectionStatus ='Failed to connect: '+ connectResult.error;
        } else {
            connectionStatus = 'Connected to reader: '+ connectResult.reader.label;
        }
        resolve(connectionStatus);
      })})
    };

    createDojoPaymentIntent(x: PaymentObject){
      return this._httpclient.post(this.dojoBaseUrl+ `/paymentintent`,x)
      .pipe(catchError(this.handleError));
    }

    chargeDojoPayment(paymentIntentToken:string){
      return this._httpclient.get(this.dojoBaseUrl+`/charge/${paymentIntentToken}`)
      .pipe(catchError(this.handleError));
    }

    //online payment service
    createOnlineIntent(y:any){
      return this._httpclient.post(this.baseUrl+ "/paymentintent",y, this.httpOptions)
      .pipe(catchError(this.handleError));
    }

    captureOnlinePayment(y:any){
      return this._httpclient.post(this.baseUrl+"/capturepayment",y, this.httpOptions)
      .pipe(catchError(this.handleError));
    }

    processOnlinePayment(g:any, cardToken: string){
     return new Promise(async (resolve)=>{
      console.log(cardToken);
      let stripe = await loadStripe(this.apiKey);
     stripe?.confirmCardPayment(g.client_secret,
      {payment_method: 
        {card: 
          {token: cardToken,}
        },
      }).then((r:PaymentIntentResult)=>{
        if(r.error){
          console.log(r.error);
        }else{
          resolve(r.paymentIntent)
        }
      })});
    };


}


