import { RxSchema } from "rxdb";
import { Product } from "./Product";

export const ProductSchema = {
        version:0,
        primaryKey: 'productID',
        type: 'object',
        properties: {
            productID: {
                type: 'string',
                maxLength:100 // <- the primary key must have set maxLength
            },
            name: {
                type: 'string'
            },
            price: {
                type: 'number'
            },
            code:{
                type: 'string'
            },
            category:{
                 type: 'string'
            },
            description:{
                 type: 'string'
            },
            applicationUserID:{
                 type: 'string'
            },
            photosUrl:{
                 type: 'string'
            },
            loyaltyPoints:{
                 type: 'number'
            },
            allergens:{
                 type: 'string'
            },
            isDeleted:{
                 type: 'boolean'
            }

        },
        required: ['id', 'name', 'price', 'category','description','applicationUserID','photosUrl','loyaltyPoints','allergens','isDeleted']
}


