import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class disseminateModeService{

    takeMode(x:any){
        return new Observable((x)=>{
            x.next(x);
        });
    }

    mode = new Subject<boolean>();
    getMode = this.mode.asObservable();
}