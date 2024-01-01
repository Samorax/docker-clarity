import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../Services/AuthenticationService';
import { loginMenuComponent } from '../Authentication/loginmenu.component';
import { loginComponent } from '../Authentication/login.component';
import { logOutComponent } from '../Authentication/logout.component';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  
isAuthenticated: boolean = false;

  @ViewChild(loginComponent) login!: loginComponent;
  @ViewChild(logOutComponent) logout!: logOutComponent;
  constructor(private _authService: AuthenticationService) { }
    

 

}
