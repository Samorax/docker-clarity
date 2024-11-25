import { of } from "rxjs";
import { Stock } from "../../Models/Stock";
import { stockResolver } from "./StockResolver"
import { stockService } from "./StockService";
import {TestBed} from "@angular/core/testing"


describe('StockResolver',()=>{
    let resolver: stockResolver
    let stkService: any

    beforeEach(()=>{
        TestBed.configureTestingModule({
            providers: [
                stockResolver,
            {
                provide: stockService,
                useValue: jasmine.createSpyObj('stockService', ['getStocks'])
            }]
        })
        resolver = TestBed.inject(stockResolver);
        stkService = TestBed.inject(stockService);
    });

    it('should resolve stocks', () => {
        const mockstk:Stock[] = [{ id: 1, prepDate:new Date(), productID:2,isDeleted:false,initialUnits:2, remainingUnits:2,isExpired:false,hasWaste:false,stockedDate:new Date(), applicationUserID:9 }];
        stkService.getStocks.and.returnValue(of(mockstk));
    
        const route:any = {
          paramMap: {
            get: () => null
          }
        };

        const x:any ={}
    
        resolver.resolve(route, x).subscribe(stk => {
          expect(stk).toEqual(mockstk);
        });
      });
})