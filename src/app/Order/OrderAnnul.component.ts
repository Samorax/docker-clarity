import { Component, EventEmitter, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Order } from "../Models/Order.model";


@Component({
    selector:'annul-order',
    templateUrl:'./OrderAnnul.component.html'
})

export class OrderAnnulComponent{
    @Output() annuldialog: EventEmitter<Order> = new EventEmitter<Order>();
    show:boolean = false;
    order!: Order;
    
    
    
    open(oda: Order){
        this.order = oda;
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onAnnul(){
        this.annuldialog.emit(this.order);
    }
}