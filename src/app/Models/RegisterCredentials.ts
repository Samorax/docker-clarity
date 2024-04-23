import { OpenTimes } from "./OpenTimes"
import { paymentProcessor } from "./PaymentProcessor"

export class RegisterCredentials {
  public firstName!: string
  public lastName!: string
  public businessName!: string
  public businessAddress1!: string
  public businessAddress2!: string
  public state!:string
  public postalCode!: string
  public country!:string
  public email!: string
  public password!: string
  public accountType!: string
  public phoneNumber!:any
  public paymentProcessor?: paymentProcessor
  openingTimes?:any
}
