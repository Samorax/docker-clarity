import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
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
    appUserId = localStorage.getItem('user_id');
    constructor(private _voucherSvr: voucherService, private _paySvr:paymentService){}

    ngOnInit(): void {
        this.currencySymbol = this._paySvr.currencySymbol;
    }

    @Output() isOk: EventEmitter<any> = new EventEmitter<any>();
    currencySymbol:string = '';
    reward: Rewards = new Rewards();
    @Input()vouchers!: voucher[];
    show:boolean = false;
    @ViewChild('file')fileInput: any;


    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    handleClickEvent() {
        const fileElem = <HTMLInputElement>document.getElementById('fileElem');
        if (fileElem) {
                fileElem.click();
        }
    }
    
    onfileLoaded(x: any) {
      this.fileInput = x;
        this.handleFiles(x);
    }
    
    handleFiles(files: FileList) {
        let imgThumbNail: any;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const imageType = /^image\//;
    
            if (!imageType.test(file.type)) {
                continue;
            }
            // this.getFileUploads(file.name);
            imgThumbNail = document.getElementById('img-thumb');
            imgThumbNail.src = window.URL.createObjectURL(file);
        }
    }

    onSubmit(x:NgForm)
    {
        let y = <Rewards>x.value;
        y.createdDate = new Date().toUTCString();
        y.expiryDate = new Date(y.expiryDate).toUTCString();
        y.applicationUserID = this.appUserId;
        let form = new FormData();
        form.append('title',y.title);
        form.append('description',y.description);
        form.append('units',y.units.toString());
        form.append('rewardImage',this.fileInput[0]);
        form.append('redeemPoint',y.redeemPoint.toString());
        form.append('createdDate',y.createdDate);
        form.append('expiryDate',y.expiryDate);
        form.append('applicationUserID',y.applicationUserID);
        
        
        this.isOk.emit(form);
    }


}