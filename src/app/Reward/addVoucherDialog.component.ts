import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { voucher, voucherValueType } from "../Models/Voucher";

@Component({
    templateUrl:'./addVoucherDialog.component.html',
    selector:'add-voucher'
})

export class addVoucherDialogComponent{
    @Input()vouchers:any
    @Output()isOk:EventEmitter<voucher> = new EventEmitter<voucher>();
    show:boolean = false;
    voucher:voucher = new voucher();
    currencySymbol:any  = localStorage.getItem('currency_iso_code');
    appUserId:any = localStorage.getItem("user_id");
    
    


    open(){
      this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(v:NgForm){
        let vc = <voucher>v.value;
        vc.voucherCreationDate = new Date();
        vc.voucherStatus = true;
        vc.voucherExpirationDate = new Date(vc.voucherExpirationDate);
        vc.applicationUserID = this.appUserId;
        this.isOk.emit(vc);
    }
}