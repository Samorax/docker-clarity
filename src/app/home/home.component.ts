import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

import { ClarityIcons, timesIcon } from '@cds/core/icon';

ClarityIcons.addIcons(timesIcon)

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl:'./home.component.css',
  changeDetection:ChangeDetectionStrategy.OnPush

})
export class HomeComponent implements AfterViewInit {

/*   _authSvr = inject(AuthenticationService);
  mode = inject(disseminateModeService)
  cd = inject(ChangeDetectorRef)
  netStatus = inject(GetNetworkStatus) */

  ngAfterViewInit(): void {
    //this.isAuthenticated = this._authSvr.isAuthenticated();
   // this.mode.getMode.subscribe(m=> {this.testMode = m;this.cd.detectChanges();});
    //this.netStatus.getStatus$.subscribe(n=> {this.networkStatus = n;this.cd.detectChanges()})
  }
 
  show:any;
  demoCollapsible:any = false;

  appMode!:boolean

  formBuilder = inject(FormBuilder)
  //chatSVR = inject(chatService)
  
  //chatHistory:BehaviorSubject<IChatMessage[]> = new BehaviorSubject<IChatMessage[]>([{author:'',message:''}])


  chatForm = this.formBuilder.group({
    message:['',Validators.required]
  });
  opened: boolean = false;
networkStatus: any;
isAuthenticated!: Observable<boolean>;
testMode: any;
  
  
  /* onSubmit() {
    let currentArray = this.chatHistory.getValue();
    let updatedArray = [...currentArray,{author:'You',message:<string>this.chatForm.value.message}]
    this.chatHistory.next(updatedArray) ;
  
    let x: chatQuery = {message: this.chatForm.value.message}; */
   /*  this.chatSVR.sendMessage(x).subscribe(r=>{
      let currentArray = this.chatHistory.getValue();
      let updatedArray = [...currentArray,{author:'Ai Asistant',message:<string>r.content}]
    this.chatHistory.next(updatedArray);
    })  
  }*/
  chatResponse: BehaviorSubject<string> = new BehaviorSubject<string>('');
  userPrompt: string = ''
  
    openChatBox() 
    {
      this.showDialogBox = true;
    }

    showDialogBox:boolean = false;

      closeDialogBox()
      {
        this.showDialogBox = false;

      }
  

}
