import { Component, OnInit } from "@angular/core";
import { ProductService } from "../Services/ProductService";
import { Product } from "../Models/Product";

@Component({
    selector:'app-productoverview',
    templateUrl:'./ProductOverview.component.html'
})

export class ProductOverviewComponent implements OnInit{
    constructor(private productSvr:ProductService){}
    products: Product[] = [];
    productCount: number = 0;
    categoriesCount: number = 0;

    ngOnInit(): void {
        this.productSvr.getProducts().subscribe(p=>{
            this.products = p;
            this.productCount = p.length;
            this.getProductCategories(p).then(x=>{
                this.categoriesCount = x.length;
            })
        });
    }

    getProductCategories(p: Array<Product>):Promise<string[]>{
    return new Promise((resolve)=>{
    let cats: string[] = [];
        let distinctCAtegories: string[] = [];
        p.forEach(p=> cats.push(p.category));
        console.log("categories:"+cats)
        if(cats.length != 0){
          cats.forEach(c=>{
            let duplicate:string[] = [];
            for (let i = 0; i < cats.length; i++) {
                const element = cats[i];
                if(c === element){
                    duplicate.push(element);
                    console.log("duplicates"+ duplicate);
                }
            }
            if(duplicate.length < 2){
                distinctCAtegories.push(c);
            
            }else{
                cats.splice(cats.indexOf(c),1);
                console.log("cats:"+cats);
            }
          })
        };
        console.log("distinct categories:"+distinctCAtegories);
        resolve(distinctCAtegories);
      })
    }

    getProductDemandChart(){
        
    }

    
}