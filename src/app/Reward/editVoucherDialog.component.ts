import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { voucher } from "../Models/Voucher";
import { NgForm } from "@angular/forms";
import { paymentService } from "../Services/PaymentService";

@Component({
    selector:'edit-voucher',
    templateUrl:'./editVoucherDialog.component.html'
})

export class editVoucherDialogComponent implements OnInit{
    constructor(private _paySvr:paymentService){
    }
    ngOnInit(): void {
        this.currencySymbol = this._paySvr.currencySymbol;
    }

    @Input() voucher!:voucher
    @Output() isOk: EventEmitter<voucher> = new EventEmitter<voucher>()
    show:boolean = false;
    currencySymbol:any

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(x:NgForm){
        let v = <voucher>x.value;
        v.voucherId = this.voucher.voucherId;
        this.isOk.emit(v);
    }

}