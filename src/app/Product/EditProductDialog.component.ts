import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Product } from "../Models/Product";
import { FormBuilder, NgForm, Validators } from "@angular/forms";

@Component({
  selector: 'edit-product',
  templateUrl: './EditProductDIalog.component.html'
})

export class EditProductDialog {
  constructor(private _formBuilder:FormBuilder){}
 
  @Output() onOk: EventEmitter<any> = new EventEmitter<any>();
  product: Product = new Product();
  show: boolean = false;
  categories: Array<string> = [];
  addNewCategory: boolean = false;
  @Input()products!:Product[];
  @ViewChild('file')fileInput: any;
  allergens:Array<string> = ['Celery','Cereals','Crustaceans','Eggs','Fish','Lupin','Milk','Molluscs','Mustard','Nuts','Peanuts','Sesame seeds','Soya','Sulphur Dioxide'];
  allergenSelection:Array<string>=[];

  editProductForm = this._formBuilder.group({
    photo:[File,Validators.required],
    productName:['',Validators.required],
    productCategory:['',Validators.required],
    productPrice:['',Validators.required],
    productDescription:['', Validators.required],
    productCode:[''],
    productLoyaltyPoints:['', Validators.required],
    productAllergens:['']
  })

  

  addCategory(category: string) {
    this.categories.push(category);
    this.addNewCategory = false;
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
    this.editProductForm.get('productName')?.setValue(this.product.name);
    this.editProductForm.get('productCategory')?.setValue(this.product.category)
    this.editProductForm.get('productPrice')?.setValue(this.product.price)
    this.editProductForm.get('productDescription')?.setValue(this.product.description)
    this.editProductForm.get('productCode')?.setValue(this.product.code)
    this.editProductForm.get('productLoyaltyPoints')?.setValue(this.product.loyaltyPoints)
    this.editProductForm.get('productAllergens')?.setValue(this.product.allergens)
    this.show = true;
    this.getProductCategories(this.products).then(p=> this.categories = p);
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
          break;
        }
      }
    })
    return a;
  }
  close() {
    this.show = false;
  }

  onSubmit() {
    let prod:any = this.editProductForm.value;
    
    let data = new FormData();
    data.append('id',this.product.productID);
    data.append('applicationUserID',this.product.applicationUserID);
    data.append("category",prod.productCategory);
    data.append("code",prod.productCode);
    data.append("description",prod.productDescription);
    data.append("name",prod.productName);
    data.append("price",prod.productPrice);
    data.append("loyaltyPoints",prod.productLoyaltyPoints);
    data.append("photosUrl", this.checkIfPhotoFilePresent(prod.photo));
    data.append("allergens",prod.productAllergens);
    
    this.onOk.emit(data);
  }

  checkIfPhotoFilePresent(x:any){
    if(x === undefined){
      let s = <String>this.product.photosUrl;
       let y = s.toString().split(',',2)[1];
       let r = y.split(' ',2)[0];
       
       return r;
    }
    return x;
  }

}
