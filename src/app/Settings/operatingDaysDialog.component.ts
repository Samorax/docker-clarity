import { Component, EventEmitter, Output } from "@angular/core";

import { OpenTimes } from "../Models/OpenTimes";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
    selector:'app-operatingdays',
    templateUrl:'./operatingDays.component.html'
})

export class operatingDaysComponent{
    constructor(private _formBuilder:FormBuilder){}
@Output()isOk:EventEmitter<OpenTimes> = new EventEmitter<OpenTimes>();
openTimesForm = this._formBuilder.group({
    day:['',Validators.required],
    startTime:['',Validators.required],
    endTime:['',Validators.required]
});
daysOfWeek:string[]=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
show:boolean = false;

open(){
    this.show = true;
}

close(){
    this.show = false;
}

onAdd(){    
    let em = <OpenTimes>this.openTimesForm.value;
    em.applicationUserID = localStorage.getItem('user_id');
    this.isOk.emit(em);

}

}