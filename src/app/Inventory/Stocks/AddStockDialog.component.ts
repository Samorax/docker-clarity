import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Product } from "../../Models/Product";
import { Stock } from "../../Models/Stock";

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

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(){
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