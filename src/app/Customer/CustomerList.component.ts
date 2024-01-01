import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Customer } from "../Models/Customer";
import { CustomerService } from "../Services/CustomerService";
import { DeleteCustomerDialogComponent } from "./DeleteCustomerDialog.component";

@Component({
    selector:'app-customers',
    templateUrl:'./customerlist.component.html'
})

//Customer recruitments is made through clients (Mobile app or websites) 
//This is to encourage usage of those platforms.

export class CustomerListComponent implements OnInit, AfterViewInit{
    elements: Customer[] = [];
    @ViewChild(DeleteCustomerDialogComponent) deleteCustomerDialog!: DeleteCustomerDialogComponent;
constructor(private customerService: CustomerService ){}



    
    ngAfterViewInit(): void {
        this.deleteCustomerDialog.onOK.subscribe(custs=>{
            this.customerService.customersCache = [];
            custs.forEach(c=>{
                this.customerService.removeCustomers(c.customerID);
            });
            this.customerService.getCustomers().subscribe(c=>{
                c.forEach(cust=>{
                    this.elements.push(cust);
                    this.customerService.customersCache.push(cust);
                });
            })
            this.deleteCustomerDialog.close();
        })
    }

    ngOnInit(): void {
      this.loadInit();
    }


    selected: any[] = [];

    onDelete(){
        this.deleteCustomerDialog.open(this.selected)
    }

    loadInit(){
        let cache = this.customerService.customersCache;
        if(cache.length >= 1){
         cache.forEach(c=>this.elements.push(c));
        }else{
         this.customerService.getCustomers().subscribe(c=>{
             c.forEach(cust => {
                 this.elements.push(cust);
                 this.customerService.customersCache.push(cust);
             });
         })
        }
    }

    

    

}


