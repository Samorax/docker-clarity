import { paymentProcessor } from "./PaymentProcessor"

export class appUser{
    birthdayNotify:any
    voucherNotify:any
    businessName:any
    businessAddress1:any
    businessAddress2:any
    postalCode:any
    state:any
    country:any
    paymentToken:any
    password?:any
    email:any
    firstName:any
    lastName:any
    phoneNumber:any
    deliveryFee:any
    deliveryDistance:any
    paymentProcessor!:paymentProcessor
    vatCharge:any
    serviceCharge:any
    testMode:any
    smsMode:any
   
    openingTimes:any
    id?:any
   
    isDeleted: any

}