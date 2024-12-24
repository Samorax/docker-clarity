import { Component, EventEmitter, inject, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'PO-dialog',
    templateUrl:'./PO.component.html'
})
export class PODialogComponent{
    @Output() onOk: EventEmitter<any> = new EventEmitter<any>();
    _formbuilder = inject(FormBuilder);
    buyBtnLoader:ClrLoadingState = ClrLoadingState.DEFAULT;

    buyForm = this._formbuilder.group([

    ])
    
    show:boolean = false;
    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(){
        this.buyBtnLoader = ClrLoadingState.LOADING;
        this.onOk.emit(this.buyForm.value);
        this.buyBtnLoader = ClrLoadingState.DEFAULT;
        this.close();
    }
}