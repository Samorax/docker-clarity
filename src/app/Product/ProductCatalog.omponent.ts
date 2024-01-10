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
    templateUrl:'./ProductCatalog.component.html'
})

export class ProductCatalogComponent implements OnInit, AfterViewInit{
  currencySymbol:any = this._paymentSvr.currencySymbol;
  constructor(private productService: ProductService, private sanitizer: DomSanitizer, private _paymentSvr: paymentService) {
   }
  
  
  ngOnInit(): void {
    this.loadInit().then((p)=>{
      this.elements = p;
    });

  }


    ngAfterViewInit(): void {
      this.modal.onOk.subscribe(prod =>
      {
        this.productService.addProduct(prod)
          .subscribe(p => {
            this.convertImgByte(p).subscribe(p=>{
              this.productService.productssCache.push(p);
              this.elements = this.productService.productssCache;
            });
            
          },(err)=> console.log(err),()=>this.modal.close());
        
      });

      this.editModal.onOk.subscribe(prod => {
        this.productService.updateProduct(prod.productID, prod)
          .subscribe(()=>{
            this.productService.getProducts().subscribe(p=> {
              p.forEach(pr=> this.convertImgByte(pr).subscribe(p=>{
                this.productService.productssCache = [];
                this.productService.productssCache.push(p);
              }))
              this.elements = this.productService.productssCache;
            },(err)=>{console.log(err)},()=>this.editModal.close() );
          });
        
      });

      this.delModal.onOk.subscribe(prods => {
        prods.forEach(p => {
          this.productService.removeProduct(p.productID).subscribe(()=>{
            this.productService.getProducts().subscribe(p=> {
              p.forEach(pr=> this.convertImgByte(pr).subscribe(p=>{
                this.productService.productssCache = [];
                this.productService.productssCache.push(p);
              }))
              this.elements = this.productService.productssCache;
            },(err)=>{console.log(err)},()=>this.delModal.close());
          });
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

  loadInit():Promise<Product[]>{
    return new Promise((resolve)=>{
      let cache = this.productService.productssCache;
    if(cache.length != 0){
      resolve(cache);
    }else{
      this.productService.getProducts().subscribe(p=>{
        this.productService.productssCache = [];
        p.forEach(pr=>{
          this.convertImgByte(pr).subscribe(p=>{
            this.productService.productssCache.push(p);
          })
        })
       resolve(this.productService.productssCache);
      })
    }
    });
    
  }

 
}
