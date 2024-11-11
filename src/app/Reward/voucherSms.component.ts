import { Component, EventEmitter, Output } from "@angular/core";
import { smsModel } from "../Models/SmsModel";
import { Customer } from "../Models/Customer";
import { FormBuilder, Validators } from "@angular/forms";
import { voucher } from "../Models/Voucher";
import { ClrLoadingState } from "@clr/angular";

@Component({
    templateUrl:'./voucherSms.component.html',
    selector:'voucher-sms'
})

export class VoucherSmsComponent{
AllSelection: string = 'All';
    constructor(private _formBuilder:FormBuilder){
        this.msId = localStorage.getItem('mSID')
    }
    msId:any
    @Output()voucherSms:EventEmitter<smsModel> = new EventEmitter<smsModel>()
    show = false
    customers!:Customer[];
    selection:string[] = [];
    phoneCode:string = '+44'
    voucher!:voucher
    sendButtonActivity:ClrLoadingState = ClrLoadingState.DEFAULT

    voucherForm= this._formBuilder.group({
        recepients:[[],Validators.required],
        message:['',Validators.required]
    })

    open(y:voucher,x:Customer[]){
        this.customers = x;
        this.voucher = y;
        this.show = true
    }

    close(){
        this.show = false;
    }

    

    send(){
        this.sendButtonActivity = ClrLoadingState.LOADING

        let m:any = this.voucherForm.value;
        let sms:smsModel;
        let selection:any = this.voucherForm.value.recepients
        if(selection[0] == 'All'){
            let pn:string[] = []
            this.customers.forEach(c => pn.push(this.phoneCode+c.phoneNumber.substring(1)))
            sms = {Message:m.message, MessageSID:this.msId, PhoneNumbers:pn}
            console.log(sms)
        }else{
            let custs:string[] = []
            selection.forEach((c:any)=> {
                let s = c.split(" ");
                let customer:any = this.customers.find(u=> u.firstName === s[0] && u.lastName ===s[1])
                custs.push(this.phoneCode+customer?.phoneNumber.substring(1));
                console.log(custs)
            })
            sms = {Message:m.message, MessageSID:this.msId, PhoneNumbers:custs}
            
        }
        
        this.voucherSms.emit(sms)

    }
}