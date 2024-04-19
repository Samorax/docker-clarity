import { Rewards } from "./Rewards"

export class Customer{
    public id!: string
    public recordId:any
    public firstName!: string
    public lastName!: string
    public birthday!: string
    public email!: string
    public lastOrderDate:any
    public favourite:any
    public totalAmountSpent:any
    public highSpender:any
    public houseAddress!:string
    public loyaltyPoints!:number
    public membership:any
    public rewardClaims!:Array<Rewards>
    phoneNumber!: string

}