import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Rewards } from "../Models/Rewards";
import { NgForm } from "@angular/forms";
import { voucher } from "../Models/Voucher";
import { paymentService } from "../Services/PaymentService";

@Component({
    selector:'edit-loyalty',
    templateUrl:'./editRewardDialog.component.html'
})

export class editLoyaltyDialogComponent implements OnInit {
    @Input() vouchers!: voucher[]
    @Input() reward!:Rewards
    @Output() isOk: EventEmitter<FormData> = new EventEmitter<FormData>();
    show:boolean = false;
    currencySymbol: any;
    @ViewChild('file')fileInput: any;
    appUserId = localStorage.getItem('user_id');

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
        let r = <Rewards>x.value;
        r.rewardsId = this.reward.rewardsId;
        r.createdDate = new Date().toUTCString();
        r.expiryDate = new Date(r.expiryDate).toUTCString();
        r.applicationUserID = this.appUserId;
        let form = new FormData();
        form.append('rewardsId',r.rewardsId.toString());
        form.append('title',r.title);
        form.append('description',r.description);
        form.append('units',r.units.toString());
        form.append('rewardImage', this.checkIfPhotoFilePresent(this.fileInput[0]));
        form.append('redeemPoint',r.redeemPoint.toString());
        form.append('createdDate',r.createdDate);
        form.append('expiryDate',r.expiryDate);
        form.append('applicationUserID',r.applicationUserID);

        this.isOk.emit(form);
    }

    checkIfPhotoFilePresent(x:any){
        if(x === undefined){
          let s = <String>this.reward.rewardImage;
           let y = s.toString().split(',',2)[1];
           let r = y.split(' ',2)[0];
           
           return r;
        }
        return x;
      }

}