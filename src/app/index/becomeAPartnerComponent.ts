import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ContactService } from "../Services/ContactService";
import { PartnerFormModel } from "../Models/PartnerFormModel";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'app=becomeAPartner',
    templateUrl:'./becomeAPartnerComponent.html',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class becomeAPartnerComponent{
    feedBackMessage!: string;
    submitBtnState: ClrLoadingState = ClrLoadingState.DEFAULT
    feedBackMessageSuccess!: string;
    feedBackMessageError!: string;
    constructor(private _formBuilder:FormBuilder, private _contactSVR: ContactService, private cd: ChangeDetectorRef){}
    partnerForm = this._formBuilder.group({
        companyName:['',Validators.required],
        email:['',Validators.required],
        phone:['',Validators.required],
        website:[''],
        streetAddress:['',Validators.required],
        city:['',Validators.required],
        country:['',Validators.required]
    })

    onSubmit(){
         this.submitBtnState = ClrLoadingState.LOADING;
        let m = this.partnerForm.value;
        let p = new PartnerFormModel();
        p.address = m.streetAddress + "," + m.city +","+ m.country;
        p.companyName = m.companyName; p.email = m.email; p.website = m.website;p.telephone = m.phone;
       
        this._contactSVR.sendPartnershipForm(p).subscribe({
            next:(r:any)=>{this.feedBackMessageSuccess = "Success!! We will get back to you within 24 hours"; this.partnerForm.disable(); this.cd.detectChanges()},
            error:(er:Error)=>{this.feedBackMessageError = er.message,this.cd.detectChanges()},
            complete:()=>{this.submitBtnState = ClrLoadingState.SUCCESS,this.cd.detectChanges()}
    })
            
    }
}