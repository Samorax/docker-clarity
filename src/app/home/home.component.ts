import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { SettingsComponent } from '../Settings/settings.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl:'./home.component.css'
})
export class HomeComponent {
 
  show:any;
  demoCollapsible:any = false;

  appMode!:boolean


  open()
  {
  
  }

}
