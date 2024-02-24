import { orderDetail } from "./OrderDetails"

export class Order {
  public orderDetails!: Array<orderDetail>
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
  public opened: any
  public tableSessionId:any
  public totalTax:any
  public paidAmount:any

}
