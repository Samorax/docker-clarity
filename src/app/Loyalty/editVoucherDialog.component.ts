import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { voucher } from "../Models/Voucher";
import { FormBuilder, NgForm, Validators } from "@angular/forms";
import { paymentService } from "../Services/PaymentService";

@Component({
    selector:'edit-voucher',
    templateUrl:'./editVoucherDialog.component.html'
})

export class editVoucherDialogComponent implements OnInit{
    constructor(private _paySvr:paymentService,private _formBuilder:FormBuilder){
    }
    ngOnInit(): void {
        
        this.currencySymbol = this._paySvr.currencySymbol;
    }

    @Input() voucher!:voucher
    @Output() isOk: EventEmitter<voucher> = new EventEmitter<voucher>()
    show:boolean = false;
    currencySymbol:any

    voucherForm = this._formBuilder.group({
        voucherName:['',Validators.required],
        valueType:['',Validators.required],
        units:['',Validators.required],
        voucherExpirationDate:['',Validators.required],
        voucherActivation:['',Validators.required],
        voucherCreditAmount:['',Validators.required],
        voucherNumber:['']
    })

    open(){
        this.voucherForm.get('voucherName')?.setValue(this.voucher.voucherName)
        this.voucherForm.get('units')?.setValue(this.voucher.units.toString())
        this.voucherForm.get('voucherExpirationDate')?.setValue(this.voucher.voucherExpirationDate)
        this.voucherForm.get('voucherActivation')?.setValue(this.voucher.voucherActivation)
        this.voucherForm.get('voucherNumber')?.disable()
        this.voucherForm.get('voucherNumber')?.setValue(this.voucher.voucherNumber)
        this.show = true;
        
    }

    close(){
        this.show = false;
    }

    onSubmit(){
        let v = this.voucherForm.value;
        //<voucher>v.voucherId = this.voucher.voucherId;
        //this.isOk.emit(v);
    }

}