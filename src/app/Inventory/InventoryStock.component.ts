import { AfterViewInit, Component, Inject, inject, OnInit, ViewChild } from "@angular/core";
import { Stock } from "../Models/Stock";
import { stockService } from "../Services/Stock/StockService";
import { addStockDialog } from "./AddStockDialog.component";
import { Product } from "../Models/Product";
import { ProductService } from "../Services/ProductService";
import { deleteStockDialogComponent } from "./DeleteStockDialog.component";
import { restockDialogComponent } from "./ReStockDialog.component";
import { editStockDialogComponent } from "./EditStockDialog.component";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector:'app-stock',
    templateUrl:'./InventoryStock.component.html',
})

export class InventoryStockComponent implements OnInit, AfterViewInit {
    stkService = inject(stockService)
    productsService = inject(ProductService)
    activatedroute = inject(ActivatedRoute)

    selected:Stock[] = [];
    elements:Stock[] = []
    products:Product[] = [];

    ngOnInit(): void {
        this.activatedroute.data.subscribe((s:any)=> {
            this.elements = s['stocks'].filter((d:any)=>d.isExpired !== true); 
            this.products = s['products'];  
            });
        };
        
    

    ngAfterViewInit(): void {

        this.addStkDialog.onOk.subscribe(r=>{
            this.stkService.addStock(r).subscribe(r=>{
                console.log(r);
            })
            this.addStkDialog.close();
        });

        //update stock with isDeleted value
        this.delStkDialog.onOk.subscribe(r=>{
            this.stkService.updateStock(<number>r.id,r).subscribe();
            this.delStkDialog.close();
        })

        this.reStkDialog.onOk.subscribe(r=>{
            if(r.newStock == null){
                this.stkService.updateStock(<number>r.oldStock.id,r.oldStock).subscribe();
                this.reStkDialog.close();
            }else{
                this.stkService.updateStock(<number>r.oldStock.id,r.oldStock).subscribe(y=>{
                    this.stkService.addStock(<Stock>r.newStock).subscribe()
                });
                this.reStkDialog.close();
            }
            
        })

        this.editstkDialog.onOk.subscribe(r=>{
            this.stkService.updateStock(<number>r.id,r).subscribe();
            this.editstkDialog.close();
        })
    }

    @ViewChild(addStockDialog)addStkDialog!:addStockDialog
    @ViewChild(deleteStockDialogComponent)delStkDialog!:deleteStockDialogComponent
    @ViewChild(restockDialogComponent)reStkDialog!:restockDialogComponent
    @ViewChild(editStockDialogComponent)editstkDialog!:editStockDialogComponent

    onAdd(){
        
        this.addStkDialog.open();
        
    }

    onRestock(){
        this.reStkDialog.open(this.selected[0])
    }

    

    onDelete(){
        this.delStkDialog.open(this.selected[0]);
    }

    onEdit(){
        this.editstkDialog.open(this.selected[0])
    }


}