import { Allergen } from "./Allergen"

export class Product {
  public productID:any
  public name: any
  public price: any
  public code: any
  public category!: string
  public description!: string
  public applicationUserID: any
  public photosUrl:any
  public loyaltyPoints:any
  public allergens!:string
  isDeleted!: boolean
}
