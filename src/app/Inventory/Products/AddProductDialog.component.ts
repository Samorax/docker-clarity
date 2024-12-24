import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Product } from "../../Models/Product";
import { FormBuilder, Validators } from "@angular/forms";
import { ClrLoadingState } from "@clr/angular";

@Component({
    templateUrl:'./AddProductDialog.component.html',
    selector:'add-product'

})

export class AddProductDialog{
  
  constructor(private formBuilder: FormBuilder){}
  
  productForm = this.formBuilder.group({
    photo:[File,Validators.required],
    productName:['',Validators.required],
    productCategory:['',Validators.required],
    productPrice:['',Validators.required],
    productDescription:['', Validators.required],
    productCode:[''],
    productLoyaltyPoints:['',Validators.required],
    productAllergens:['']
  })

  currencySymbol:any = localStorage.getItem("currency_iso_code");
  user:any = localStorage.getItem("user_id");
  show: boolean = false;
  categories: Array<string> = [];
  addNewCategory: boolean = false;
  product: Product = new Product();
  @Output() onOk: EventEmitter<any> = new EventEmitter<any>();
  @Input()products!: Array<Product>
  @ViewChild('file')fileInput: any;
  allergens:Array<string> = ['Celery','Cereals','Crustaceans','Eggs','Fish','Lupin','Milk','Molluscs','Mustard','Nuts','Peanuts','Sesame seeds','Soya','Sulphur Dioxide'];
  allergenSelection:Array<string>=[];

  submitLoadingState:ClrLoadingState = ClrLoadingState.DEFAULT

  




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
    if (this.productForm.get('productCategory')?.value === "New") {

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
  console.log(this.fileInput[0])
  this.productForm.get('photo')?.setValue(this.fileInput[0]);
  console.log(this.fileInput[0])
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

  onSubmit() {

    this.submitLoadingState = ClrLoadingState.LOADING
    let prod:any = this.productForm.value
    
  

    let data = new FormData();
    data.append('applicationUserID',this.user);
    data.append("category",prod.productCategory);
    data.append("code",prod.productCode);
    data.append("description",prod.productDescription);
    data.append("name",prod.productName);
    data.append("price",prod.productPrice);
    data.append("loyaltyPoints",prod.productLoyaltyPoints);
    data.append("photosUrl",prod.photo);
    data.append("allergens", prod.productAllergens)
    this.onOk.emit(data);
    this.submitLoadingState = ClrLoadingState.DEFAULT
  }
}

