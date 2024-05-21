import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { AuthenticationService } from "../Services/AuthenticationService";
import { Router } from "@angular/router";

@Component({
  selector: "app-logout",
  templateUrl:"./logout.component.html"
})
export class logOutComponent implements OnInit{
 
  @Output()isLoggedOut: EventEmitter<string> = new EventEmitter<string>();
  constructor(private _authService: AuthenticationService, private _router: Router) { }

    ngOnInit(): void {

    }

    


}
