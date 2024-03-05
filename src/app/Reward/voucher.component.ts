import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { voucher } from "../Models/Voucher";
import { voucherService } from "../Services/VoucherService";
import { addVoucherDialogComponent } from "./addVoucherDialog.component";
import { editLoyaltyDialogComponent } from "./editLoyaltyDialog.component";
import { deleteVoucherDialogComponent } from "./deleteVoucherDialog.component";
import { editVoucherDialogComponent } from "./editVoucherDialog.component";

@Component({
    templateUrl:'./voucher.component.html',
    selector:'app-voucher'
})

export class voucherComponent implements OnInit, AfterViewInit{
    vouchers!:voucher[];
    voucher: voucher = new voucher();
    selected:any = [];
    currencySymbol:any;
    status!:string;

    @ViewChild(addVoucherDialogComponent)addVDC!: addVoucherDialogComponent;
    @ViewChild(editVoucherDialogComponent)editVDC!: editVoucherDialogComponent;
    @ViewChild(deleteVoucherDialogComponent)delVDC!: deleteVoucherDialogComponent;

    constructor(private _voucherSvr: voucherService){}

    ngAfterViewInit(): void {
        this.addVDC.isOk.subscribe(v=>{
            this._voucherSvr.addVoucher(v).subscribe((v:any)=>{
                this._voucherSvr.getVoucherCache.push(v);
            },(err)=>console.log(err),()=> this.addVDC.close());
        });

        this.editVDC.isOk.subscribe(v=>{
            this._voucherSvr.updateVoucher(v.voucherId,v).subscribe(()=>{

            },(er)=>console.log(er),()=>this.editVDC.close());
        });

        this.delVDC.isOk.subscribe(v=>{
            v.forEach(v=>{
                this._voucherSvr.deleteVoucher(v.voucherId).subscribe(()=>{
                    let index = this._voucherSvr.getVoucherCache.indexOf(v);
                    this._voucherSvr.getVoucherCache.splice(index,1);
                },(er)=>console.log(er),()=> this.delVDC.close())
            })
            
        })

    }

    ngOnInit(): void {
        this.getVouchers();
    }

    getVouchers(){
        let cache = this._voucherSvr.getVoucherCache;
        if(cache.length != 0){
            this.vouchers = cache;
            this.currencySymbol = localStorage.getItem('currency_iso_code');
        }else{
            this._voucherSvr.getVouchers().subscribe((v:any) => 
            {
                this.vouchers = v;
                this._voucherSvr.getVoucherCache = v;
                this.currencySymbol = localStorage.getItem('currency_iso_code');
            });
        }
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

}