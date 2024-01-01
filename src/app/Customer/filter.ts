import { Customer } from "../Models/Customer";
import { ClrDatagridStringFilterInterface } from "@clr/angular";

export class filter implements ClrDatagridStringFilterInterface<Customer>{
    accepts(item: Customer, search: string): boolean {
        return "" + item.email == search
        || item.email.toLowerCase().indexOf(search) >= 0;
    }
}
 