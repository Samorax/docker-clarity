import { Component, EventEmitter, Output } from "@angular/core";

@Component({
    selector:'app-deleteaccount',
    templateUrl:'./deleteaccount.component.html'
})

export class deleteAccountComponent{
    show:boolean = false;
    @Output()isOk:EventEmitter<boolean> = new EventEmitter<boolean>()

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onConfirm(){
        this.isOk.emit(true);
    }
    

}