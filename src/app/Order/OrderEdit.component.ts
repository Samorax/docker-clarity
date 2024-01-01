import { Component, EventEmitter, Output } from "@angular/core";
import { Order } from "../Models/Order.model";
import { NgForm } from "@angular/forms";

@Component({
    selector:'edit-order',
    templateUrl:'./OrderEdit.component.html'
})

export class OrderEditComponent{
    @Output() editdialog: EventEmitter<Order> = new EventEmitter<Order>();
    show:boolean = false;
    order!: Order;
    
    monitorValue(){

    }
    
    open(oda: Order){
        this.order = oda;
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onSubmit(f:NgForm){
        this.editdialog.emit(f.value);
    }
}