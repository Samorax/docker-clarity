import { Component, EventEmitter, Output } from "@angular/core";
import { smsModel } from "../Models/SmsModel";
import { Customer } from "../Models/Customer";
import { FormBuilder, Validators } from "@angular/forms";
import { voucher } from "../Models/Voucher";
import { ClrLoadingState } from "@clr/angular";
import { BehaviorSubject } from "rxjs";
import { Rewards } from "../Models/Rewards";

@Component({
    templateUrl:'./rewardSms.component.html',
    selector:'reward-sms'
})

export class RewardSmsComponent{
AllSelection: string = 'All';
    constructor(private _formBuilder:FormBuilder){
        this.msId = localStorage.getItem('mSID')
    }
    msId:any
    @Output()rewardSms:EventEmitter<smsModel> = new EventEmitter<smsModel>()
    show = false
    customers!:BehaviorSubject<any>;
    selection:string[] = [];
    phoneCode:string = '+44'
    reward!:any
    sendButtonActivity:ClrLoadingState = ClrLoadingState.DEFAULT

    rewardForm= this._formBuilder.group({
        recepients:[[],Validators.required],
        message:['',Validators.required]
    })

    open(x:BehaviorSubject<Customer[]>,y?:Rewards){
        this.customers =  x;
        this.reward = y;
        this.show = true
    }

    close(){
        this.show = false;
    }

    

    send(){
        this.sendButtonActivity = ClrLoadingState.LOADING

        let m:any = this.rewardForm.value;
        let sms:smsModel;
        let selection:any = this.rewardForm.value.recepients
        if(selection[0] == 'All'){
            let pn:string[] = []
            this.customers.getValue().forEach((c:Customer) => pn.push(this.phoneCode+c.phoneNumber.substring(1)))
            sms = {Message:m.message, MessageSID:this.msId, PhoneNumbers:pn}
        
        }else{
            let custs:string[] = []
            selection.forEach((c:any)=> {
                let s = c.split(" ");
                let customer:any = this.customers.getValue().find((u:Customer)=> u.firstName === s[0] && u.lastName ===s[1])
                custs.push(this.phoneCode+customer?.phoneNumber.substring(1));
                
            })
            sms = {Message:m.message, MessageSID:this.msId, PhoneNumbers:custs}
            
        }
        
        this.rewardSms.emit(sms)

    }
}