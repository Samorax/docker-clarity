import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import { Stock } from "../../Models/Stock";
import { Observable } from "rxjs";
import { stockService } from "./StockService";

@Injectable({
    providedIn:'root'
})

export class stockResolver implements Resolve<Stock[]>
{
    stkSVR = inject(stockService)
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Stock[] | Observable<Stock[]> | Promise<Stock[]> {
        return this.stkSVR.getStocks();
    }

}
