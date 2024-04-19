import { Component, EventEmitter, Output } from "@angular/core";
import { Table } from "../Models/Table";
import { NgForm } from "@angular/forms";

@Component({
    selector:'edit-table',
    templateUrl:'./editTableDialog.component.html'
})

export class editTableDialogComponent {
    constructor() {
    }
    table:Table = new Table();
    show:boolean = false;
    @Output()isOk:EventEmitter<Table> = new EventEmitter<Table>();

    open(x:Table){
        this.table = x;
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(x:NgForm){
        let t = <Table>x.value;
        t.id = this.table.id;
        t.applicationUserID = this.table.applicationUserID;
        t.type = 'real';
        this.isOk.emit(t);
    }
}