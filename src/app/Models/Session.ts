import { Table } from "./Table";
import { Waiter } from "./Waiter";

export class TableSession
{
    id:any
    name!:string
    createdAt!:Date
    isPayable:boolean = false;
    finishedAt!:Date
    tableId:any
    waiterId!:any
    applicationUserID:any
}