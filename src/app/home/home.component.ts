import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { SettingsComponent } from '../Settings/settings.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
 
  show:any;
  demoCollapsible:any = false;

  appMode!:boolean

 

}
