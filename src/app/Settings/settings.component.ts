import { Component, OnInit } from "@angular/core";
import { paymentProcessor } from "../Models/PaymentProcessor";
import { NgForm } from "@angular/forms";
import { appUserService } from "../Services/AppUserService";
import { RegisterCredentials } from "../Models/RegisterCredentials";
import { paymentService } from "../Services/PaymentService";
import { apiKeyRequestService } from "../Services/ApiKeyRequestService";

@Component({
    templateUrl:'./settings.component.html',
    selector:'app-settings'
})
export class SettingsComponent implements OnInit{
    paymentProvider:paymentProcessor = new paymentProcessor();
    appUserId:any = localStorage.getItem("user_id");
    appUser!:any;
    feedBack!:string
    showSpinner:boolean = false;
    showFeeback:boolean = false;
    apiKey!:any;
    showKey: boolean = false;
constructor(private _appUserSrv: appUserService, 
    private _paymentSvr:paymentService, private _apiKeySvr: apiKeyRequestService){}

    ngOnInit(): void {
        this._appUserSrv.getAppUserInfo()
          .subscribe((r: any) => {
            this.appUser = r;
            if(this.appUser.paymentProcessor !== null){
                this.paymentProvider = this.appUser.paymentProcessor;
                }});
    }

    
    showStripeForms:boolean = false;
    showDojoForms:boolean = false;
    showAdyenForms:boolean = false;
    
    onSubmit(x:NgForm){
        this.showSpinner = true;
        let pp = <paymentProcessor>x.value;
        pp.apiKey1 = this.paymentProvider.apiKey1
        pp.apiKey2 = this.paymentProvider.apiKey2;
        pp.accountId = this.paymentProvider.accountId;
        pp.softwareHouseId = this.paymentProvider.softwareHouseId;
        pp.name = this.paymentProvider.name;
        pp.applicationUserID = this.appUserId;
        if(this.appUser !== undefined){
            this.appUser.paymentProcessor =  pp;
      }
       
        localStorage.setItem('apiKey1', this.appUser.paymentProcessor?.apiKey1 as string);
       
        this._appUserSrv.updateAppUserInfo(this.appUserId, this.appUser)
        .subscribe(
            (r:any)=>{ this.feedBack = r; /*this._paymentSvr.createTerminal*/},
            (err:any)=> console.log(err),
            ()=> {
                this.showStripeForms = false;
                 this.showFeeback = true;
                 this.showSpinner = false;
                });
    }

    onChange(x:string){
        if(x ==='Stripe'){
            this.showStripeForms = true;
            this.showAdyenForms = false;
            this.showDojoForms = false;
        }else if(x === 'Dojo'){
            this.showDojoForms = true;
            this.showAdyenForms = false;
            this.showStripeForms = false;
        }else if(x ==='Adyen'){
            this.showAdyenForms = true;
            this.showStripeForms = false;
            this.showDojoForms = false;
        }else{
            this.showAdyenForms = false;
            this.showStripeForms = false;
            this.showDojoForms = false;
        }
    }

    onApiRequest(){
        this._apiKeySvr.getApiKey().subscribe(k=>{
            this.apiKey = k;
            this.showKey = true;
        },(er)=>console.log(er))
    }
}