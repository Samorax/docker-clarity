import { Component, EventEmitter, inject, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Rewards } from "../Models/Rewards";
import { FormBuilder, NgForm, Validators } from "@angular/forms";
import { voucher } from "../Models/Voucher";
import { paymentService } from "../Services/PaymentService";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'edit-loyalty',
    templateUrl:'./editRewardDialog.component.html'
})

export class editLoyaltyDialogComponent implements OnInit {
    @Input() vouchers!: voucher[]
    reward!:Rewards
    @Output() isOk: EventEmitter<FormData> = new EventEmitter<FormData>();
    show:boolean = false;
    currencySymbol: any;
    @ViewChild('file')fileInput: any;
    appUserId = localStorage.getItem('user_id');
    addButtonActivity:ClrLoadingState = ClrLoadingState.DEFAULT
    _formBuilder = inject(FormBuilder)

    loyaltyForm = this._formBuilder.group({
        title:['',Validators.required],
        description:['',Validators.required],
        rewardImage:[File,Validators.required],
        units:['',Validators.required],
        expiryDate:['',Validators.required],
        redeemPoint:['',Validators.required]
    })


    constructor(private _paySvr:paymentService){}

    ngOnInit(): void {
        this.currencySymbol = this._paySvr.currencySymbol;
    }

    open(x:Rewards){
        this.reward = x;
        this.loyaltyForm.setValue(
            {
                title:x.title,
                description:x.description,
                units:x.units.toString(),
                expiryDate: x.expiryDate,
                redeemPoint:x.redeemPoint.toString(),
                rewardImage:x.rewardImage

            }
        )
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
        let expiryDate = new Date(y.expiryDate).toUTCString();

        let form = new FormData();
        form.append('rewardsId',this.reward.rewardsId.toString());
        form.append('title',y.title);
        form.append('description',y.description);
        form.append('units',y.units.toString());
        form.append('rewardImage', this.checkIfPhotoFilePresent(this.fileInput[0]));
        form.append('redeemPoint',y.redeemPoint.toString());
        form.append('createdDate',this.reward.createdDate);
        form.append('expiryDate',expiryDate);
        form.append('applicationUserID',this.reward.applicationUserID);

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