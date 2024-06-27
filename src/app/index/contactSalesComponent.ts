import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ContactService } from "../Services/ContactService";
import { ClrLoadingState } from "@clr/angular";


@Component({
    selector:'app-contactSales',
    templateUrl:'./contactSalesComponent.html',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class contactSalesComponent{
    contactSalesBtn: ClrLoadingState = ClrLoadingState.DEFAULT;
    feedbackMessageSuccess!: string;
    feedbackMessageError!: string;
    constructor(private _formBuilder:FormBuilder,private _contactSalesSVR: ContactService, private cd:ChangeDetectorRef){}
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
        this._contactSalesSVR.sendSalesContactForm(m).subscribe({
            next:()=>{this.feedbackMessageSuccess ="Success!!! We will get back to you within 24 hours";this.salesForm.disable() ;this.cd.detectChanges()},
            error:(er:Error)=> {this.feedbackMessageError = er.message; this.cd.detectChanges()},
            complete:()=>{this.contactSalesBtn = ClrLoadingState.SUCCESS; this.cd.detectChanges()}
        });
    }
}