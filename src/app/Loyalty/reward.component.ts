import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { addLoyaltyDialogComponent } from "./addRewardDialog.component";
import { Product } from "../Models/Product";
import { Rewards } from "../Models/Rewards";
import { RewardService } from "../Services/RewardService";
import { voucher } from "../Models/Voucher";
import { editLoyaltyDialogComponent } from "./editRewardDialog.component";
import { deleteLoyaltyDialogComponent } from "./deleteRewardDialog.component";
import { BehaviorSubject, Observable, of } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { announcementIcon, ClarityIcons, pencilIcon, plusIcon, timesCircleIcon } from "@cds/core/icon";
import { ActivatedRoute } from "@angular/router";
ClarityIcons.addIcons(timesCircleIcon,announcementIcon,plusIcon,pencilIcon)

@Component({
    templateUrl:'./reward.component.html',
    selector:'app-loyalty',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class rewardComponent implements OnInit, AfterViewInit
{
    selectedProducts:any = []
    selected:any = []
    redeemPts!:number
    vouchers!:voucher[];
    products!: Product[]
    rewards:BehaviorSubject<any> = new BehaviorSubject<Rewards[]>([])
    reward:Rewards = new Rewards();
    @ViewChild(editLoyaltyDialogComponent) editLoyalty!: editLoyaltyDialogComponent;
    @ViewChild(addLoyaltyDialogComponent) addLoyalty!: addLoyaltyDialogComponent;
    @ViewChild(deleteLoyaltyDialogComponent) delLoyalty!:deleteLoyaltyDialogComponent;
    currencySymbol: any;

    
    

    constructor(private activatedRoute:ActivatedRoute,private sanitizer: DomSanitizer,private cd:ChangeDetectorRef,
         private _rewardsSvr:RewardService){}

    ngAfterViewInit(): void {
        this.addLoyalty.isOk.subscribe(r=>{
            this._rewardsSvr.addRewards(r).subscribe((r:any)=>{
                this.convertImgByte(r).subscribe(r=>{
                    this.rewards.next([...this.rewards.getValue(),r])
                })
                this.addLoyalty.close()
            },(err)=>{});
            this.cd.detectChanges()
        });

        this.editLoyalty.isOk.subscribe((r:FormData)=>{
            let id = r.get('rewardsId');
            this._rewardsSvr.updateRewards(id,r).subscribe(()=>{
                //this.rewards.getValue().findIndex(re=>re.rewardsId === id)
            },(er)=>console.log(er))
            this.editLoyalty.close()
        });

        this.delLoyalty.isOk.subscribe(r=>{
            r.forEach(r=> {
                this._rewardsSvr.deleteRewards(r.rewardsId).subscribe(()=>{
                    let currentArray = this.rewards.getValue().filter((re:Rewards)=>re.rewardsId !== r.rewardsId);
                    this.rewards.next(currentArray)

                },(er)=> console.log(er))
            })
            this.delLoyalty.close()
            this.cd.detectChanges()
        });
    }

    ngOnInit(): void {
    
        this.getProductswithLoyaltyPoints();
        this.getRewards();

    }

    getProductswithLoyaltyPoints(){

            this.activatedRoute.data.subscribe((p:any)=>{
                this.products = p.products.filter((pr:Product)=>pr.loyaltyPoints != 0)
            })
        }
    

    getRewards(){
        let n:Rewards[] = [];
            this.activatedRoute.data.subscribe((r:any)=>{
                let result = r.rewards.filter((re:Rewards)=>re.isDeleted === false);
                result.forEach((rt:any)=>{
                    this.convertImgByte(rt).subscribe(rx=>{
                       n.push(rx);
                    })
                })
                this.rewards.next(n);
                this.cd.detectChanges();
            })
        
    }

    

    onBroadcast(){
        
    }

    onAdd(){
        this.addLoyalty.open();
    }

    onDelete()
    {
        this.delLoyalty.open();
    }

    onEdit(){
        this.reward = this.selected[0];
        this.editLoyalty.open();
    }

    

    convertImgByte(x: Rewards):Observable<Rewards>{
        let objectURL = 'data:image/jpeg;base64,' + x.rewardImage;
        x.rewardImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        return of(x);
    };

    
}