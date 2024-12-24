import { Component, EventEmitter, inject, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'deleteFI-dialog',
    templateUrl:'./DeleteFI.component.html'
})
export class DeleteFIDialogComponent{
    @Output() onOk: EventEmitter<any> = new EventEmitter<any>();
    _formBuilder = inject(FormBuilder);
    delBtnLoader:ClrLoadingState = ClrLoadingState.DEFAULT;

    deleteFIFrom = this._formBuilder.group({

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
        this.onOk.emit(this.deleteFIFrom.value);
        this.delBtnLoader = ClrLoadingState.DEFAULT;
        this.close();
    }
}
