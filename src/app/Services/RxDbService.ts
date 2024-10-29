import { Injectable, OnInit } from '@angular/core';
import { createRxDatabase, isRxDatabase, RxCollection, RxCollectionBase, RxDatabase, RxJsonSchema } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { ProductSchema } from '../Models/ProductSchema';
import { Product } from '../Models/Product';

@Injectable({
    providedIn:'root'
})
export class rxDbService
{
    myDatabase!:RxDatabase
    myDocument!: { products: RxCollection<any, {}, {}, {}, any>; };
    
    
    
    async createDb(){
        if(isRxDatabase(this.myDatabase)){
            console.log(this.myDatabase.name+", already exists")
        }else{
            this.myDatabase = await createRxDatabase({
                name: 'mydatabase',
                storage: getRxStorageDexie(),
                ignoreDuplicate:true
              });

              this.myDocument = await this.myDatabase.addCollections({
                products:
                {
                    schema:ProductSchema
                }
            })
        }
    } 

   

    getProducts(){
        return this.myDocument.products
    }

    addProduct(x:Product){
        this.myDocument.products.insert(x)
    }


    

}
