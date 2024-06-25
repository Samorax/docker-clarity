import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
    selector:'app=becomeAPartner',
    templateUrl:'./becomeAPartnerComponent.html'
})

export class becomeAPartnerComponent{
    constructor(private _formBuilder:FormBuilder){}
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

    }
}