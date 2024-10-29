import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Order } from "../Models/Order.model";
import { paymentService } from "../Services/PaymentService";
import moment from "moment";
import { BehaviorSubject } from "rxjs";


@Component({
    selector:'reconcile-order',
    templateUrl:'./OrderReconcile.component.html'
})

export class OrderReconcileComponent{

selectionChanged($event: any[]) {
    this.total = 0;
  this.orderToReconcile.forEach(o=> this.total += o.totalAmount);
  this.selected.forEach(s=> this.total -= s.totalAmount);
  this.balance.next(this.total);
}
paymentService = inject(paymentService);

startDate: any;
EndDate:any;
balance: BehaviorSubject<number> = new BehaviorSubject<number>(0.00);
currencySymbol: string = this.paymentService.currencySymbol;

@Input() orders!:Order[] 
@Output() reconcileDialog: EventEmitter<Order[]> = new EventEmitter<Order[]>();
show:boolean = false;
orderToReconcile:Order[] =[];

selected: Order[] = [];
total: number = 0.00;



onSelectedDate() {
 this.orderToReconcile = this.orders.filter(o=>moment(o.orderDate).toDate() >=  this.startDate && moment(o.orderDate).toDate() <= this.EndDate && o.isDeleted == false);
 this.orderToReconcile.forEach(o=> this.total += o.totalAmount);
 this.balance.next(this.total);
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