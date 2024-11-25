import { Component, EventEmitter, inject, Output } from "@angular/core";
import { Stock } from "../Models/Stock";
import { FormBuilder, Validators } from "@angular/forms";
import { stockService } from "../Services/Stock/StockService";
import { Restock } from "../Models/Restock.model";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'restock-dialog',
    templateUrl:'../Inventory/RestockDialog.component.html'
})

export class restockDialogComponent
{
    formBuilder = inject(FormBuilder)
    show:boolean = false;
    @Output()onOk:EventEmitter<Restock> = new EventEmitter<Restock>();
    stk:Stock = new Stock();
    date!:any
    showAddStockForm: boolean = false;
    showReStockForm: boolean = false;
    restockBtn:ClrLoadingState = ClrLoadingState.DEFAULT

    reStockForm = this.formBuilder.group({
        additionalUnits:[0, Validators.required]
    })

    addStockForm = this.formBuilder.group({
        productName:[],
        initialUnits:[0,Validators.required],
        prepDate:[this.date,Validators.required]
    })
    showConfirmWasteDialog: boolean = false;
    

    open(s:Stock)
    {
        this.stk = s;
        if(new Date(s.stockedDate).toDateString() !== new Date().toDateString()){
            if(s.remainingUnits !== 0){
                this.showConfirmWasteDialog = true;
            }else{
                this.showAddStockForm = true;

                this.addStockForm.get('productName')?.disable();
                this.addStockForm.get('productName')?.setValue(this.stk.product?.name);
            }  
        }
        else{
            this.showReStockForm = true;
        }
    
    }
    onConfirmWaste(){
        this.stk.hasWaste = true;
        this.showConfirmWasteDialog = false;

        
        let x:any = this.addStockForm.get('productName');
        x.setValue(this.stk.product?.name);
        x.disable();
        
        this.showAddStockForm = true;
        
    }

    onConfirmNoWaste(){
        this.showConfirmWasteDialog = false;

        this.showAddStockForm = true;
        let x:any = this.addStockForm.get('productName');
        x.setValue(this.stk.product?.name);
        x.disable();
    }

    close()
    {
        this.showAddStockForm = false;
        this.showReStockForm = false;
    }

    onSubmit()
    {
        this.restockBtn = ClrLoadingState.LOADING
        //if just restocking - update the units of the stock and update server.
        //otherwise, create a new and old stock, add and update respectively to server.

        if(this.showReStockForm){
            let a = <number>this.reStockForm.value.additionalUnits;
            this.stk.remainingUnits = <number>this.stk.remainingUnits + a;
            console.log(this.stk)
            this.onOk.emit({oldStock:this.stk,newStock:null});
        }
        else{
            this.stk.isExpired = true;
            //this.stk.hasWaste = this.stk.remainingUnits === 0 ? false: true;

            let newStock:Stock = 
            {   productID:this.stk.product?.productID,
                initialUnits:<number>this.addStockForm.value.initialUnits,
                prepDate:this.addStockForm.value.prepDate,
                remainingUnits:<number>this.addStockForm.value.initialUnits,
                stockedDate:new Date(),
                hasWaste:false,
                isExpired:false,
                isDeleted:false,
                applicationUserID:localStorage.getItem("user_id")
            }
            this.onOk.emit({oldStock:this.stk,newStock:newStock})
        }
        
    }
}