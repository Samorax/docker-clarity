import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Waiter } from "../Models/Waiter";
import { WaiterService } from "../Services/WaiterService";
import { addWaiterDialogComponent } from "./addWaiterDialog.component";

@Component({
    selector:'app-waiter',
    templateUrl:'./waiter.component.html'
})

export class waiterComponent implements OnInit, AfterViewInit{
    waiters:Waiter[] = [];
    selected:Waiter[] = [];
    @ViewChild(addWaiterDialogComponent)aWD = new addWaiterDialogComponent();
    constructor(private wSvr:WaiterService){}
    ngOnInit(): void {
        this.getWaiters();
    }
    ngAfterViewInit(): void {
        this.aWD.isOk.subscribe(w=>{
            this.wSvr.addWaiter(w).subscribe((w:any)=>{
                this.waiters.push(w);
            })
        })
    }

    getWaiters(){
        this.wSvr.getWaiters().subscribe((w:any)=> this.waiters = w);
    }

    onAdd(){
        this.aWD.open();
    }

    onEdit(){

    }

    onDelete(){

    }
}