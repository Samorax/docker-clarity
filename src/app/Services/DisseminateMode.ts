import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class disseminateModeService{

    takeMode(x:any){
        return new Observable((x)=>{
            x.next(x);
        });
    }

    getMode = new BehaviorSubject<boolean>(true);
}