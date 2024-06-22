import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class SmSActivatorService{

    activation!:boolean

    activaionState = new Subject<boolean>();
    getState = this.activaionState.asObservable();

}