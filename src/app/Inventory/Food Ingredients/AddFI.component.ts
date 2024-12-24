import { Component, EventEmitter, inject, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ClrLoadingState } from "@clr/angular";

@Component({
    selector:'addFI-dialog',
    templateUrl:'./AddFI.component.html'    
})
export class AddFIDialogComponent{
    @Output() onOk: EventEmitter<any> = new EventEmitter<any>();
    _formBuilder = inject(FormBuilder);
    addBtnLoader:ClrLoadingState = ClrLoadingState.DEFAULT;

    addFIFrom = this._formBuilder.group({

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
        this.onOk.emit(this.addFIFrom.value);
        this.addBtnLoader = ClrLoadingState.DEFAULT;
        this.close();
    }
}