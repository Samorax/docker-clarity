import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from "@angular/core";
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
import { VoucherSmsComponent } from "./voucherSms.component";
import { Customer } from "../Models/Customer";
import { RewardSmsComponent } from "./rewardSms.component";
import { SmsService } from "../Services/SmsService";
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
    customers: BehaviorSubject<any> = new BehaviorSubject<Customer[]>([])
    rewards:BehaviorSubject<any> = new BehaviorSubject<Rewards[]>([])
    reward:Rewards = new Rewards();
    @ViewChild(editLoyaltyDialogComponent) editLoyalty!: editLoyaltyDialogComponent;
    @ViewChild(addLoyaltyDialogComponent) addLoyalty!: addLoyaltyDialogComponent;
    @ViewChild(deleteLoyaltyDialogComponent) delLoyalty!:deleteLoyaltyDialogComponent;
    @ViewChild(RewardSmsComponent)bDC!:RewardSmsComponent;
    
    
    currencySymbol: any;

    
    

    constructor(private activatedRoute:ActivatedRoute,private sanitizer: DomSanitizer,private cd:ChangeDetectorRef,private smsSVR:SmsService,
         private _rewardsSvr:RewardService){}

    ngAfterViewInit(): void {
        this.addLoyalty.isOk.subscribe(r=>{
            this._rewardsSvr.addRewards(r).subscribe((r:any)=>{
                this.convertImgByte(r).subscribe(r=>{
                    this.rewards.next([...this.rewards.getValue(),r])
                })
                this.addLoyalty.close()
            },(err)=>{});
            
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
            
        });

        this.bDC.rewardSms.subscribe(s=>{
            this.smsSVR.sendMessage(s).subscribe(r=>{
  
            })
            this.bDC.close();
        })
    }

    ngOnInit(): void {
        this.getRewards();
        this.getCustomers()

    }

    
    getCustomers(){
        this.activatedRoute.data.subscribe((cs:any)=>{
            this.customers.next(cs.customers)
            console.log(this,this.customers.getValue())
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
            })
        
    }

    

    onBroadcast(){
        this.bDC.open(this.customers,this.selected[0])
    }

    onAdd(){
        this.addLoyalty.open();
    }

    onDelete()
    {
        this.delLoyalty.open();
    }

    onEdit(){
        this.editLoyalty.open(this.selected[0]);
    }

    

    convertImgByte(x: Rewards):Observable<Rewards>{
        let objectURL = 'data:image/jpeg;base64,' + x.rewardImage;
        x.rewardImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        return of(x);
    };

    
}