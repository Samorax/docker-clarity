import { Product } from "./Product"

export class Stock {
  id?:number
  productId!:number
  product?:Product
  initialUnits!:number
  remainingUnits!:number
  prepDate!:Date
  stockedDate!:Date
  soldUnits?:number
  hasWaste!:boolean
  isExpired!:boolean
  applicationUserID:any
    isDeleted!: boolean
}