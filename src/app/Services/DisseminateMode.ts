import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class disseminateModeService{

    mode = new BehaviorSubject<boolean>(false);
    getMode = this.mode.asObservable();
}