import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { addLoyaltyDialogComponent } from "./addLoyaltyDialog.component";
import { Product } from "../Models/Product";
import { Rewards } from "../Models/Rewards";
import { ProductService } from "../Services/ProductService";
import { RewardService } from "../Services/RewardService";
import { voucherService } from "../Services/VoucherService";
import { voucher } from "../Models/Voucher";
import { editLoyaltyDialogComponent } from "./editLoyaltyDialog.component";
import { deleteLoyaltyDialogComponent } from "./deleteLoyaltyDialog.component";
import { Observable, of } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
    templateUrl:'./loyalty.component.html',
    selector:'app-loyalty',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class loyaltyComponent implements OnInit, AfterViewInit
{
    selectedProducts:any = []
    selected:any = []
    redeemPts!:number
    vouchers!:voucher[];
    products!: Product[]
    rewards!:Rewards[]
    reward:Rewards = new Rewards();
    @ViewChild(editLoyaltyDialogComponent) editLoyalty!: editLoyaltyDialogComponent;
    @ViewChild(addLoyaltyDialogComponent) addLoyalty!: addLoyaltyDialogComponent;
    @ViewChild(deleteLoyaltyDialogComponent) delLoyalty!:deleteLoyaltyDialogComponent;
    currencySymbol: any;

    
    

    constructor(private _productSvr: ProductService, private _voucherSvr: voucherService,private sanitizer: DomSanitizer,private _formBuilder: FormBuilder,private cd:ChangeDetectorRef,
         private _rewardsSvr:RewardService){}

    ngAfterViewInit(): void {
        this.addLoyalty.isOk.subscribe(r=>{
            this._rewardsSvr.addRewards(r).subscribe((r:any)=>{
                this.convertImgByte(r).subscribe(r=>{
                    this._rewardsSvr.rewardsCache.push(r);
                })
            },(err)=>{},()=> this.addLoyalty.close());
            this.cd.detectChanges()
        });

        this.editLoyalty.isOk.subscribe((r:FormData)=>{
            let id = r.get('rewardsId');
        
            this._rewardsSvr.updateRewards(id,r).subscribe(()=>{

            },(er)=>console.log(er),()=>this.editLoyalty.close())
        });

        this.delLoyalty.isOk.subscribe(r=>{
            r.forEach(r=> {
                this._rewardsSvr.deleteRewards(r.rewardsId).subscribe(()=>{
                    let index = this.rewards.indexOf(r);
                    this._rewardsSvr.rewardsCache.splice(index,1);

                },(er)=> console.log(er),()=>this.delLoyalty.close())
            })
            this.cd.detectChanges()
        });
    }

    ngOnInit(): void {
        this.getVouchers();
        this.getProductswithLoyaltyPoints();
        this.getRewards();

    }

    getProductswithLoyaltyPoints(){
        let cache = this._productSvr.productssCache;
        if(cache.length != 0){
            this.products = cache.filter(p=> p.loyaltyPoints != 0);
        }else{
            this._productSvr.getProducts().subscribe(p=>{
                this.products = p.filter(p=>p.loyaltyPoints != 0)
            })
        }
    }

    getRewards(){
       
            this._rewardsSvr.getRewards().subscribe(r=>{
                r.forEach(rt=>{
                    this.convertImgByte(rt).subscribe(rx=>{
                        this.rewards = [];
                        this.rewards.push(rx);
                        this._rewardsSvr.rewardsCache.push(rx);
                    })
                })
                this.cd.detectChanges();
            })
        
    }

    getVouchers(){
            this._voucherSvr.getVouchers().subscribe((v:any) => 
            {
                this.vouchers = v;
                this._voucherSvr.getVoucherCache = v;
                this.currencySymbol = localStorage.getItem('currency_iso_code');
            });
        
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