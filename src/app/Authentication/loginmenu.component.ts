import { Component, Input, OnInit } from "@angular/core";
import { AuthenticationService } from "../Services/AuthenticationService";
import { Observable } from "rxjs";

@Component({
    selector:'app-loginmenu',
    templateUrl:'./loginmenu.component.html'
})

export class loginMenuComponent {
    constructor(public _authService: AuthenticationService){}
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

}