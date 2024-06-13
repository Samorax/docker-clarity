import { inject } from "@angular/core"
import { AuthenticationService } from "../Services/AuthenticationService"
import { Router } from "@angular/router";

export const authGuard = () =>{
    const authService = inject(AuthenticationService);
    const _router = inject(Router);

    if(authService.isAuthenticated()){
        return true;
    }
    
    return _router.parseUrl("/login");
}