import { orderDetail } from "./OrderDetails"

export class Order {
  public orderDetails!: Array<orderDetail>
  public totalAmount: any
  public orderID: any
  public orderStatus!:any
  public notes?: any
  public orderDate?: any
  public payment!: any
  public vatCharge:any
  public serviceCharge:any
  public customerID?: any
  public paymentToken?:any 
  public applicationUserID:any
  public channel:any
  public opened: any
  public tableSessionId:any
  public tableSession:any
  public totalTax:any
  public paidAmount:any
  public type:any
  isDeleted!: boolean


}
