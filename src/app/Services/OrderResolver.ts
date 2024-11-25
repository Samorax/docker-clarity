import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Order } from "../Models/Order.model";
import { OrderService } from "./OrderService";
import { Observable } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class orderResolver implements Resolve<Order[]>
{
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Order[]> {
        return this.odaSvr.getOrders()
    }
    odaSvr = inject(OrderService);
    
}