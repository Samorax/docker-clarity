export class voucher{
    public voucherId:any
    public voucherName:any
    public voucherCreationDate:any
    public voucherExpirationDate:any
    public voucherStatus:any
    public voucherCreditAmount:any
    public voucherNumber:any
    public voucherActivation:any
    public units!:number
    public valueType!:voucherValueType
    public keyword!:string
    applicationUserID:any
    isDeleted!: boolean
}

export enum voucherValueType
{
    percentage,
    actualValue
}