import { Injectable } from "@angular/core";
import { Customer } from "../../Models/Customer";
import { Observable } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class ageDemographicService
{
    
    //using a pie chart, display the %s of repate customers based on their ages.
    //argument: array of repeat customers or ALL Customers.
    calDRepeatCustomers(customers:Observable<Customer[]>): any{
        
        let millenials: Customer[] = [];
        let genZ: Customer[] = [];
        let genX: Customer[] = [];
        let babyBommers: Customer[] = []
        let children: Customer[] = []

        type stringDictionay = Record<string,number>;

        let ages: stringDictionay = {
            "below-18":0,
            "18-26":0,
            "27-42":0,
            "43-58":0,
            "59-and-above":0
        };

        customers.subscribe(x=>{
            x.forEach(c=>{
                let age = this.getAge(new Date(c.birthday));
                if(age >= 18 && age <=26){
                    genZ.push(c);
                }else if(age >= 27 && age <= 42){
                    millenials.push(c);
                }else if(age >= 43 && age <= 53){
                    genX.push(c);
                }else if(age >= 59){
                    babyBommers.push(c)
                }else if(age < 18){
                    children.push(c)
                }
            });
            ages["18-26"] = (genZ.length/x.length)*100;
            ages["27-42"] = (millenials.length/x.length)*100;
            ages["43-58"] = (genX.length/x.length)*100;
            ages["59-and-above"]=(babyBommers.length/x.length)*100;
            ages["below-18"]=(children.length/x.length)*100;
        })

        return ages;
    }

    getAge(d1:any, d2?:any){
        d2 = d2 || new Date();
        var diff = d2.getTime() - d1.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
    }

}