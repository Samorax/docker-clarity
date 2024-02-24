import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Table } from "../Models/Table";
import { TableService } from "../Services/TableService";
import { addTableDialogComponent } from "./addTableDialog.component";

@Component({
    selector:"app-table",
    templateUrl:"./table.component.html"
})
export class tableComponent implements OnInit, AfterViewInit{
    tables:Table[] = [];
    selected:Table[] = [];

    constructor(private _tableSvr:TableService){}
    ngOnInit(): void {
        this.getTables();
    }

    ngAfterViewInit(): void {
        this.addTD.isOK.subscribe(t=>{
            
            this._tableSvr.addTable(t).subscribe((t:any)=>{
                this.tables.push(t);
            })
        })
    }
    @ViewChild(addTableDialogComponent) addTD = new addTableDialogComponent();
    onAdd(){
        this.addTD.open();
    }

    onEdit(){

    }

    onDelete(){

    }

    getTables(){
        this._tableSvr.getTables().subscribe((t:any)=> this.tables = t)
    }
}