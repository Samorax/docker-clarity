import { AfterViewInit, Component, OnInit, Sanitizer, ViewChild } from "@angular/core";
import { Product } from "../Models/Product";
import { AddProductDialog } from "./AddProductDialog.component";
import { EditProductDialog } from "./EditProductDialog.component";
import { DeleteProductDialog } from "./DeleteProductDialog.Component";
import { ProductService } from "../Services/ProductService";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable, from, of } from "rxjs";
import { paymentService } from "../Services/PaymentService";

@Component({
    selector:'app-productcatalog',
    templateUrl:'./ProductCatalog.component.html',
    
})

export class ProductCatalogComponent implements OnInit, AfterViewInit{
  ifError:boolean = false;
  ifSuccess:boolean = false;
  feedBackStatus:string = '';
  feedBackMessage:string = '';

  currencySymbol:any = this._paymentSvr.currencySymbol;
  constructor(private productService: ProductService, private sanitizer: DomSanitizer, private _paymentSvr: paymentService) {
   }
  
  
  ngOnInit(): void {
    this.loadInit();

  }


    ngAfterViewInit(): void {

      //add new product to the catalog
      this.modal.onOk.subscribe(prod =>
      {
        this.productService.addProduct(prod)
          .subscribe(p => {
            this.convertImgByte(p).subscribe(p=>{
              this.elements.push(p);
              
            });
            this.ifSuccess = true;
            this.feedBackStatus = 'success';
            this.feedBackMessage = 'You have successfully addedd '+p.name+' to the collection';
            
          },(err:Error)=>
          {
            this.ifError = true;
            this.feedBackStatus = 'warning';
            this.feedBackMessage = 'Product not added to collection. Reason: '+ err.message;
          },()=>this.modal.close());
        
      });

      this.editModal.onOk.subscribe((prod:FormData) => {
        
        this.productService.updateProduct(prod.get("id"), prod)
          .subscribe(
            (r:Product)=>
          { 
            let i = this.elements.findIndex(p=>p.productID === r.productID);
            this.elements[i] = r;
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
            let indexOfDeletedProduct = this.elements.indexOf(p);
            this.elements.splice(indexOfDeletedProduct,1);

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
    elements: Array<Product> = [];
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
      this.productService.getProducts().subscribe(p=>{
        let d = p.filter(pr=>pr.isDeleted === false);
        d.forEach(dr=>{
          this.convertImgByte(dr).subscribe(p=>{
            this.elements.push(p);
          });
        })
    });
  }

 
}
