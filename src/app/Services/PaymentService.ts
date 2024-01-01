import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { PaymentObject } from "../Models/PaymentObject";
import {Terminal, loadStripeTerminal} from "@stripe/terminal-js";
import { terminalPaymentObject } from "../Models/TerminalPaymentObject";
import { PaymentIntentRequest } from "../Models/PaymentIntentRequest";
import { PaymentIntentResult, loadStripe } from "@stripe/stripe-js";

@Injectable({
    providedIn:"root"
})

export class paymentService{
  apiKey:string = "pk_test_51ODaLPF8K9SuxQBZrG92Ky72BznTAU0muIj0ZjaUXYrKBwMa9ZutGVVChc0UJX9MjfLLtU9oCN71iqf9NsRiFuOh002xGDndvw";
    terminal!: Terminal;
    baseUrl = "http://localhost:5241/api/payment";

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
      this.discoverReader(o);
    }

    processPayment(y:terminalPaymentObject): Promise<string>{
      return new Promise(resolve=>{
        this.createPaymentIntent(y).subscribe((r:any )=>{ console.log(r);
        this.terminal.setSimulatorConfiguration({testCardNumber: '4000000000009995'});
        this.terminal.collectPaymentMethod(r.client_secret).then((r:any)=>{
          if(r.error){
            console.log("Something is wrong with Payment Method!!")
          }else{
            this.terminal.processPayment(r.paymentIntent).then((r:any)=>{
              if(r.error){
                console.log("Payment could not be processed");
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

    discoverReader(o:terminalPaymentObject ){
      let config = {simulated: true};
      
      this.terminal.discoverReaders(config).then((r:any) => {
        if(r.error){
          console.log(r.error);
        }else if(r.discoveredReaders.length === 0){
           console.log("No readers found")     
        }else{
          const reader = r.discoveredReaders[0];
          this.connectReader(reader,o)
        }});
    };

    connectReader(y:any,o:terminalPaymentObject ){
      this.terminal.connectReader(y).then((connectResult:any) => {
        if (connectResult.error) {
          console.log('Failed to connect: ', connectResult.error);
        } else {
            console.log('Connected to reader: ', connectResult.reader.label);
            this.processPayment(o).then(g=>{
              console.log(g);
              let p: PaymentIntentRequest = {PaymentIntentId : g};
              this.capturePayment(p).subscribe((r:any)=> {
                if(r.status === "succeeded"){
                  console.log(r.status)
                }else{
                  console.log("payment is uncaptured");
                }
              });
            })
        }
      })
    };

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
      console.log(cardToken);
     return new Promise(async (resolve)=>{
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


