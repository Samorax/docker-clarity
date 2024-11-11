import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class GetNetworkStatus{
    networkStatus:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    getStatus$ = this.networkStatus.asObservable();
}