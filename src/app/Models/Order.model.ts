import { orderDetail } from "./OrderDetails"
import { TableSession } from "./Session"

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
  customerId?: any
  paymentToken?:any 
  applicationUserID:any
  channel:any
  opened: any
  tableSessionId:any
  tableSession!:TableSession
  totalTax:any
  paidAmount:any
  type:any
  isDeleted!: boolean
  isCancelled!:boolean
  isCompleted: any
  isApproved: any
  smsActivation!:boolean
  paymentFeedback!:any
  paymentFeedbackError!:any
  customerRecordId: any
  


}
