import { Component, EventEmitter, Output, inject } from "@angular/core";
import { AuthenticationService } from "../Services/AuthenticationService";
import { loginCredentials } from "../Models/LoginCredentials";
import { FormBuilder, NgForm, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { disseminateModeService } from "../Services/DisseminateMode";

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
  
  constructor(private authenticationService: AuthenticationService, private _router: Router, private formBuilder: FormBuilder,private appMode:disseminateModeService) { }

  onSubmit() {
    
    this.sendingForm = true;
    this.credentials = <loginCredentials>this.loginForm.value;
    this.authenticationService.logIn(this.credentials).subscribe((r:any)=>{
    
      this._router.navigate(["home"]);
     let mode = r.mode;
     this.appMode.mode.next(mode);
     localStorage.setItem('appMode',mode);
  },(er)=> this.feedback = "Invalid Email or Password !!");
  };
}
