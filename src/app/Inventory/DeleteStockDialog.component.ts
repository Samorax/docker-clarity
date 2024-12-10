import { Component,EventEmitter, Output } from "@angular/core";
import { Stock } from "../Models/Stock";


@Component({
    selector:'deleteStk-dialog',
    templateUrl:'../Inventory/DeleteStockDialog.component.html'
})

export class deleteStockDialogComponent
{
    @Output()onOk:EventEmitter<Stock> = new EventEmitter<Stock>();
    show:boolean = false;
    stk:Stock = new Stock();
    showConfirmWasteDialog: boolean = false;
    showDeleteDialog: boolean = false;

    open(s:Stock)
    {
        this.stk = s;
        if(s.remainingUnits !== 0){
            this.showConfirmWasteDialog = true;
        }else{
            this.showDeleteDialog = true;
        }
        
    }

    onConfirmNoWaste(){
        this.showConfirmWasteDialog = false;
        this.showDeleteDialog = true;
    }
    
    onConfirmWaste(){
        this.stk.hasWaste = true;
        this.showDeleteDialog = true;
        this.showConfirmWasteDialog = false;
    }

    close(){
        this.showDeleteDialog = false;
    }

    onConfirm(){
        this.stk.isDeleted = true;
        this.onOk.emit(this.stk);
    }
}