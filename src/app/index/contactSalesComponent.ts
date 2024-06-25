import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ContactSalesService } from "../Services/ContactSalesService";

@Component({
    selector:'app-contactSales',
    templateUrl:'./contactSalesComponent.html'
})

export class contactSalesComponent{
    constructor(private _formBuilder:FormBuilder,private _contactSalesSVR: ContactSalesService){}
    feedbackMessage!:string;
    salesForm = this._formBuilder.group({
        firstName:['',Validators.required],
        lastName:['',Validators.required],
        companyName:['',Validators.required],
        companyEmail:['',[Validators.required,Validators.email]],
        companyPhoneNumber:['',Validators.required],
        companySize:['',Validators.required],
        message:['',Validators.required]
    });

    onSubmit(){
        let m = this.salesForm.value;
        this._contactSalesSVR.contactSales(m).subscribe((r:any)=>{
            this.feedbackMessage = r;
        },(er:Error)=> this.feedbackMessage = er.message);
    }
}