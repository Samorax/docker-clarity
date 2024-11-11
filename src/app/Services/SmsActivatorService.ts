import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class SmSActivatorService{

    activation!:boolean

    activaionState = new BehaviorSubject<boolean>(false);
    getState = this.activaionState.asObservable();

}