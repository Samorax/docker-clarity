import { Component, EventEmitter, MissingTranslationStrategy, OnInit, Output, inject } from "@angular/core";
import { voucher } from "../Models/Voucher";
import { smsModel } from "../Models/SmsModel";
import { NgForm } from "@angular/forms";
import { CustomerService } from "../Services/Customer/CustomerService";
import { Customer } from "../Models/Customer";


@Component({
    templateUrl:'./broadcastDialog.component.html',
    selector:'app-broadcast'
})

export class broadcastDialogComponent implements OnInit{
    custSVR = inject(CustomerService);
    @Output()isOk:EventEmitter<smsModel> = new EventEmitter<smsModel>();
    show:boolean = false;
    message:smsModel = new smsModel();
    mSID: any = localStorage.getItem("mSID");
    recepients!:Customer[];
    selected!:[];
    phoneNumers : string[] = [];

    ngOnInit(): void {
        
       
    }

    
    open(x:voucher){
        let s:string = `Be healthy. Eat more for less by using this voucher code: ${x.voucherNumber}.
        Use before ${x.voucherExpirationDate}. Hurry, there is only ${x.units} provided.`

        this.message.Message = s, this.message.MessageSID = this.mSID;
        this.show = true;
        console.log('hey');
        this.custSVR.getCustomers().subscribe(c=> {
            this.recepients = c;
           
        });
    }

    close(){
        this.show = false;
    }

    onSubmit(n:NgForm){
        let phoneNumbers:string[] = [];
        let s  = n.value;
        //get the phoneNumbers of customers having the same names as the selected.
        //multiple customers can have same names. this method does not pass all text cases, because it uses 'find' to query the collection. 
        //find immediately returns a customer when the predicate is true.
        s.names.forEach((n:String)=>{
            let xy = n.split(" ");
            let cust:any = this.recepients.find(c=> c.firstName === xy[0] && c.lastName === xy[1]);
            phoneNumbers.push(cust?.phoneNumber);
        })
        this.message.PhoneNumbers = phoneNumbers;
        this.message.Message = s.message;
        
        this.isOk.emit(this.message);
    }
}