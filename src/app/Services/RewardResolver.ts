import { ActivatedRoute, ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Rewards } from "../Models/Rewards";
import { inject } from "@angular/core";
import { RewardService } from "./RewardService";

export const rewardResolver:ResolveFn<Rewards[]> = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot)=>
    {
        return inject(RewardService).getRewards();
    }