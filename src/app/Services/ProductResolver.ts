import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Product } from "../Models/Product";
import { Observable } from "rxjs";
import { ProductService } from "./ProductService";

@Injectable({
    providedIn:'root'
})

export class productResolver implements Resolve<Product[]>
{
    constructor(private productService:ProductService){}
    
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Product[] | Observable<Product[]> | Promise<Product[]> {
        return this.productService.getProducts();
    }
    
}