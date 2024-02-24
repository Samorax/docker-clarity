import { Component, EventEmitter, Output } from "@angular/core";
import { Table } from "../Models/Table";
import { NgForm } from "@angular/forms";

@Component({
    templateUrl:'./addTableDialog.component.html',
    selector:'app-addTable'
})

export class addTableDialogComponent{
    appId = localStorage.getItem("user_id");
    table:Table = new Table();
    show:boolean = false 
    @Output()isOK:EventEmitter<any> = new EventEmitter<any>()

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(t:NgForm){
       var x = <Table>t.value;
       x.applicationUserID = this.appId;
       this.isOK.emit(x);
    }
}
