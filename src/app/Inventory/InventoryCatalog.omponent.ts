import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, Sanitizer, ViewChild } from "@angular/core";
import { Product } from "../Models/Product";
import { AddProductDialog } from "./Products/AddProductDialog.component";
import { EditProductDialog } from "./Products/EditProductDialog.component";
import { DeleteProductDialog } from "./Products/DeleteProductDialog.component";
import { ProductService } from "../Services/Product/ProductService";
import { DomSanitizer } from "@angular/platform-browser";
import { BehaviorSubject, Observable, from, of } from "rxjs";
import { paymentService } from "../Services/PaymentService";
import { ActivatedRoute } from "@angular/router";
import { ClarityIcons, pencilIcon, plusIcon, timesCircleIcon } from "@cds/core/icon";
import { FoodIngredients } from "../Models/FoodIngredients";
import { Suppliers } from "../Models/Suppliers";
import { AddSupplierDialogComponent } from "./Supplier/AddSupplierDialog.component";
import { EditSupplierDialogComponent } from "./Supplier/EditSupplierDialog.component";
import { DeleteSupplierDialogComponent } from "./Supplier/DeleteSupplierDialog.component";
import { AddFIDialogComponent } from "./Food Ingredients/AddFI.component";
import { EditFIDialogComponent } from "./Food Ingredients/EditFI.component";
import { DeleteFIDialogComponent } from "./Food Ingredients/DeleteFI.component";
import { PODialogComponent } from "./Food Ingredients/PO.component";
import { SupplierService } from "../Services/SupplierService";
import { FIService } from "../Services/FIService";
ClarityIcons.addIcons(pencilIcon,plusIcon,timesCircleIcon)

@Component({
    selector:'app-productcatalog',
    templateUrl:'./InventoryCatalog.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush
    
})

export class InventoryCatalogComponent implements OnInit, AfterViewInit{
selectedFI: any;
FIs: BehaviorSubject<any> = new BehaviorSubject<FoodIngredients[]>([]);

onEditFI() {
   this.editFI.open();
}
onDeleteFI() {
    this.deleteFI.open();
}
onAddFI() {
    this.addFI.open();
}

onPO() {
    this.poDialog.open();
  }

selectedSup: any;
Sup: BehaviorSubject<any> = new BehaviorSubject<Suppliers[]>([]);

onEditSup() {
  this.editSupplier.open();
  }
onDeleteSup() {
  this.deleteSupplier.open();
  }
onAddSup() {
  this.addSupplier.open();
  }



  ifError:boolean = false;
  ifSuccess:boolean = false;
  feedBackStatus:string = '';
  feedBackMessage:string = '';

  currencySymbol:any = this._paymentSvr.currencySymbol;
  route = inject(ActivatedRoute)

  constructor( private productService:ProductService, private supService:SupplierService, private fiService:FIService,
    private cd:ChangeDetectorRef, private sanitizer: DomSanitizer, private _paymentSvr: paymentService) {
   }
  
  
  
  ngOnInit(): void {
    this.route.data.subscribe((p:any)=>{
       let d = p.products.filter((pr:any)=>pr.isDeleted === false);
      d.forEach((dr:any)=>{
        this.convertImgByte(dr).subscribe(p=>{
          this.elements.next([...this.elements.getValue(),p]);
          this.cd.detectChanges();
        });
      }) 
  }); 

  }


