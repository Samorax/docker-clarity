import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector:'app-index',
    templateUrl:'./indexComponent.html',
    styleUrl:'./indexComponent.css'
})

export class indexComponent{
    constructor(private _router:Router){}
    onContactSales(){
        this._router.navigateByUrl("/contact-sales");
    }
}