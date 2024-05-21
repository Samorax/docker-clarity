import { AfterViewInit, Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../Services/AuthenticationService";
import { RegisterCredentials } from "../Models/RegisterCredentials";
import { AbstractControl, FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { RCDTO } from "../Models/RegisterCredentialsDTO";

import { Stripe, StripeCardElement, loadStripe } from "@stripe/stripe-js"
import { paymentService } from "../Services/PaymentService";
import '@cds/core/icon/register.js';
import { ClarityIcons, infoCircleIconName,infoCircleIcon } from '@cds/core/icon';
import { country } from "../Models/Country";

ClarityIcons.addIcons(infoCircleIcon);


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl:'./register.component.css'
})

export class registerComponent implements OnInit, AfterViewInit{
  registerForm = this.formBUilder.group({
    businessDetails: this.formBUilder.group({
      businessName:['',Validators.required],
      businessAddressLine1:['',Validators.required],
      businessAddressLine2:[''],
      city:['',Validators.required],
      postalCode:['',Validators.required],
      country:['',Validators.required]
    }),
    contactDetails: this.formBUilder.group({
      firstName:['',Validators.required],
      lastName:['',Validators.required],
      email:['',[Validators.required, Validators.email]],
      phoneNumber:['',[Validators.required,Validators.minLength(5)]]
    }),
    loginDetails: this.formBUilder.group({
      password:['',[Validators.required,Validators.pattern("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")]],
      verifyPassword:['',Validators.required]
    }),
    paymentToken:['',Validators.required],
    terms:[false,Validators.requiredTrue]
  },{
    validator:this.MustMatch('loginDetails.password','loginDetails.verifyPassword')
  })

  credentials: RCDTO = new RCDTO();
  show:boolean = false;
  processing:boolean = false;
  feedbacks:any ;
  errors: any;
  stripe: any;
  paymentElement: any;
  clientSecret: any;
  cardToken: any;
  countries: country[] = [{name:"United Kingdom"}, {name:"United States"},{name:"France"},{name:"Germany"}]
  
  showAuthorizePaymentFeedback: boolean = false;
  showAuthorizePaymentError:boolean = false;
  paymentErrorReason:any
  registrationErrorReason:any
  showRegistrationFeedback: boolean = false;
  showRegistrationError: boolean = false;
  registeringUserInfo: boolean = false;
  
  constructor(private authenticationService: AuthenticationService,private stripeIntentService: paymentService, private formBUilder:FormBuilder ) { }



  ngAfterViewInit(): void {
    this.CreatePaymentForm();
  }
  

  async ngOnInit():Promise<void> {
    this.stripe = await loadStripe("pk_test_51OZtsPLMinwGqDJe4WXbskkZ1G2voTezl8OneMarPyB4tweJbNANCrKtyWVdZ0hBxA9pAAid9hs9JVxc6i9kd11g00xRANg6LK");
    //this.CreatePaymentForm();
  }

  MustMatch(controlName: string, matchingControlName: string) {
    return (group: AbstractControl) => {
        const control = group.get(controlName);
        const matchingControl = group.get(matchingControlName);

        if (!control || !matchingControl) {
            return null;
        }

        // return if another validator has already found an error on the matchingControl
        if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
            return null;
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
        return null;
    }
}

 // when authorise buton is clicked
  onPaymentAuthorize(b:any){
    b.preventDefault();
    this.stripe.createToken(this.paymentElement)
    .then((c:any)=> {this.registerForm.get('paymentToken')?.setValue(c.token.id), this.showAuthorizePaymentFeedback = true})
    .catch((er:Error)=>{ this.showAuthorizePaymentError = true; this.paymentErrorReason = er.message});}
  
  
  //load stripe form
  private CreatePaymentForm() {
    this.stripeIntentService.createPaymentIntent({ "amount": "49.99", "currency": "gbp" }).subscribe((c: any) => {
      this.clientSecret = c;
      
      let element = this.stripe?.elements({ clientSecret: this.clientSecret});
      this.paymentElement = element?.create("card",{
        hidePostalCode:true,
        style: {
          base: {
            iconColor: '#666EE8',
            color: '#31325F',
            lineHeight: '40px',
            fontWeight: 300,
            fontFamily: 'Helvetica Neue',
            fontSize: '15px',
      
            '::placeholder': {
              color: '#CFD7E0',
            },
          },
        }
      });
      
      this.paymentElement?.mount("#payment-element");
    });
  }

  signUp() {
    this.processing = true;
    this.registeringUserInfo = true;
    let x = this.registerForm.value;
    
    let credentials: RegisterCredentials =
    {
      businessName: x.businessDetails.businessName,
      businessAddress1: x.businessDetails.businessAddressLine1,
      businessAddress2: x.businessDetails.businessAddressLine2,
      state: x.businessDetails.city,
      postalCode: x.businessDetails.postalCode,
      country: x.businessDetails.country.name,
      email: x.contactDetails.email,
      firstName: x.contactDetails.firstName,
      lastName: x.contactDetails.lastName,
      phoneNumber:x.contactDetails.phoneNumber,
      password: x.loginDetails.password,
      paymentToken:x.paymentToken
    };
  
    this.authenticationService.register(credentials).subscribe(x => 
      { 
        this.showRegistrationFeedback = true;
        this.registeringUserInfo = false;
       
      }, (err:Error)=>{
        this.registeringUserInfo = false;
          this.showRegistrationError = true;
          this.registrationErrorReason = err.message;
      },()=>{ this.showRegistrationError = false;})
      
  }



}


