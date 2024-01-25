import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Product } from "../Models/Product";
import { NgForm } from "@angular/forms";

@Component({
    templateUrl:'./AddProductDialog.component.html',
    selector:'add-product'

})

export class AddProductDialog{
  currencySymbol:any = localStorage.getItem("currency_iso_code");
  user:any = localStorage.getItem("user_id");
  show: boolean = false;
  categories: Array<string> = [];
  addNewCategory: boolean = false;
  product: Product = new Product();
  @Output() onOk: EventEmitter<any> = new EventEmitter<any>();
  @Input()products!: Array<Product>
  @ViewChild('file')fileInput: any;

  open(){
        this.show = true;
        this.getProductCategories(this.products).then(p=> this.categories = p);
  }

  close() {
    this.show = false;
  }

  getProductCategories(p: Array<Product>):Promise<string[]>{
    return new Promise((resolve)=>{
    let cats: string[] = [];
        let distinctCAtegories: string[] = [];
        p.forEach(p=> cats.push(p.category));
        if(cats.length != 0){
          distinctCAtegories = cats.filter(this.onlyUnique)
        resolve(distinctCAtegories);
      }})
    }

    onlyUnique(value:any, index:any, array:any) {
        return array.indexOf(value) === index;
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

  addCategory(category: any) {
    this.categories.push(category);
    this.addNewCategory = false;
  }

  monitorValue() {
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

  onSubmit(f:NgForm) {
    let prod = f.value;
    prod.applicationUserID = this.user;

    let data = new FormData();
    data.append('applicationUserID',prod.applicationUserID);
    data.append("category",prod.Category);
    data.append("code",prod.Code);
    data.append("description",prod.Description);
    data.append("name",prod.Name);
    data.append("price",prod.Price);
    data.append("loyaltyPoints",prod.LoyaltyPoints);

    data.append("photosUrl",this.fileInput[0]);
  
    this.onOk.emit(data);
  }
}

