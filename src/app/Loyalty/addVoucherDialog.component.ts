import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, NgForm, Validators } from "@angular/forms";
import { voucher, voucherValueType } from "../Models/Voucher";
import { error } from "console";
import { ClrLoadingState } from "@clr/angular";

@Component({
    templateUrl:'./addVoucherDialog.component.html',
    selector:'add-voucher'
})

export class addVoucherDialogComponent{
    constructor(private _formBuilder:FormBuilder){}
    @Input()vouchers:any
    @Output()isOk:EventEmitter<any> = new EventEmitter<any>();
    show:boolean = false;
    voucher:voucher = new voucher();
    currencySymbol:any  = localStorage.getItem('currency_iso_code');
    appUserId:any = localStorage.getItem("user_id");
    addButtonActivity:ClrLoadingState = ClrLoadingState.DEFAULT

    voucherForm = this._formBuilder.group({
        voucherName:['',Validators.required],
        valueType:['',Validators.required],
        keyword:[''],
        units:['',Validators.required],
        voucherExpirationDate:['',Validators.required],
        voucherActivation:['',Validators.required],
        voucherCreditAmount:['',Validators.required]
    })
    


    open(){
      this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(){
        
        let vc:any = this.voucherForm.value;
        vc.voucherCreationDate = new Date();
        vc.voucherExpirationDate = new Date(vc.voucherExpirationDate);
        vc.applicationUserID = this.appUserId;
        console.log(vc);
        try {
            this.isOk.emit(vc);
        } catch (error) {
            console.log(error)
        }
    
    }
}