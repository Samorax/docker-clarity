import { Component, EventEmitter, Input, Output } from "@angular/core";

import { smsModel } from "../Models/SmsModel";
import { Customer } from "../Models/Customer";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
    templateUrl:'./OrderSms.component.html',
    selector:'order-sms'
})

export class OrderSmsComponent{
    constructor(private _formBuilder: FormBuilder){
        
    }
    
    show: boolean = false;
    @Output()smsForm:EventEmitter<smsModel> = new EventEmitter<smsModel>();
    customer!:Customer
    

    messageForm= this._formBuilder.group({
        message:['',Validators.required]
    })
    


    open(x:Customer){
        this.customer = x;
        this.show = true;
    }
    
    close(){
        this.show = false;
    }

    send(){
        let x:any = this.messageForm.value;
        let customerPN = '+44'+this.customer.phoneNumber.substring(1);
        let sms:smsModel = {Message: x.message, PhoneNumbers:[customerPN], MessageSID:localStorage.getItem('mSID') }
        this.smsForm.emit(sms);
    }
}