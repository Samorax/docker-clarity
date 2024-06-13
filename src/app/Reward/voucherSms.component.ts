import { Component, EventEmitter, Output } from "@angular/core";
import { smsModel } from "../Models/SmsModel";
import { Customer } from "../Models/Customer";
import { FormBuilder, Validators } from "@angular/forms";
import { voucher } from "../Models/Voucher";

@Component({
    templateUrl:'./voucherSms.component.html',
    selector:'voucher-sms'
})

export class VoucherSmsComponent{
    constructor(private _formBuilder:FormBuilder){
        this.msId = localStorage.getItem('mSID')
    }
    msId:any
    @Output()voucherSms:EventEmitter<smsModel> = new EventEmitter<smsModel>()
    show = false
    customers!:Customer[];
    selection:string[] = [];
    voucher!:voucher
    voucherForm= this._formBuilder.group({
        recepients:['',Validators.required],
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
        let m:any = this.voucherForm.value;
        let sms:smsModel;
        if(this.selection[0] == 'All'){
            let pn:string[] = []
            this.customers.forEach(c => pn.push(c.phoneNumber))
            sms = {Message:m.message, MessageSID:this.msId, PhoneNumbers:pn}
        }else{
            let custs:string[] = []
            this.selection.forEach(c=> {
                let s = c.split(" ");
                let customer:any = this.customers.find(u=> u.firstName === s[0] && u.lastName ===s[1])
                custs.push(customer?.phoneNumber);
            })
            sms = {Message:m.message, MessageSID:this.msId, PhoneNumbers:custs}
            
        }
        
        this.voucherSms.emit(sms)

    }
}