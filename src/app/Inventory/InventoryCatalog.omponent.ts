import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, Sanitizer, ViewChild } from "@angular/core";
import { Product } from "../Models/Product";
import { AddProductDialog } from "./AddProductDialog.component";
import { EditProductDialog } from "./EditProductDialog.component";
import { DeleteProductDialog } from "./DeleteProductDialog.component";
import { ProductService } from "../Services/ProductService";
import { DomSanitizer } from "@angular/platform-browser";
import { BehaviorSubject, Observable, from, of } from "rxjs";
import { paymentService } from "../Services/PaymentService";
import { rxDbService } from "../Services/RxDbService";
import { ActivatedRoute } from "@angular/router";
import { ClarityIcons, pencilIcon, plusIcon, timesCircleIcon } from "@cds/core/icon";
ClarityIcons.addIcons(pencilIcon,plusIcon,timesCircleIcon)

@Component({
    selector:'app-productcatalog',
    templateUrl:'./InventoryCatalog.component.html',
    changeDetection:ChangeDetectionStrategy.OnPush
    
})

export class InventoryCatalogComponent implements OnInit, AfterViewInit{
  ifError:boolean = false;
  ifSuccess:boolean = false;
  feedBackStatus:string = '';
  feedBackMessage:string = '';

  currencySymbol:any = this._paymentSvr.currencySymbol;
  route = inject(ActivatedRoute)
  constructor( private productService:ProductService, private cd: ChangeDetectorRef, private sanitizer: DomSanitizer, private _paymentSvr: paymentService) {
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

  loadInit(){
   


  }

 
}
