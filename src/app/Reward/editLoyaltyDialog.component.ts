import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Rewards } from "../Models/Rewards";
import { NgForm } from "@angular/forms";
import { voucher } from "../Models/Voucher";
import { paymentService } from "../Services/PaymentService";

@Component({
    selector:'edit-loyalty',
    templateUrl:'./editLoyaltyDialog.component.html'
})

export class editLoyaltyDialogComponent implements OnInit {
    @Input() vouchers!: voucher[]
    @Input() reward!:Rewards
    @Output() isOk: EventEmitter<Rewards> = new EventEmitter<Rewards>();
    show:boolean = false;
    currencySymbol: any;

    constructor(private _paySvr:paymentService){}

    ngOnInit(): void {
        this.currencySymbol = this._paySvr.currencySymbol;
    }

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(x:NgForm)
    {
        let r = <Rewards>x.value;
        r.rewardsId = this.reward.rewardsId;
        this.isOk.emit(r);
    }

}