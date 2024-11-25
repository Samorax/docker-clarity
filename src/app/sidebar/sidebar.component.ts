import { Component } from "@angular/core";
import { ClarityIcons, heartIcon } from "@cds/core/icon";
ClarityIcons.addIcons(heartIcon)

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl:'./sidebar.component.css'
})
export class SidebarComponent {

  demoCollapsible:any = true;
}
