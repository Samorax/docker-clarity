import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { Table } from "../Models/Table";
import { TableService } from "../Services/TableService";
import { addTableDialogComponent } from "./addTableDialog.component";
import { editTableDialogComponent } from "./editTableDialog.component";
import { delTableDialogComponent } from "./delTableDialog.component";
import { BehaviorSubject } from "rxjs";
import { table } from "console";

@Component({
    selector:"app-table",
    templateUrl:"./table.component.html",
    changeDetection:ChangeDetectionStrategy.OnPush
})
export class tableComponent implements OnInit, AfterViewInit{
    feedBackMessage!:string;
    tables:BehaviorSubject<any> = new BehaviorSubject<Table[]>([]);
    selected:Table[] = [];
    ifSuccess!: boolean;
    feedBackStatus!: string;
    ifError!: boolean;

    constructor(private _tableSvr:TableService, private cd:ChangeDetectorRef){}
    
    ngOnInit(): void {
        this.getTables();
    }

    ngAfterViewInit(): void {
        this.addTD.isOK.subscribe(t=>{
            
            this._tableSvr.addTable(t).subscribe((ta:any)=>{
                let c = this.tables.getValue();
                this.tables.next([...c,ta])
                this.ifSuccess = true;
                this.feedBackStatus = 'success';
                this.feedBackMessage = `${t.name} successfully added to tables`;
                this.cd.detectChanges()
            },(er:Error)=>
            {
                this.ifError = true;
                this.feedBackStatus = 'warning';
                this.feedBackMessage = `${t.name} cannot be added: ${er.message}`;
                this.cd.detectChanges()
            });
            this.addTD.close();
        });

        this.editTD.isOk.subscribe(t=>{
            this._tableSvr.updateTable(t,t.id).subscribe(r=>{
                let currentTables = this.tables.getValue();
                let indexUpdate =  currentTables.findIndex((ta:any)=>t.id === ta.id)
                currentTables[indexUpdate] = t;
                this.tables.next(currentTables);

                this.ifSuccess = true;
                this.feedBackStatus = 'success';
                this.feedBackMessage = `${t.name} successfully updated`;
                this.cd.detectChanges()
            },(er:Error)=>
            {
                
                this.ifError = true;
                this.feedBackStatus = 'warning';
                this.feedBackMessage = `${t.name} cannot be updated: ${er.message}`;
                this.cd.detectChanges()
            },()=> this.editTD.close())
        });

        this.delTD.isOk.subscribe(t=>{
            this._tableSvr.deleteTable(t).subscribe(r=>{
                let currentTables = this.tables.getValue();
                let undeletedTables = currentTables.filter((ta:Table)=>ta.id !== t.id);
                this.tables.next(undeletedTables);
                this.ifSuccess = true;
                this.feedBackStatus = 'success';
                this.feedBackMessage = `${t.name} successfully deleted`;
                this.cd.detectChanges()
            },(er:Error)=>{
                this.ifError = true;
                this.feedBackStatus = 'warning';
                this.feedBackMessage = `${t.name} cannot be deleted: ${er.message}`;
                this.cd.detectChanges()
            },()=>this.delTD.close())
        })
    }

    @ViewChild(addTableDialogComponent) addTD!:addTableDialogComponent;
    @ViewChild(editTableDialogComponent) editTD!:editTableDialogComponent;
    @ViewChild(delTableDialogComponent) delTD!:delTableDialogComponent;

    onAdd(){
        
        this.addTD.open();
    }

    onEdit(){

        this.editTD.open(this.selected[0]);
    }

    onDelete(){
        this.delTD.open(this.selected[0]);
    }

    getTables(){
        this._tableSvr.getTables().subscribe((t:any)=> {this.tables.next(t);});
    }
}