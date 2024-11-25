import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { voucher } from "../Models/Voucher";
import { inject } from "@angular/core";
import { voucherService } from "./VoucherService";

export const voucherResolver:ResolveFn<voucher[]> = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot)=>
    {
        return inject(voucherService).getVouchers();
    }