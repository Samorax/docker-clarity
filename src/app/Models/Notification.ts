export class Notifications
{
    type!:notificationType
    texts!:string
}


export enum notificationType {
  birthday,
  order,
  voucher,
  customer
}