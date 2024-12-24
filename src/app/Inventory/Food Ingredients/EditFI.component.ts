import { Component, EventEmitter, inject, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'editFI-dialog',
    templateUrl:'./EditFI.component.html'
})
export class EditFIDialogComponent{
    @Output() onOk: EventEmitter<any> = new EventEmitter<any>();
    _formBuilder = inject(FormBuilder);
    editBtnLoader:ClrLoadingState = ClrLoadingState.DEFAULT;

    editFIFrom = this._formBuilder.group({

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
        this.onOk.emit(this.editFIFrom.value);
        this.editBtnLoader = ClrLoadingState.DEFAULT;
        this.close();
    }
}

