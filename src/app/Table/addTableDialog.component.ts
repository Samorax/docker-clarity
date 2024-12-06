import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from "@angular/core";
import { Table } from "../Models/Table";
import { FormBuilder, NgForm, Validators } from "@angular/forms";

@Component({
    selector:'app-addTable',
    templateUrl:'./addTableDialog.component.html',

})

export class addTableDialogComponent{
    appId = localStorage.getItem("user_id");
    formBuilder = inject(FormBuilder)
    table:Table = new Table();
    show:boolean = false 
    @Output()isOK:EventEmitter<any> = new EventEmitter<any>()

    tableStatus:string[] = ['Available','Occupied','Pending']

    tableForm = this.formBuilder.group({
        name:['',Validators.required],
        maxCovers:['',Validators.required],
        status:['',Validators.required]
    })


    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }



    onSubmit(){
       var x = <Table>this.tableForm.value;
        x.type = 'real';
        x.applicationUserID = this.appId;
        x.status.trim();
        
        this.isOK.emit(x);
    }
}
