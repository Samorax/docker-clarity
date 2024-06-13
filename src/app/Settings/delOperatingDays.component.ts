import { Component, EventEmitter, Output } from "@angular/core";
import { OpenTimes } from "../Models/OpenTimes";

@Component({
    selector:'app-deloperatingdays',
    templateUrl:'./delOperatingDays.component.html'
})

export class delOperatingDaysComponent{
    @Output()isOk:EventEmitter<OpenTimes[]> = new EventEmitter<OpenTimes[]>();
    opentimes!:OpenTimes[]
    show:boolean = false
    open(x:OpenTimes[]){
        this.opentimes = x;
        this.show = true;
    }

    close(){
        this.show = false;
    }

    onConfirm(){
        this.isOk.emit(this.opentimes);
    }
}