import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Rewards } from "../Models/Rewards";
import { NgForm } from "@angular/forms";

@Component({
    selector:'del-loyalty',
    templateUrl:'./deleteLoyaltyDialog.component.html'
})

export class deleteLoyaltyDialogComponent{
    @Input() rewards!: Rewards[];
    @Output() isOk: EventEmitter<Rewards[]> = new EventEmitter<Rewards[]>();
    show:boolean = false;

    open(){
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onConfirm(){
        this.isOk.emit(this.rewards);
    }

    
}