import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Product } from "../Models/Product";
import { NgForm } from "@angular/forms";

@Component({
  selector: 'edit-product',
  templateUrl: './EditProductDIalog.component.html'
})

export class EditProductDialog {
  @Output() onOk: EventEmitter<Product> = new EventEmitter<Product>();
  product: Product = new Product();
  show: boolean = false;
  categories: Array<string> = [];
  addNewCategory: boolean = false;
  @Input()products!:Product[];
  @ViewChild('file')fileInput: any;
  user: any = localStorage.getItem("user_id");

  addCategory(category: string) {
    this.categories.push(category);
  }

  monitorValue() {
    console.log(this.product.category);
    if (this.product.category == "New") {
      this.addNewCategory = true;
    }

  }
  handleClickEvent() {
    const fileElem = <HTMLInputElement>document.getElementById('fileElem');
    if (fileElem) {
            fileElem.click();
    }
}

  onfileLoaded(x: any) {
    this.fileInput = x;
      this.handleFiles(x);
  }
  
  handleFiles(files: FileList) {
      let imgThumbNail: any;
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const imageType = /^image\//;
  
          if (!imageType.test(file.type)) {
              continue;
          }
          // this.getFileUploads(file.name);
          imgThumbNail = document.getElementById('img-thumb');
          imgThumbNail.src = window.URL.createObjectURL(file);
      }
  }

  open(product: Product) {
    this.product = product;
    this.show = true;
    this.categories = this.getProductCategories(this.products);
  }
  getProductCategories(p: Product[]): string[] {
    let cats: string[] = [];
    p.forEach(p=> cats.push(p.category));
    if(cats.length != 0){
      cats = this.removeDuplicateStrings(cats);
    }
    return cats;
  }

  removeDuplicateStrings(x: string[]): string[] {
    const a: Array<string> = [];
    x.forEach(r=>{
      for (let i = 0; i < x.length; i++) {
        let current: string = x[i];
        if (current == r ) {
          a.push(current);
          console.log("current"+a);
          break;
        }
      }
    })
    return a;
  }
  close() {
    this.show = false;
  }

  onSubmit(f:NgForm) {
    let prod = f.value;
    prod.applicationUserID = this.user;

    let data = new FormData();
    data.append('id',prod.ProductID);
    data.append('applicationUserID',prod.applicationUserID);
    data.append("category",prod.Category);
    data.append("code",prod.Code);
    data.append("description",prod.Description);
    data.append("name",prod.Name);
    data.append("price",prod.Price);
    data.append("photosUrl",this.fileInput[0]);
    console.log(data.get('applicationUserID'));
    this.onOk.emit(this.product);
  }

}
