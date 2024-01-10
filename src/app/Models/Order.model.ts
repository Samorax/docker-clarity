import { CartOrder } from "./CartOder"
import { Product } from "./Product"

export class Order {
  public products!: Array<CartOrder>
  public totalAmount: any
  public orderID: any
  public orderStatus!:any
  public notes?: any
  public orderDate?: any
  public payment!:any
  public customerID?: any
  public paymentToken?:any 
  public applicationUserID:any
  public channel:any
}
