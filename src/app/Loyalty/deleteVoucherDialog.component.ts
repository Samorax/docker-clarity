import { Component, EventEmitter, Input, Output } from "@angular/core";
import { voucher } from "../Models/Voucher";

@Component({
    selector:'del-voucher',
    templateUrl:'./deleteVoucherDialog.component.html'
})

export class deleteVoucherDialogComponent{
    @Input() vouchers!: voucher[]
    @Output() isOk: EventEmitter<voucher[]> = new EventEmitter<voucher[]>()
    show:boolean = false;

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onConfirm(){
        this.isOk.emit(this.vouchers);
    }
}