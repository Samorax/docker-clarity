import { Component, EventEmitter, Output } from "@angular/core";
import { AuthenticationService } from "../Services/AuthenticationService";
import { loginCredentials } from "../Models/LoginCredentials";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})

export class loginComponent {
  feedback:string ='';
  sendingForm: boolean = false;
  @Output() onOk: EventEmitter<boolean> = new EventEmitter<boolean>();
  credentials: loginCredentials = new loginCredentials();
  constructor(private authenticationService: AuthenticationService, private _router: Router) { }

  onSubmit(f: any) {
    this.sendingForm = true;
    this.credentials = <loginCredentials>f;
    this.authenticationService.logIn(this.credentials).subscribe((r)=>{
      this._router.navigateByUrl("/home");
  },(er)=> this.feedback = "Invalid Email or Password !!");
  };
}
