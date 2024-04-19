import { Component, EventEmitter, Output } from "@angular/core";
import { Table } from "../Models/Table";

@Component({
    selector:'del-table',
    templateUrl:'./delTableDialog.component.html'
})

export class delTableDialogComponent {
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

    onDelete(){
        this.isOk.emit(this.table);
    }
}