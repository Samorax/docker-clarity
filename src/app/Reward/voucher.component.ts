import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { voucher } from "../Models/Voucher";
import { voucherService } from "../Services/VoucherService";
import { addVoucherDialogComponent } from "./addVoucherDialog.component";
import { editLoyaltyDialogComponent } from "./editLoyaltyDialog.component";
import { deleteVoucherDialogComponent } from "./deleteVoucherDialog.component";
import { editVoucherDialogComponent } from "./editVoucherDialog.component";
import { broadcastDialogComponent } from "./broadcastDialog.component";
import { SmsService } from "../Services/SmsService";
import { VoucherSmsComponent } from "./voucherSms.component";
import { CustomerService } from "../Services/CustomerService";
import { Customer } from "../Models/Customer";
import { SmSActivatorService } from "../Services/SmsActivatorService";
import { log } from "console";
import { ChangeDetectionStrategy } from "@angular/core";
import { announcementIcon, ClarityIcons, plusCircleIcon, plusIcon, timesCircleIcon } from "@cds/core/icon";
import { ClrLoadingState } from "@clr/angular";
ClarityIcons.addIcons(timesCircleIcon,announcementIcon,plusIcon)

@Component({
    templateUrl:'./voucher.component.html',
    selector:'app-voucher',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class voucherComponent implements OnInit, AfterViewInit{
    vouchers!:voucher[];
    voucher: voucher = new voucher();
    selected:any = [];
    currencySymbol:any;
    status!:string;
    activateBroadcast:boolean = true;

    @ViewChild(addVoucherDialogComponent)addVDC!: addVoucherDialogComponent;
    @ViewChild(editVoucherDialogComponent)editVDC!: editVoucherDialogComponent;
    @ViewChild(deleteVoucherDialogComponent)delVDC!: deleteVoucherDialogComponent;
    @ViewChild(VoucherSmsComponent)bDC!:VoucherSmsComponent;
    customers!: Customer[];

    constructor(private _voucherSvr: voucherService, private smsSVR: SmsService, private custSVR: CustomerService,private _smsActivator:SmSActivatorService,private cd:ChangeDetectorRef){}

    ngAfterViewInit(): void {
        this._smsActivator.getState.subscribe(a=>{this.activateBroadcast = a;});

     this.bDC.voucherSms.subscribe(m=>{
            this.smsSVR.sendMessage(m).subscribe(r=>{
  
            })
            this.bDC.close();
        }); 

        this.addVDC.isOk.subscribe((v:any)=>{
            this._voucherSvr.addVoucher(v).subscribe((v:any)=>{
                this.addVDC.addButtonActivity = ClrLoadingState.DEFAULT
                this.addVDC.close();
            },(err)=>console.log(err));
        });

        this.editVDC.isOk.subscribe(v=>{
            this._voucherSvr.updateVoucher(v.voucherId,v).subscribe(()=>{
                this.editVDC.close()
            },(er)=>console.log(er));
        });

        this.delVDC.isOk.subscribe(v=>{
            v.forEach(v=>{
                this._voucherSvr.deleteVoucher(v.voucherId).subscribe(()=>{
                    let index = this._voucherSvr.getVoucherCache.indexOf(v);
                    this._voucherSvr.getVoucherCache.splice(index,1);
                    this.delVDC.close();
                },(er)=>console.log(er))
            })
            
        })

    }

    ngOnInit(): void {
        this.getVouchers();
        this.getCustomers();
        
    }

    getVouchers(){
            this._voucherSvr.getVouchers().subscribe((v:any) => 
            {
                this.vouchers = v;
                this.cd.detectChanges();
                this.currencySymbol = localStorage.getItem('currency_iso_code');
            });
        
    }

    getCustomers(){
        this.custSVR.getCustomers().subscribe(cs=> this.customers = cs)
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
        this.bDC.open(this.selected[0], this.customers);
    }

}