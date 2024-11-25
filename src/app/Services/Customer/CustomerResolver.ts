import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Customer } from "../../Models/Customer";
import { inject } from "@angular/core";
import { CustomerService } from "../Customer/CustomerService";

export const customerResolver:ResolveFn<Customer[]> = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot) =>
    {
        return inject(CustomerService).getCustomers()
    }