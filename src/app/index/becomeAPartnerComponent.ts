import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ContactService } from "../Services/ContactService";
import { PartnerFormModel } from "../Models/PartnerFormModel";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'app=becomeAPartner',
    templateUrl:'./becomeAPartnerComponent.html'
})

export class becomeAPartnerComponent{
    feedBackMessage!: string;
    submitBtnState: ClrLoadingState = ClrLoadingState.DEFAULT
    constructor(private _formBuilder:FormBuilder, private _contactSVR: ContactService){}
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
        let m = this.partnerForm.value;
        let p = new PartnerFormModel();
        p.address = m.streetAddress + "," + m.city +","+ m.country;
        p.companyName = m.companyName; p.email = m.email; p.website = m.website;p.telephone = m.phone;
        //this.submitBtnState = ClrLoadingState.LOADING;
        this._contactSVR.sendPartnershipForm(p).subscribe({
            next:(r:any)=>this.feedBackMessage = "Success!! We will get back to you within 24 hours",
            error:(er:Error)=>this.feedBackMessage = er.message,
            complete:()=>this.submitBtnState = ClrLoadingState.SUCCESS
    })
    }
}