import { AfterViewInit, Component, inject, Input, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthenticationService } from '../Services/AuthenticationService';
import { loginMenuComponent } from '../Authentication/loginmenu.component';
import { loginComponent } from '../Authentication/login.component';
import { logOutComponent } from '../Authentication/logout.component';
import { Notifications } from '../Models/Notification';
import { chatBubbleIcon, ClarityIcons } from '@cds/core/icon';
import { FormBuilder, Validators } from '@angular/forms';
import { chatService } from '../Services/ChatService';
import { chatQuery } from '../Models/ChatQuery';
import { IChatMessage } from '../Services/IChatMessage';

ClarityIcons.addIcons(chatBubbleIcon)

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements AfterViewInit {

formBuilder = inject(FormBuilder)
chatSVR = inject(chatService)


chatHistory:BehaviorSubject<IChatMessage[]> = new BehaviorSubject<IChatMessage[]>([{author:'',message:''}])


chatForm = this.formBuilder.group({
  message:['',Validators.required]
});


onSubmit() {
  let currentArray = this.chatHistory.getValue();
  let updatedArray = [...currentArray,{author:'You',message:<string>this.chatForm.value.message}]
  this.chatHistory.next(updatedArray) ;

  let x: chatQuery = {message: this.chatForm.value.message};
  this.chatSVR.sendMessage(x).subscribe(r=>{
    let currentArray = this.chatHistory.getValue();
    let updatedArray = [...currentArray,{author:'Ai Asistant',message:<string>r.content}]
  this.chatHistory.next(updatedArray);
  }) 
}
chatResponse: BehaviorSubject<string> = new BehaviorSubject<string>('');
userPrompt: string = ''

  openChatBox() {
    this.opened = true;
    }

show:boolean = false;
status:string = '';
@Input()notifications!:Notifications[];

isAuthenticated: boolean = false;

loginStatus!:Observable<string>;
  @ViewChild(loginComponent) login!: loginComponent;
  @ViewChild(logOutComponent) logout!: logOutComponent;
  opened:boolean = false;
  constructor(public _authService: AuthenticationService) { }


  ngAfterViewInit(): void {
    this.logout.isLoggedOut.subscribe(s=> this.loginStatus = of(s));
    this.status = this.notifications.length !== 0 ? 'info':'';
  }
    
  onDismiss(x:any){
    this.notifications.splice(this.notifications.indexOf(x),1);
  }
 

}
