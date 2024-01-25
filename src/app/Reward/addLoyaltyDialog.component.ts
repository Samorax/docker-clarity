import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Rewards } from "../Models/Rewards";
import { voucherService } from "../Services/VoucherService";
import { voucher } from "../Models/Voucher";
import { paymentService } from "../Services/PaymentService";
import { NgForm } from "@angular/forms";


@Component({
    templateUrl:'./addLoyaltyDialog.component.html',
    selector:'app-rewardsDialog'
})

export class addLoyaltyDialogComponent implements OnInit{
    constructor(private _voucherSvr: voucherService, private _paySvr:paymentService){}

    ngOnInit(): void {
        this.currencySymbol = this._paySvr.currencySymbol;
    }

    @Output() isOk: EventEmitter<Rewards> = new EventEmitter<Rewards>();
    currencySymbol:string = '';
    reward: Rewards = new Rewards();
    @Input()vouchers!: voucher[];
    show:boolean = false;

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(x:NgForm)
    {
        console.log('hey');
        let y = <Rewards>x.value;
        y.createdDate = new Date();
        this.isOk.emit(y);
    }


}