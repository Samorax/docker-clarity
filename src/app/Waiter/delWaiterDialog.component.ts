import { Component, EventEmitter, Output } from "@angular/core";
import { Waiter } from "../Models/Waiter";

@Component({
    templateUrl:'./delWaiterDialog.component.html',
    selector:'del-waiter'
})

export class delWaiterComponent{

    waiter:Waiter = new Waiter();
    show:boolean = false;
    @Output()isOk:EventEmitter<Waiter> = new EventEmitter<Waiter>();

    open(x:Waiter){
        this.waiter = x;
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(){
        this.isOk.emit(this.waiter);
    }
}


