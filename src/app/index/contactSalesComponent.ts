import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ContactService } from "../Services/ContactService";
import { ClrLoadingState } from "@clr/angular";


@Component({
    selector:'app-contactSales',
    templateUrl:'./contactSalesComponent.html'
})

export class contactSalesComponent{
    contactSalesBtn: ClrLoadingState = ClrLoadingState.DEFAULT;
    constructor(private _formBuilder:FormBuilder,private _contactSalesSVR: ContactService){}
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
        this.contactSalesBtn = ClrLoadingState.LOADING;
        let m = this.salesForm.value;
        this._contactSalesSVR.sendSalesContactForm(m).subscribe((r:any)=>{
        console.log(r)
            this.contactSalesBtn = ClrLoadingState.SUCCESS;
            this.feedbackMessage = r;
        },(er:Error)=> this.feedbackMessage = er.message);
    }
}