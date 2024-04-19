import { Component, EventEmitter, Output } from "@angular/core";
import { Waiter } from "../Models/Waiter";
import { NgForm } from "@angular/forms";

@Component({
    selector:'edit-waiter',
    templateUrl:'./editWaiterDialog.component.html'
})

export class editWaiterComponent{
    waiter:Waiter = new Waiter();
    appId = localStorage.getItem("user_id");
    @Output()isOk:EventEmitter<Waiter> = new EventEmitter<Waiter>();
    show:boolean = false;

    open(x:Waiter){
        this.waiter = x;
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(x:NgForm){
        var w = <Waiter>x.value;
        w.id = this.waiter.id;
        w.applicationUserID = this.appId;
        this.isOk.emit(w);
    }
}