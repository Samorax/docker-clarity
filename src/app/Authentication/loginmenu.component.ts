import { Component, Input, OnInit } from "@angular/core";
import { AuthenticationService } from "../Services/AuthenticationService";
import { Observable } from "rxjs";
import { Router } from "@angular/router";

@Component({
    selector:'app-loginmenu',
    templateUrl:'./loginmenu.component.html'
})

export class loginMenuComponent {
    constructor(public _authService: AuthenticationService, public _router:Router){}
    @Input()isAuthenticated!: boolean

    

    isExpanded = false;
    navsEnabled!: Observable<boolean>;

    checkAuth(auth: any) {
        this.navsEnabled = auth;
    }

    collapse() {
        this.isExpanded = false;
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
    }

    logOut(){
        this._authService.logOut().subscribe();
    }

}