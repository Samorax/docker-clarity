import { Component, EventEmitter, inject, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'editSupplier-dialog',
    templateUrl:'../Supplier/EditSupplierDialog.component.html' 
})
export class EditSupplierDialogComponent{
    @Output()onOk = new EventEmitter();
    _formBuilder = inject(FormBuilder);
    editBtnLoader:ClrLoadingState = ClrLoadingState.DEFAULT;

    editSupplierForm = this._formBuilder.group({

    });

    show:boolean = false;
    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(){
        this.editBtnLoader = ClrLoadingState.LOADING;
        this.onOk.emit(this.editSupplierForm.value);
        this.editBtnLoader = ClrLoadingState.DEFAULT;
        this.close();
    }
}