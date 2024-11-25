import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Rewards } from "../Models/Rewards";
import { voucherService } from "../Services/VoucherService";
import { voucher } from "../Models/Voucher";
import { paymentService } from "../Services/PaymentService";
import { FormBuilder, NgForm, Validators } from "@angular/forms";
import { ClrLoadingState } from "@clr/angular";


@Component({
    templateUrl:'./addRewardDialog.component.html',
    selector:'app-rewardsDialog'
})

export class addLoyaltyDialogComponent implements OnInit{
    appUserId = localStorage.getItem('user_id');
    constructor(private _voucherSvr: voucherService, private _paySvr:paymentService, private _formBuilder:FormBuilder){}

    ngOnInit(): void {
        this.currencySymbol = this._paySvr.currencySymbol;
    }

    @Output() isOk: EventEmitter<any> = new EventEmitter<any>();
    currencySymbol:string = '';
    reward: Rewards = new Rewards();
    @Input()vouchers!: voucher[];
    show:boolean = false;
    @ViewChild('file')fileInput: any;
    addButtonActivity:ClrLoadingState = ClrLoadingState.DEFAULT

    loyaltyForm = this._formBuilder.group({
        title:['',Validators.required],
        description:['',Validators.required],
        rewardImage:[File,Validators.required],
        units:['',Validators.required],
        expiryDate:['',Validators.required],
        redeemPoint:['',Validators.required]
    })



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

    onSubmit()
    {
        this.addButtonActivity = ClrLoadingState.LOADING
        let y:any = this.loyaltyForm.value;
        let createdDate = new Date().toUTCString();
        let expiryDate = new Date(y.expiryDate).toUTCString();
        let applicationUserID:any = this.appUserId;
        let form = new FormData();
        form.append('title',y.title);
        form.append('description',y.description);
        form.append('units',y.units.toString());
        form.append('rewardImage',this.fileInput[0]);
        form.append('redeemPoint',y.redeemPoint.toString());
        form.append('createdDate',createdDate);
        form.append('expiryDate',expiryDate);
        form.append('applicationUserID',applicationUserID);
        
        
        this.isOk.emit(form);
    }


}