import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Product } from "../Models/Product";

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

  addCategory(category: string) {
    this.categories.push(category);
  }

  monitorValue() {
    console.log(this.product.category);
    if (this.product.category == "New") {
      this.addNewCategory = true;
    }

  }

  open(product: Product) {
    this.product = product;
    this.show = true;
  }
  close() {
    this.show = false;
  }

  onSubmit() {
    this.onOk.emit(this.product);
  }

}
