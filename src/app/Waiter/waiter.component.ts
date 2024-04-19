import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Waiter } from "../Models/Waiter";
import { WaiterService } from "../Services/WaiterService";
import { addWaiterDialogComponent } from "./addWaiterDialog.component";
import { delWaiterComponent } from "./delWaiterDialog.component";
import { editWaiterComponent } from "./editWaiterDialog.component";

@Component({
    selector:'app-waiter',
    templateUrl:'./waiter.component.html'
})

export class waiterComponent implements OnInit, AfterViewInit{
    waiters:Waiter[] = [];
    selected:Waiter[] = [];
    @ViewChild(addWaiterDialogComponent)aWD = new addWaiterDialogComponent();
    @ViewChild(delWaiterComponent)dWD = new delWaiterComponent();
    @ViewChild(editWaiterComponent)eWD = new editWaiterComponent();
    ifSuccess!: boolean;
    feedBackStatus!: string;
    feedBackMessage!: string;
    ifError!: boolean;

    constructor(private wSvr:WaiterService){}
    ngOnInit(): void {
        this.getWaiters();
    }

    ngAfterViewInit(): void {
        this.aWD.isOk.subscribe((w:Waiter)=>{
            this.wSvr.addWaiter(w).subscribe((w:any)=>{
                this.waiters.push(w);
                this.ifSuccess = true;
                this.feedBackStatus = 'success';
                this.feedBackMessage = `${w.name} successfully added`;
            })
        },(er:Error)=>{
            this.ifError = true;
            this.feedBackStatus = 'warning';
            this.feedBackMessage = `Waiter not added: ${er.message}`;
        },()=>this.aWD.close());

        this.dWD.isOk.subscribe((w:Waiter)=>{
            this.wSvr.deleteWaiter(w).subscribe((r:any)=>{
                this.waiters.splice(this.waiters.indexOf(w),1);
                this.ifSuccess = true;
                this.feedBackStatus = 'success';
                this.feedBackMessage = `${w.name} successfully deleted`;
            })
        },(er:Error)=>{
            this.ifError = true;
            this.feedBackStatus = 'warning';
            this.feedBackMessage = `Waiter could not be deleted: ${er.message}`;
        },()=>this.dWD.close()
        )

        this.eWD.isOk.subscribe((w:Waiter)=>{
            this.wSvr.updateWaiter(w,w.id).subscribe((r:any)=>{
                this.ifSuccess = true;
                this.feedBackStatus = 'success';
                this.feedBackMessage = `${w.name} successfully updated`;
            },(er:Error)=>{
                this.ifError = true;
                this.feedBackStatus = 'warning';
                this.feedBackMessage = `Waiter could not be updated: ${er.message}`;
            },()=> this.eWD.close())
        })
    }

    getWaiters(){
        this.wSvr.getWaiters().subscribe((w:Waiter[])=> {
            this.waiters = w.filter(c=>c.name.includes("Takeaway") == false);
        });
    }

    onAdd(){
        this.aWD.open();
    }

    onEdit(){
        this.eWD.open(this.selected[0]);
    }

    onDelete(){
        this.dWD.open(this.selected[0]);
    }
}