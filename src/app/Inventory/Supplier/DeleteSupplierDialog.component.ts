import { Component, EventEmitter, inject, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'deleteSupplier-dialog',
    templateUrl:'../Supplier/DeleteSupplierDialog.component.html'
})
export class DeleteSupplierDialogComponent{
    @Output()onOK:EventEmitter<any> = new EventEmitter();
    _formBuilder = inject(FormBuilder);
    delBtnLoader:ClrLoadingState = ClrLoadingState.DEFAULT;
    
    deleteSupplierForm = this._formBuilder.group({

    });

    show:boolean = false;
    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(){
        this.delBtnLoader = ClrLoadingState.LOADING;
        this.onOK.emit(this.deleteSupplierForm.value);
        this.delBtnLoader = ClrLoadingState.DEFAULT;
        this.close();
    }
}