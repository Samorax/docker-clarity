import { AfterViewInit, Component, OnInit, Sanitizer, ViewChild } from "@angular/core";
import { Product } from "../Models/Product";
import { AddProductDialog } from "./AddProductDialog.component";
import { EditProductDialog } from "./EditProductDialog.component";
import { DeleteProductDialog } from "./DeleteProductDialog.Component";
import { ProductService } from "../Services/ProductService";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable, from, of } from "rxjs";

@Component({
    selector:'app-productcatalog',
    templateUrl:'./ProductCatalog.component.html'
})

export class ProductCatalogComponent implements OnInit, AfterViewInit{

  constructor(private productService: ProductService, private sanitizer: DomSanitizer) {
   }
  
  


  
  ngOnInit(): void {
    this.loadInit();

  }


    ngAfterViewInit(): void {
      this.modal.onOk.subscribe(prod =>
      {
        this.productService.addProduct(prod)
          .subscribe(p => {
            this.convertImgByte(p).subscribe(p=>{
              this.elements.push(p);
              console.log(p.photosUrl);
            });
            
          });
        this.modal.close();
      });

      this.editModal.onOk.subscribe(prod => {
        this.productService.updateProduct(prod.productID, prod)
          .subscribe();
        this.editModal.close();
      });

      this.delModal.onOk.subscribe(prods => {
        prods.forEach(p => {
          this.productService.removeProduct(p.productID).subscribe();
        })
        this.delModal.close();
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
    this.productService.getProducts()
      .subscribe(ps => ps.forEach(p => {
        this.convertImgByte(p).subscribe(p=>{
          this.elements.push(p);
          this.productService.productssCache.push(p);
        })
      }));
    let cache = this.productService.productssCache;
    return cache;
    
  }

 
}
