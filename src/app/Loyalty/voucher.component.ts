import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { voucher } from "../Models/Voucher";
import { voucherService } from "../Services/VoucherService";
import { addVoucherDialogComponent } from "./addVoucherDialog.component";
import { deleteVoucherDialogComponent } from "./deleteVoucherDialog.component";
import { editVoucherDialogComponent } from "./editVoucherDialog.component";
import { SmsService } from "../Services/SmsService";
import { VoucherSmsComponent } from "./voucherSms.component";
import { Customer } from "../Models/Customer";
import { SmSActivatorService } from "../Services/SmsActivatorService";
import { ChangeDetectionStrategy } from "@angular/core";
import { announcementIcon, ClarityIcons, plusIcon, timesCircleIcon } from "@cds/core/icon";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";
ClarityIcons.addIcons(timesCircleIcon,announcementIcon,plusIcon)

@Component({
    templateUrl:'./voucher.component.html',
    selector:'app-voucher',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class voucherComponent implements OnInit, AfterViewInit{
    vouchers:BehaviorSubject<any> = new BehaviorSubject<voucher[]>([]);
    voucher: voucher = new voucher();
    selected:any = [];
    currencySymbol:any;
    status!:string;
    activateBroadcast:boolean = true;

    @ViewChild(addVoucherDialogComponent)addVDC!: addVoucherDialogComponent;
    @ViewChild(editVoucherDialogComponent)editVDC!: editVoucherDialogComponent;
    @ViewChild(deleteVoucherDialogComponent)delVDC!: deleteVoucherDialogComponent;
    @ViewChild(VoucherSmsComponent)bDC!:VoucherSmsComponent;
    customers: BehaviorSubject<Customer[]> = new BehaviorSubject<Customer[]>([]);

    constructor(private  activatedRoute:ActivatedRoute, private _voucherSvr:voucherService, private smsSVR: SmsService,private _smsActivator:SmSActivatorService,private cd:ChangeDetectorRef){}

    ngAfterViewInit(): void {
        this._smsActivator.getState.subscribe(a=>{this.activateBroadcast = a;});

     this.bDC.voucherSms.subscribe(m=>{
            this.smsSVR.sendMessage(m).subscribe(r=>{
  
            })
            this.bDC.close();
        }); 

        this.addVDC.isOk.subscribe((v:any)=>{
            this._voucherSvr.addVoucher(v).subscribe((v:any)=>{
                
               this.vouchers.next([...this.vouchers.getValue(),v])
            },(err)=>console.log(err));
            this.addVDC.close();
        });

        this.editVDC.isOk.subscribe(v=>{
            this._voucherSvr.updateVoucher(v.voucherId,v).subscribe(()=>{
                let currentArray:voucher[] = this.vouchers.getValue();
                let index = currentArray.findIndex(v=>v.voucherId === v.voucherId);
                currentArray[index] = v;
              this.vouchers.next([...currentArray])
            },(er)=>console.log(er));
            this.editVDC.close()
        });

        this.delVDC.isOk.subscribe(v=>{
            v.forEach(v=>{
                this._voucherSvr.deleteVoucher(v.voucherId).subscribe(()=>{
                let latest = this.vouchers.getValue().filter((vo:voucher)=>vo.voucherId !== v.voucherId);
                this.vouchers.next([...latest])
                },(er)=>console.log(er))
                this.delVDC.close();
            })
            
        })

    }

    ngOnInit(): void {
        this.getVouchers();
        this.getCustomers();
        
    }

    getVouchers(){
            this.activatedRoute.data.subscribe((v:any) => 
            {
                this.vouchers.next(v.vouchers.filter((vr:voucher)=>vr.isDeleted !== true));
                this.cd.detectChanges();
                this.currencySymbol = localStorage.getItem('currency_iso_code');
            });
        
    }

    getCustomers(){
        this.activatedRoute.data.subscribe((cs:any)=> 
            {
                this.customers.next(cs.customers);
            })
    }

    onAdd(){
        this.addVDC.open();
    }

    onEdit(){
        this.voucher = this.selected[0];
        this.editVDC.open();
    }

    onDelete(){
        this.delVDC.open();
    }

    onBroadcast(){
        
            this.bDC.open(this.customers,this.selected[0]);
        
       
    }

}