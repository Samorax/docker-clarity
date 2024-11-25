import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { appUser } from "../Models/AppUser";
import { inject } from "@angular/core";
import { appUserService } from "./AppUserService";

export const appUserResolver:ResolveFn<appUser> = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot)=>
    {
        return inject(appUserService).getAppUserInfo()
    }