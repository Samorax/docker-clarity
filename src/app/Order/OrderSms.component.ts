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
        this.msId = localStorage.getItem('mSID');
    }
    show: boolean = false;
    @Output()smsForm:EventEmitter<smsModel> = new EventEmitter<smsModel>();
    customer!:Customer
    msId:any
    

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
        let sms:smsModel = {Message: x.message, PhoneNumbers:[this.customer.phoneNumber], MessageSID:this.msId }
        this.smsForm.emit(sms);
    }
}