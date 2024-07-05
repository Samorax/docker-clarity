import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { Waiter } from "../Models/Waiter";
import { WaiterService } from "../Services/WaiterService";
import { addWaiterDialogComponent } from "./addWaiterDialog.component";
import { delWaiterComponent } from "./delWaiterDialog.component";
import { editWaiterComponent } from "./editWaiterDialog.component";

@Component({
    selector:'app-waiter',
    templateUrl:'./waiter.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush
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

    constructor(private wSvr:WaiterService, private cd: ChangeDetectorRef){}
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
                this.cd.detectChanges();
            })
        },(er:Error)=>{
            this.ifError = true;
            this.feedBackStatus = 'warning';
            this.feedBackMessage = `Waiter not added: ${er.message}`;
            this.cd.detectChanges();
        },()=>this.aWD.close());

        this.dWD.isOk.subscribe((w:Waiter)=>{
            this.wSvr.deleteWaiter(w).subscribe((r:any)=>{
                this.waiters.splice(this.waiters.indexOf(w),1);
                this.ifSuccess = true;
                this.feedBackStatus = 'success';
                this.feedBackMessage = `${w.name} successfully deleted`;
                this.cd.detectChanges();
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
                this.cd.detectChanges();
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
            this.cd.detectChanges();
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