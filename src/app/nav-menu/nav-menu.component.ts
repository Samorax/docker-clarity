import { AfterViewInit, Component, Input, Output, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../Services/AuthenticationService';
import { loginMenuComponent } from '../Authentication/loginmenu.component';
import { loginComponent } from '../Authentication/login.component';
import { logOutComponent } from '../Authentication/logout.component';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements AfterViewInit {
@Input()status!:string;
isAuthenticated: boolean = false;

  loginStatus!:Observable<string>;
  @ViewChild(loginComponent) login!: loginComponent;
  @ViewChild(logOutComponent) logout!: logOutComponent;
  constructor(public _authService: AuthenticationService) { }

  ngAfterViewInit(): void {
    this.logout.isLoggedOut.subscribe(s=> this.loginStatus = of(s));
  }
    

 

}
