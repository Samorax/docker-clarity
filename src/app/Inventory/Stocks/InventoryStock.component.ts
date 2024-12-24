import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, inject, OnInit, ViewChild } from "@angular/core";
import { Stock } from "../../Models/Stock";
import { stockService } from "../../Services/Stock/StockService";
import { addStockDialog } from "./AddStockDialog.component";
import { Product } from "../../Models/Product";
import { ProductService } from "../../Services/Product/ProductService";
import { deleteStockDialogComponent } from "./DeleteStockDialog.component";
import { restockDialogComponent } from "./ReStockDialog.component";
import { editStockDialogComponent } from "./EditStockDialog.component";
import { ActivatedRoute } from "@angular/router";
import { ClarityIcons, pencilIcon, plusIcon, recycleIcon, timesCircleIcon } from "@cds/core/icon";
import { ClrLoadingState } from "@clr/angular";
import { BehaviorSubject } from "rxjs";
ClarityIcons.addIcons(timesCircleIcon,plusIcon,pencilIcon,recycleIcon)

@Component({
    selector:'app-stock',
    templateUrl:'./InventoryStock.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush
})

export class InventoryStockComponent implements OnInit, AfterViewInit {
    stkService = inject(stockService)
    productsService = inject(ProductService)
    activatedroute = inject(ActivatedRoute)
    cd = inject(ChangeDetectorRef)

    selected:Stock[] = [];
    elements:BehaviorSubject<any> =new BehaviorSubject<Stock[]>([])
    products:Product[] = [];

    ngOnInit(): void {
        this.activatedroute.data.subscribe((s:any)=> {
            let currentStocks =s.stocks.filter((d:any)=>d.isExpired !== true); 
            this.elements.next(currentStocks)
            this.productsService.getProducts().subscribe(p=>{
                this.products = p;
            }); 
        })
    }
        
    

    ngAfterViewInit(): void {

        this.addStkDialog.onOk.subscribe(r=>{
            this.stkService.addStock(r).subscribe(r=>{
                this.elements.next([...this.elements.getValue(),r])
            })
            this.addStkDialog.close();
        });

        //update stock with isDeleted value
        this.delStkDialog.onOk.subscribe(r=>{
            this.stkService.updateStock(<number>r.id,r).subscribe();
            let undeletedStocks = this.elements.getValue().filter((s:Stock)=>s.id !== r.id);
            this.elements.next(undeletedStocks);
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
                this.reStkDialog.restockBtn = ClrLoadingState.SUCCESS;
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