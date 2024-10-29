import { orderDetail } from "./OrderDetails"

export class Order {
  orderDetails!: Array<orderDetail>
  totalAmount: any
  orderID: any
  orderStatus!:any
  notes?: any
  orderDate?: any
  payment!: any
  vatCharge:any
  serviceCharge:any
  customerID?: any
  paymentToken?:any 
  applicationUserID:any
  channel:any
  opened: any
  tableSessionId:any
  tableSession:any
  totalTax:any
  paidAmount:any
  type:any
  isDeleted!: boolean
  isCancelled!:boolean
  isCompleted: any
  isApproved: any
  smsActivation!:boolean
  


}