    ngAfterViewInit(): void {

      this.addSupplier.onOK.subscribe(sup => {
        this.supService.addSupplier(sup).subscribe((s:any)=>{
          this.Sup.next([...this.Sup.getValue(),s]);
        })
      })

      this.editSupplier.onOk.subscribe(sup => {
        this.supService.updateSupplier(sup).subscribe((s:any)=>{
          let a = this.Sup.getValue();
          let i = a.findIndex((sp:any)=>sp.supplierID === s.supplierID);
          a[i] = s;
          this.Sup.next(a);
        })
      })

      this.deleteSupplier.onOK.subscribe(sup => {
        this.supService.deleteSupplier(sup).subscribe((s:any)=>{
          let a = this.Sup.getValue().filter((sp:any)=>sp.id !== s.id);
          this.Sup.next(a);
        })
      })

      this.addFI.onOk.subscribe(fi => {
        this.fiService.addFoodIngredient(fi).subscribe((f:any)=>{
          this.FIs.next([...this.FIs.getValue(),f]);
        })
      })

      this.editFI.onOk.subscribe(fi => {
        this.fiService.updateFoodIngredient(fi).subscribe((f:any)=>{
          let a = this.FIs.getValue();
          let i = a.findIndex((f:any)=>f.id === fi.id);
          a[i] = f;
          this.FIs.next(a);
        })
      })

      this.deleteFI.onOk.subscribe(fi => {
        this.fiService.deleteFoodIngredient(fi).subscribe((f:any)=>{
          let a = this.FIs.getValue().filter((f:any)=>f.id !== fi.id);
          this.FIs.next(a);
        })
      })

      this.poDialog.onOk.subscribe(po => {

      })

      //add new product to the catalog
      this.modal.onOk.subscribe(prod =>
      {
        let addArray:Product[] = []
        this.productService.addProduct(prod)
          .subscribe(p => {
            this.convertImgByte(p).subscribe(pr=>{
              this.elements.next([...this.elements.getValue(),pr]);
            });
            
            this.ifSuccess = true;
            this.feedBackStatus = 'success';
            this.feedBackMessage = 'You have successfully addedd '+p.name+' to the collection';
            
          },(err:Error)=>
          {
            this.ifError = true;
            this.feedBackStatus = 'warning';
            this.feedBackMessage = 'Product not added to collection. Reason: '+ err.message;
          });
          this.modal.close();
      });

      this.editModal.onOk.subscribe((prod:FormData) => {
        
        this.productService.updateProduct(prod.get("id"), prod)
          .subscribe(
            (r:Product)=>
          { 
            let a = this.elements.getValue();
            let i = a.findIndex((p:any)=>p.productID === r.productID);
            a[i] = r;
            this.elements.next(a)

            this.ifSuccess = true;
            this.feedBackStatus = 'success';
            this.feedBackMessage = `${prod.get('name')} was successfully updated.`;
          },
          (err:Error)=>
          {
            this.ifError = true;
            this.ifError = true;
            this.feedBackStatus = 'warning';
            this.feedBackMessage =`${prod.get('name')} was not edited. Reason: ${err.message}`;

          },()=>this.editModal.close());
          });
        

      this.delModal.onOk.subscribe(prods => {
        prods.forEach(p => {
          this.productService.removeProduct(p.productID).subscribe(()=>{
            let indexOfDeletedProduct = this.elements.getValue().filter((pr:any)=>pr.productID !== p.productID);
            this.elements.next(indexOfDeletedProduct);

            this.ifSuccess = true;
            this.feedBackStatus = 'success';
            this.feedBackMessage = p.name+' was successfully deleted from the collection.';
          },
          (err:Error)=>
          {
            this.ifError = true;
            this.feedBackStatus = 'warning';
            this.feedBackMessage = p.name+' was not deleted from the collection. Reason: '+err.message;
          },()=> this.delModal.close());
        })
        
      });
      
    }
    
    selected: any = [];
    elements: BehaviorSubject<any> = new BehaviorSubject<Product[]>([]);
    @ViewChild(AddProductDialog) modal!: AddProductDialog;
    @ViewChild(EditProductDialog) editModal!: EditProductDialog;
    @ViewChild(DeleteProductDialog) delModal!: DeleteProductDialog;

    @ViewChild(AddSupplierDialogComponent) addSupplier!: AddSupplierDialogComponent;
    @ViewChild(EditSupplierDialogComponent) editSupplier!: EditSupplierDialogComponent;
    @ViewChild(DeleteSupplierDialogComponent) deleteSupplier!: DeleteSupplierDialogComponent;

    @ViewChild(AddFIDialogComponent) addFI!: AddFIDialogComponent;
    @ViewChild(EditFIDialogComponent) editFI!: EditFIDialogComponent;
    @ViewChild(DeleteFIDialogComponent) deleteFI!: DeleteFIDialogComponent;
    @ViewChild(PODialogComponent) poDialog!:PODialogComponent;

    convertImgByte(x: Product):Observable<Product>{
        let objectURL = 'data:image/jpeg;base64,' + x.photosUrl;
        x.photosUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        return of(x);
    };

    onAdd(){
            this.modal.open();
        }

    onEdit() {
          this.editModal.open(this.selected[0]);
        }

    onDelete() {
      this.delModal.open(this.selected);
    }

  

 
}
