import { Component, EventEmitter, Output } from "@angular/core";
import { AuthenticationService } from "../Services/AuthenticationService";
import { loginCredentials } from "../Models/LoginCredentials";
import { FormBuilder, NgForm, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})

export class loginComponent {
  loginForm = this.formBuilder.group({
    email:['',Validators.required],
    password:['',Validators.required]
  })
  
  
  
  feedback:string ='';
  sendingForm: boolean = false;
  @Output() onOk: EventEmitter<boolean> = new EventEmitter<boolean>();
  credentials: loginCredentials = new loginCredentials();
  constructor(private authenticationService: AuthenticationService, private _router: Router, private formBuilder: FormBuilder) { }

  onSubmit() {
    
    this.sendingForm = true;
    this.credentials = <loginCredentials>this.loginForm.value;
    this.authenticationService.logIn(this.credentials).subscribe((r)=>{
      this._router.navigate(["home"]);
  },(er)=> this.feedback = "Invalid Email or Password !!");
  };
}
