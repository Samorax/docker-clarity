import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { Stock } from "../../Models/Stock";
import { FormBuilder, Validators } from "@angular/forms";
import { Product } from "../../Models/Product";

@Component({
    selector:'editStk-dialog',
    templateUrl:'../Stocks/EditStockDialog.component.html'
})

export class editStockDialogComponent
{
    formBuilder = inject(FormBuilder)
    show:boolean = false;
    @Output()onOk:EventEmitter<Stock> = new EventEmitter<Stock>();
    @Input()products!:Product[]
    stk:Stock = new Stock();
    date!:any

    editStkForm = this.formBuilder.group({
        productId:[0,Validators.required],
        initialUnits:[0,Validators.required],
        prepDate:[this.date,Validators.required],
    })
    

    open(x:Stock)
    {
        this.stk = x;
        this.show = true;
        this.editStkForm.get('productId')?.setValue(<number>x.id)
        this.editStkForm.get('initialUnits')?.setValue(<number>x.initialUnits)
        this.editStkForm.get('prepDate')?.setValue(x.prepDate)

    }

    close(){
        this.show = false;
    }

    onSubmit(){

    }
    
}