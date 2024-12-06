import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Order } from "../Models/Order.model";
import { paymentService } from "../Services/PaymentService";
import moment from "moment";
import { BehaviorSubject } from "rxjs";


@Component({
    selector:'reconcile-order',
    templateUrl:'./OrderReconcile.component.html',
    styleUrl:'./OrderReconcile.component.css'
})

export class OrderReconcileComponent{
formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
selectionChanged($event: any[]) {
  this.total = 0;
  this.selected.forEach(s=> this.total += s.totalAmount);
  this.actualBalance.next(Number(this.formatter.format(this.total)));
  this.discrepancy.next(Number(this.formatter.format(this.endBalance.getValue() - this.actualBalance.getValue())))
}
paymentService = inject(paymentService);

startDate: any;
EndDate:any;
endBalance: BehaviorSubject<number> = new BehaviorSubject<number>(0.00);
actualBalance: BehaviorSubject<number> = new BehaviorSubject<number>(0.00);
discrepancy: BehaviorSubject<number> = new BehaviorSubject<number>(0.00);
currencySymbol: string = this.paymentService.currencySymbol;

@Input() orders!:Order[] 
@Output() reconcileDialog: EventEmitter<Order[]> = new EventEmitter<Order[]>();
show:boolean = false;
orderToReconcile:Order[] =[];

selected: Order[] = [];
total: number = 0.00;



onSelectedDate() {
 this.orderToReconcile = this.orders.filter(o=>moment(o.orderDate).toDate() >=  this.startDate && moment(o.orderDate).toDate() <= this.EndDate && o.isDeleted == false);
 
}

onAddEndbalance(x:string){
    this.endBalance.next(Number(x))
    this.show = true;
}

    

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onReconcile(){
        this.reconcileDialog.emit(this.selected);
    }
}