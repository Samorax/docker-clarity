import { Component, EventEmitter, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Waiter } from "../Models/Waiter";

@Component({
    selector:'app-addWaiter',
    templateUrl:'./addWaiterDialog.component.html'
})

export class addWaiterDialogComponent{
    waiter:Waiter = new Waiter();
    appId = localStorage.getItem("user_id");
    show:boolean = false;
    @Output()isOk:EventEmitter<any> = new EventEmitter<any>()

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(x:NgForm){
        var w = <Waiter>x.value;
        w.applicationUserID = this.appId;
        this.isOk.emit(w);
    }
}