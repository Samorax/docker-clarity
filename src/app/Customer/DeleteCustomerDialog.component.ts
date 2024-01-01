import { Component, EventEmitter, Output } from "@angular/core";
import { Customer } from "../Models/Customer";

@Component({
    selector:'del-customer',
    templateUrl:'./DeleteCustomerDialog.component.html'
})

export class DeleteCustomerDialogComponent{
    customers!:Customer[];
    @Output() onOK: EventEmitter<Customer[]> = new EventEmitter<Customer[]>();
    show:boolean = false;

    open(cust: Customer[]){
        this.customers = cust;
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onConfirm(){
        this.onOK.emit(this.customers);
    }
}