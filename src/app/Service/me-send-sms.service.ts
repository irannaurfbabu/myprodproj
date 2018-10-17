/*
____________________________________________________________________________________________________________
## GET SERVICE FOR DATA STORE & DATA SERVICE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   16-MAR-2018 |   CREATED_BY  |   VIBHA
------------------------------------------------------------------------------------------------------------
## SERVICE FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service to Send Notification
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 16-MAR-2018    v1.0     - Created the New Service.
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities

import { Injectable } from "@angular/core";
import {
  Http,
  Request,
  RequestMethod,
  HttpModule,
  RequestOptions,
} from "@angular/http";
import { Observable } from "rxjs/Observable";
import { Headers } from "@angular/http";
import { map } from "rxjs/operators";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import {HttpClientModule, HttpHeaders} from '@angular/common/http';

//  ~ End  -----------------------------------------------------------------------------------------------

// -------------------  Injectable & Class Definition - Start ------------------------------------------------
@Injectable()
export class MeSendSmsService {

  // Request Variables
  private headers = new Headers();
  private options = new RequestOptions({ headers: this.headers });
  private SMS_URL = "https://www.unicel.in/SendSMS/sendmsg.php?";

  // --  @details :  constructor #################################################################################
  //  ~ Start  ---------------------------------------------------------------------------------------------------
  constructor(private http: Http) {
    this.headers.set("Content-Type", "application/json");
    
  }
  //  ~ End  -----------------------------------------------------------------------------------------------------
  
  // makeRequest_sendSMS(p_to,p_sms): Observable<any> {

  //   console.log("---- Inside Send SMS ----");
  //   console.log(p_to);
  //   console.log(p_sms);
  
  //   var p_sms_record = "";
  //   p_sms_record = "uname=cableguy&pass=v@8Ci$2Z&send=CBLGUY&dest="+p_to+"&msg="+p_sms+"&prty=3&vp=30";
  
  //   console.log(p_sms_record);
  
  //   return this.http
  //   .get(this.SMS_URL + p_sms_record)
  //   .map(response => response.json());
  
  
  // }

     // --  @details :  HTTP request Function to submit Payment details #############################################
  // makeRequest_mobiCableDev_manageExpense() -- Start  _______________________________________________________________________

  makeRequest_ManageSMS(p_input_record): Observable<any> {
    console.warn("----------Inside Manage Owner Profile ------------- ");
    console.dir(p_input_record);
    
    const options = new RequestOptions({ headers: this.headers });
    
    return this.http
    .post(
      "https://gxk7f7615b.execute-api.us-west-2.amazonaws.com/production/transactionSms",
    p_input_record,
    options
    )
    .map(response => response.json());
  }
  
// makeRequest_mobiCableDev_manageExpense() -- End--------------------------------------------------------------------------
  


}
// -------------------  Injectable & Class Definition - End ----------------------------------------------------


