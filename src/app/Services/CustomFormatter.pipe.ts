import { CurrencyPipe, PercentPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'customFormat' })
export class CustomFormatPipe implements PipeTransform {
  transform(value: number,valueType:number): Pipe {
    // Custom transformation logic
    let result!:any
    let currencyCode:any =  localStorage.getItem('currency_iso_code')
    if(valueType === 1){
        result = new Intl.NumberFormat("en-US", {
            style: 'currency',
            currency:  currencyCode
          }).format(value);
    }else{
        result = new Intl.NumberFormat("en-US", {
            style: 'percent'
          }).format(value/100);
    }
       return result;
   
  }

  

  
}
