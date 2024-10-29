import { Component, EventEmitter, Output } from "@angular/core";
import { Product } from "../Models/Product";

@Component({
  selector: 'del-product',
  templateUrl: './DeleteProductDialog.component.html'
})

export class DeleteProductDialog {
  @Output() onOk: EventEmitter<Product[]> = new EventEmitter<Product[]>();
  products!: Array<Product>;
  show: boolean = false;

  open(prods: any) {
    this.products = prods;
    this.show = true;
  }

  close() {
    this.show = false;
  }

  onConfirm() {
    this.onOk.emit(this.products)
  }
}
