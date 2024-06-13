import { Component, EventEmitter, Output } from "@angular/core";
import { OpenTimes } from "../Models/OpenTimes";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
    selector:'app-editoperatingdays',
    templateUrl:'./editOperatingDays.component.html'
})

export class editOperatingDaysComponent{
    constructor(private _formBuilder:FormBuilder){}
    @Output()isOk:EventEmitter<OpenTimes> = new EventEmitter<OpenTimes>();
openTimesForm = this._formBuilder.group({
    day:['',Validators.required],
    startTime:['',Validators.required],
    endTime:['',Validators.required]
});
daysOfWeek:string[]=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    opentime!:OpenTimes;
    show:boolean = false;
    open(x:OpenTimes){
        this.opentime = x;
        this.openTimesForm.get('day')?.setValue(this.opentime.day)
        this.openTimesForm.get('startTime')?.setValue(this.opentime.startTime)
        this.openTimesForm.get('endTime')?.setValue(this.opentime.endTime)
        this.show = true;
    }

    close(){
        this.show= false;
    }

    onSave(){
       let em = <OpenTimes>this.openTimesForm.value;
       em.applicationUserID = this.opentime.applicationUserID;
       em.id = this.opentime.id;
        this.isOk.emit(em);
    }
}