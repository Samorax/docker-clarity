import { Component } from "@angular/core";
import { AuthenticationService } from "../Services/AuthenticationService";
import { RegisterCredentials } from "../Models/RegisterCredentials";
import { NgForm } from "@angular/forms";
import { RCDTO } from "../Models/RegisterCredentialsDTO";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl:'./register.component.css'
})

export class registerComponent {
  credentials: RCDTO = new RCDTO();
  show:boolean = false;
  processing:boolean = false;
  feedbacks:any ;
  errors:any;
  constructor(private authenticationService: AuthenticationService) { }

  signUp(f:NgForm) {
    this.processing = true;
    let v = f.value;
    let credentials: RegisterCredentials =
    {
      businessName: v.businessInformation.businessName,
      businessAddress1: v.businessInformation.businessAddressLine1,
      businessAddress2: v.businessInformation.businessAddressLine2,
      state: v.businessInformation.businessAddressCity,
      postalCode: v.businessInformation.businessAddressPostalCode,
      country: v.businessInformation.businessAddressCountry,
      email: v.contact.email, firstName: v.contact.firstName, lastName: v.contact.lastName, password: v.loginDetails.password, accountType : v.loginDetails.accountType

    };
    //console.log(credentials);
    this.authenticationService.register(credentials).subscribe(x => 
      { 
        this.show = true;
        this.feedbacks = x; 
      }, (err:string)=>{
        this.show = true;
        this.feedbacks = err
      } )
      this.processing = false;
  }



}

class feedbacks {
  succeeded:any
  errors:any
}
