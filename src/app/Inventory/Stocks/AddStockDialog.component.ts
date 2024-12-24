import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
<<<<<<< HEAD:src/app/Inventory/AddStockDialog.component.ts
import { Product } from "../Models/Product";
import { Stock } from "../Models/Stock";
import { ClrLoadingState } from "@clr/angular";
=======
import { Product } from "../../Models/Product";
import { Stock } from "../../Models/Stock";
>>>>>>> fbffca7dd94f221062d383b7345b79d0b920637a:src/app/Inventory/Stocks/AddStockDialog.component.ts

@Component({
    selector:'addStock-dialog',
    templateUrl:'../Stocks/AddStockDialog.component.html'
})

export class addStockDialog{

    @Output() onOk: EventEmitter<any> = new EventEmitter<any>();
    @Input()products!:Product[]

    show:boolean = false;
    formBuilder = inject(FormBuilder)
    date!:any
    addStockForm = this.formBuilder.group({
        productId:[0,Validators.required],
        initialUnits:[0,Validators.required],
        prepDate:[this.date,Validators.required],
      })
StockAddBtnState:ClrLoadingState = ClrLoadingState.DEFAULT

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(){
        this.StockAddBtnState = ClrLoadingState.LOADING
        let result = this.addStockForm.value;
        let stk:Stock = {
            prepDate:result.prepDate,
            productID:<number>result.productId,
            initialUnits:<number>result.initialUnits,
            remainingUnits:<number>result.initialUnits,
            stockedDate:new Date(),
            hasWaste:false,
            isExpired:false,
            isDeleted:false,
    
            applicationUserID:localStorage.getItem("user_id")
        }
         this.onOk.emit(stk);

    }

}