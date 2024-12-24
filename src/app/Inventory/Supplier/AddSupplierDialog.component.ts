import { Component, EventEmitter, inject, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'addSupplier-dialog',
    templateUrl:'../Supplier/AddSupplierDialog.component.html'
})
export class AddSupplierDialogComponent{
    _formBuilder = inject(FormBuilder);
    @Output()onOK:EventEmitter<any> = new EventEmitter();
    addBtnLoader:ClrLoadingState = ClrLoadingState.DEFAULT;

    addSupplierForm = this._formBuilder.group({

    });

    show:boolean = false;
    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(){
        this.addBtnLoader = ClrLoadingState.LOADING;
        this.onOK.emit(this.addSupplierForm.value);
        this.addBtnLoader = ClrLoadingState.DEFAULT
        this.close();
    }
}