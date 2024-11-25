import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { Customer } from "../Models/Customer";
import { CustomerService } from "../Services/Customer/CustomerService";
import { DeleteCustomerDialogComponent } from "./DeleteCustomerDialog.component";
import { SignalrService } from "../Services/Signalr.Service";
import { ClarityIcons, timesCircleIcon } from "@cds/core/icon";
ClarityIcons.addIcons(timesCircleIcon)

@Component({
    selector:'app-customers',
    templateUrl:'./customerlist.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush
})

//Customer recruitments is made through clients (Mobile app or websites) 
//This is to encourage usage of those platforms.

export class CustomerListComponent implements OnInit, AfterViewInit{
    elements: Customer[] = [];
    currency: any = localStorage.getItem('currency_iso_code');
    @ViewChild(DeleteCustomerDialogComponent) deleteCustomerDialog!: DeleteCustomerDialogComponent;
constructor(private customerService: CustomerService, private signalrSVR:SignalrService, private cd:ChangeDetectorRef ){}



    
    ngAfterViewInit(): void {
        this.deleteCustomerDialog.onOK.subscribe(custs=>{
            this.customerService.customersCache = [];
            custs.forEach(c=>{
                this.customerService.removeCustomers(c.id);
                this.cd.detectChanges()
            });
            this.customerService.getCustomers().subscribe(c=>{
                c.forEach(cust=>{
                    this.elements.push(cust);
                    this.customerService.customersCache.push(cust);
                    this.cd.detectChanges()
                });
            })
            this.deleteCustomerDialog.close();
        });

        //replace the old customer with updated version in the cache
        this.signalrSVR.AllCustomerUpdateFeedObservable.subscribe(c=>{
            let index = this.customerService.customersCache.findIndex(cust=>cust.id === c.id);
            this.customerService.customersCache[index] = c;
            this.cd.detectChanges()
        });

        //add new customer to the cache
        this.signalrSVR.AllNewCustomerFeedObservable.subscribe(c=>{
            this.customerService.customersCache.push(c);
            this.cd.detectChanges();
        });
    }

    ngOnInit(): void {
      this.loadInit();
     
    }


    selected: any[] = [];

    onDelete(){
        this.deleteCustomerDialog.open(this.selected)
    }

    loadInit(){
         this.customerService.getCustomers().subscribe(c=>{
             c.forEach(cust => {
                 this.elements.push(cust);
             });
             this.cd.detectChanges();
         })
        }

    

    

}


