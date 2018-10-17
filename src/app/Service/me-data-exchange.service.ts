/*
____________________________________________________________________________________________________________
## SERVICE INJECTABLE FOR DATA EXCHANGE BETWEEN UNRELATED COMPONENTS  ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   27-FEB-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## SERVICE FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ Stores the collection list after http request.
|   ++ The store data can be used across multiple components to retrieve data using get function.
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 27-FEB-2018    v1.0     - Created the New Service.
|   ++
____________________________________________________________________________________________________________

*/

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Injectable()
export class MeDataExchangeService {
  
  private        messageSource = new BehaviorSubject<any>("default");
  currentMessage :any          = this.messageSource.asObservable();

  constructor() {}

  pushExchangeData(p_exchangeData: any) {
    console.log("----- p_exchangeData -----");
    console.log(p_exchangeData);

    this.messageSource.next(p_exchangeData);
  }

}
