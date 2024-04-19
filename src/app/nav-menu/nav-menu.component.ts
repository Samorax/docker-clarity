import { AfterViewInit, Component, Input, Output, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../Services/AuthenticationService';
import { loginMenuComponent } from '../Authentication/loginmenu.component';
import { loginComponent } from '../Authentication/login.component';
import { logOutComponent } from '../Authentication/logout.component';
import { Notifications } from '../Models/Notification';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements AfterViewInit {
show:boolean = false;
status:string = '';
@Input()notifications!:Notifications[];

isAuthenticated: boolean = false;

loginStatus!:Observable<string>;
  @ViewChild(loginComponent) login!: loginComponent;
  @ViewChild(logOutComponent) logout!: logOutComponent;
  constructor(public _authService: AuthenticationService) { }


  ngAfterViewInit(): void {
    this.logout.isLoggedOut.subscribe(s=> this.loginStatus = of(s));
    this.status = this.notifications.length !== 0 ? 'info':'';
  }
    
  onDismiss(x:any){
    this.notifications.splice(this.notifications.indexOf(x),1);
  }
 

}
