/*
____________________________________________________________________________________________________________
## GET SERVICE FOR VARIOUS DATA STORE & DATA SERVICES ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## SERVICE FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service to fetch Area Data
|   ++ HTTP Service to fetch Pack Data
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 24-JAN-2018    v1.0     - Created the New Service.
|   ++
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
  RequestOptions
} from "@angular/http";
import { Observable } from "rxjs/Observable";
import { Headers } from "@angular/http";
import { map } from "rxjs/operators";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import {HttpClientModule} from '@angular/common/http';

// Custom Imports ( imports)
import { GetInputRecord } from "./get-input-record";
import { MeAreaInterface } from "./Interfaces/me-area-interface";
import { MePackInterface } from './Interfaces/me-pack-interface';
import { MeUserInterface } from './Interfaces/me-user-interface';
import { MeComplaintInterface } from './Interfaces/me-complaint-interface';

//  ~ End  -----------------------------------------------------------------------------------------------

// -------------------  Injectable & Class Definition - Start ------------------------------------------------
@Injectable()
export class MeCallHttpGetService {
  
  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  --------------------------------------------------------------------------------------------------
  
  //Class Variables
  private data: BehaviorSubject<any> = new BehaviorSubject(null);
  public UserProfile: any;

  // Request Variables
  private headers = new Headers();
  private options = new RequestOptions({ headers: this.headers });
  private API_URL = "https://h45om730i6.execute-api.ap-south-1.amazonaws.com";

  
  //  ~ End  --------------------------------------------------------------------------------------------------


  // --  @details :  constructor #################################################################################
  //  ~ Start  ---------------------------------------------------------------------------------------------------
  constructor(private http: Http) {
    this.headers.set("Content-Type", "application/json");
    this.headers.set("x-api-key", "wb3TXtjeuU4u7YdNuPiHxSBFnPfiBtH3W9LVG8P7");
  }

  //  ~ End  -----------------------------------------------------------------------------------------------------

  
  // --  @details :  Functions for various get response ##########################################################
  //  ~ Start  ---------------------------------------------------------------------------------------------------
  
  // Functions for creating input record for get response
  // createGetRequestRecord() -- Start --------------------------------------------------------------------------- 
    // ++ Returns the input in records array for get response
    createGetRequestRecord(p_formValues: string): any {
      let inputRecord = new GetInputRecord(p_formValues);
      return inputRecord;
    }

  // createGetRequestRecord() -- End ----------------------------------------------------------------------------- 

  // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_GetArea() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_GetArea(p_input_record): Observable<any> {
    console.log(p_input_record);

    return this.http
      .post(
        this.API_URL + "/prod/getAreaList",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <MeAreaInterface[]>response.json());
  }

  // makeRequest_GetArea() -- End --------------------------------------------------------------------------- 

  // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_ManageArea() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_ManagePack(p_input_record): Observable<any> {
    console.log(p_input_record);

    return this.http
      .post(
        this.API_URL + "/prod/getPackList",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <MePackInterface[]>response.json());
  }

  // makeRequest_ManageArea() -- End --------------------------------------------------------------------------- 

  // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_UserPack() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_ManageUser(p_input_record): Observable<any> {
    console.log('in service');
    console.log(p_input_record);
    return this.http
      .post(
        this.API_URL + "/prod/getUsersList",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <MeUserInterface[]>response.json());
  }

  // makeRequest_UserPack() -- End --------------------------------------------------------------------------- 


  // --  @details :  HTTP request Function for Complaint List for a Owner #############################################
  // makeRequest_ManageComplaint() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_ManageComplaint(p_input_record): Observable<any> {
    //  console.log(JSON.stringify(p_input_record));

    return this.http
      .post(
        this.API_URL + "/prod/getComplaints",
         JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <MeComplaintInterface[]>response.json());
  }

  // makeRequest_ManageComplaint() -- End --------------------------------------------------------------------------- 


  // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_ManageCustomer() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_ManageCustomer(p_input_record): Observable<any> {
    console.log('p_input_record');
    console.log(p_input_record.records[0].owner_id);
    
    return this.http
      .post(
        this.API_URL + '/prod/getcustomerslist',
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }

  // makeRequest_ManageCustomer() -- End --------------------------------------------------------------------------- 



  // makeRequest_ManagePack() -- End  _________________________________________________________________________

// --  @details :  HTTP request Function to fetch City List ####################################################
  // makeRequest_getCityList() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_getCityList(): Observable<any> {
     
    return this.http
      .get(
        this.API_URL + "/prod/getCityList",
        this.options
      )
      .map(response => response.json());
  }

  // makeRequest_getCityList() -- End --------------------------------------------------------------------------- 



// makeRequest_ManageArea() -- End ---------------------------------------------------------------------------

    // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_ManageArea() -- Start ---------------------------------------------------------------------------

  makeRequest_GetCustomerMeta(p_input_record): Observable<any> {
    console.warn("----------Inside Manage Area Calll ------------- ");
    console.log( JSON.stringify(p_input_record));

    const options = new RequestOptions({ headers: this.headers });

    return this.http
      .post(
        this.API_URL + "/prod/getcustomermetalist",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => response.json());
  }

  // makeRequest_GetCustomerMeta() -- End ---------------------------------------------------------------------------

// makeRequest_GetCustomerSubscription() -- End ---------------------------------------------------------------------------

    // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_ManageArea() -- Start ---------------------------------------------------------------------------

  makeRequest_GetCustomerSubscription(p_input_record): Observable<any> {
    console.warn("----------Inside Manage Area Calll ------------- ");
    console.log( JSON.stringify(p_input_record));

    const options = new RequestOptions({ headers: this.headers });

    return this.http
      .post(
        this.API_URL + "/prod/getSubscriptionList",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => response.json());
  }

  // makeRequest_GetCustomerSubscription() -- End ---------------------------------------------------------------------------

  //  ~ End  ---------------------------------------------------------------------------------------------------
  // makeRequest_GetCustomerSubscription() -- End ---------------------------------------------------------------------------

  // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_ManageArea() -- Start ---------------------------------------------------------------------------

  makeRequest_GetCustomerPayments(p_input_record): Observable<any> {
    console.warn("----------Inside Manage Area Calll ------------- ");
    console.log( JSON.stringify(p_input_record));

    const options = new RequestOptions({ headers: this.headers });

    return this.http
      .post(
        this.API_URL + "/prod/getCustomerPaymentsList",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => response.json());
  }

  // makeRequest_GetCustomerSubscription() -- End ---------------------------------------------------------------------------

  // --  @details :  HTTP request Function for Customer Bill History #############################################
  // makeRequest_GetBillHistory() -- Start ---------------------------------------------------------------------------

  makeRequest_GetBillHistory(p_input_record): Observable<any> {
    console.warn("----------Inside Bill History Calll ------------- ");
    console.log( JSON.stringify(p_input_record));

    const options = new RequestOptions({ headers: this.headers });

    return this.http
      .post(
        this.API_URL + "/prod/getBillHistory",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => response.json());
  }

  // makeRequest_GetBillHistory() -- End ---------------------------------------------------------------------------

  //  ~ End  ---------------------------------------------------------------------------------------------------

 // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_GetUserAreaList() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_GetUserAreaList(p_input_record): Observable<any> {
    console.log(p_input_record);

    return this.http
      .post(
        this.API_URL + "/prod/getUserAreaList",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }

  // makeRequest_GetUserAreaList() -- End --------------------------------------------------------------------------- 

     // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_GetUserMeta() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_GetUserMeta(p_input_record): Observable<any> {
    console.log(p_input_record);

    return this.http
      .post(
        this.API_URL + "/prod/getUserMetaList",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }

  // makeRequest_GetUserMeta() -- End --------------------------------------------------------------------------- 

 // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_GetCustomerBalance() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_GetCustomerBalance(p_input_record): Observable<any> {
    console.log(p_input_record);

    return this.http
      .post(
        this.API_URL + "/prod/getCustomerBalance",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }

  // makeRequest_GetCustomerBalance() -- End --------------------------------------------------------------------------- 

   // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_GetSubscriptionPacks() -- Start --------------------------------------------------------------------------- 

  makeRequest_GetSubscriptionPacks(p_input_record): Observable<any> {
    console.log(p_input_record);
    return this.http
      .post(
        this.API_URL + "/prod/getSubscriptionPacks",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }

  // makeRequest_GetSubscriptionPacks() -- End --------------------------------------------------------------------------- 

  // --  @details :  HTTP request Function for Complaint List for a Owner #############################################
  // makeRequest_getComplaintCustomersList() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_getComplaintCustomersList(p_input_record): Observable<any> {
    //  console.log(JSON.stringify(p_input_record));

    return this.http
      .post(
        this.API_URL + "/prod/getcomplaintcustomerslist",
         JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <MeComplaintInterface[]>response.json());
  }

  // makeRequest_getComplaintCustomersList() -- End --------------------------------------------------------------------------- 

  // --  @details :  HTTP request Function for Complaint Titles List for a Owner #############################################
  // makeRequest_getComplaintTitles() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_getComplaintTitles(): Observable<any> {
    //  console.log(JSON.stringify(p_input_record));

    return this.http
      .get(
        this.API_URL + "/prod/getcomplainttitles",
        this.options
      )
      .map(response => <MeComplaintInterface[]>response.json());
  }

  // makeRequest_getComplaintTitles() -- End --------------------------------------------------------------------------- 



  // --  @details :  HTTP request Function for Complaint Details for a Customer #############################################
  // makeRequest_getComplaintDetails() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_getComplaintDetails(p_input_record): Observable<any> {
    //  console.log(JSON.stringify(p_input_record));

    return this.http
      .post(
        this.API_URL + "/prod/getComplaintDetails",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <MeComplaintInterface[]>response.json());
  }

  // makeRequest_getComplaintTitles() -- End --------------------------------------------------------------------------- 


  // --  @details :  HTTP request Function to get Users List for a Customer #############################################
  // makeRequest_getUsersList() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_getUsersList(p_input_record): Observable<any> {
    //  console.log(JSON.stringify(p_input_record));

    return this.http
      .post(
        this.API_URL + "/prod/getUsersList",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <MeComplaintInterface[]>response.json());
  }

  // makeRequest_getUsersList() -- End --------------------------------------------------------------------------- 

  // --  @details :  HTTP request Function to get Users List for a Customer #############################################
  // makeRequest_getUsersList() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_GetSubscriptionList(p_input_record): Observable<any> {
    //  console.log(JSON.stringify(p_input_record));

    return this.http
      .post(
        this.API_URL + "/prod/getSubscriptionList",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <MeComplaintInterface[]>response.json());
  }

  // makeRequest_getUsersList() -- End --------------------------------------------------------------------------- 
  // --  @details :  HTTP request Function for Complaint List for a Owner #############################################
  // makeRequest_GetComplaint() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_GetComplaint(p_input_record): Observable<any> {
    //  console.log(JSON.stringify(p_input_record));

    return this.http
      .post(
        this.API_URL + "/prod/getComplaints",
         JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <MeComplaintInterface[]>response.json());
  }

  // makeRequest_GetComplaint() -- End --------------------------------------------------------------------------- 

 // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_GetCustomerDetails() -- Start ---------------------------------------------------------------------------

  makeRequest_GetCustomerDetails(p_input_record): Observable<any> {

    console.log("---- Inside makeRequest_GetCustomerDetails ----");
    console.log(p_input_record);

    return this.http
      .post(
        this.API_URL + "/prod/getCustomerDetails",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }

  // makeRequest_GetCustomerDetails() -- End ---------------------------------------------------------------------------

  // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_GetLatestBill() -- Start ---------------------------------------------------------------------------

  makeRequest_GetLatestBill(p_input_record): Observable<any> {

    console.log("---- Inside makeRequest_GetLatestBill ----");
    console.log(p_input_record);

    return this.http
      .post(
        this.API_URL + "/prod/getLatestBill",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }

  // makeRequest_GetLatestBill() -- End ---------------------------------------------------------------------------


  // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_getCollectionReport() -- Start ---------------------------------------------------------------------------

  makeRequest_getCollectionReport(p_input_record): Observable<any> {
    
      console.log("---- Inside makeRequest_getCollectionReport ----");
      console.log(p_input_record);
    
      return this.http
        .post(
          this.API_URL + "/prod/getCollectionReport",
          JSON.stringify(p_input_record),
          this.options
        )
        .map(response => <any>response.json());
    }
    
  // makeRequest_getCollectionReport() -- End ---------------------------------------------------------------------------
    

  // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_getUnpaidReport() -- Start ---------------------------------------------------------------------------

    makeRequest_getUnpaidReport(p_input_record): Observable<any> {
      
      console.log("---- Inside makeRequest_getUnpaidReport ----");
      console.log(p_input_record);
      
      return this.http
        .post(
          this.API_URL + "/prod/getUnpaidReport",
          JSON.stringify(p_input_record),
          this.options
        )
      .map(response => <any>response.json());
    }
    
  // makeRequest_getUnpaidReport() -- End ---------------------------------------------------------------------------
    
  
 // --  @details :  HTTP request Function for Area List for a Owner #############################################
 // makeRequest_GetLatestBill() -- Start ---------------------------------------------------------------------------

 makeRequest_GetCollectionList(p_input_record): Observable<any> {

  console.log("---- Inside makeRequest_GetLatestBill ----");
  console.log(p_input_record);

  return this.http
    .post(
      this.API_URL + "/prod/getCollectionList",
      JSON.stringify(p_input_record),
      this.options
    )
    .map(response => <any>response.json());
}

// makeRequest_GetLatestBill() -- End ---------------------------------------------------------------------------



// --  @details :  HTTP request Function to get Count of Customers #############################################
// makeRequest_GetCustomerCount() -- Start ---------------------------------------------------------------------------

 makeRequest_GetCustomerCount(p_input_record): Observable<any> {

  console.log("---- Inside makeRequest_GetCustomerCount ----");
  console.log(p_input_record);

  return this.http
    .post(
      this.API_URL + "/prod/getCustomerCount",
      JSON.stringify(p_input_record),
      this.options
    )
    .map(response => <any>response.json());
}

// makeRequest_GetCustomerCount() -- End ---------------------------------------------------------------------------


// --  @details :  HTTP request Function to get Connection Status #############################################
// makeRequest_GetConnectionStatus() -- Start ---------------------------------------------------------------------------

makeRequest_GetConnectionStatus(p_input_record): Observable<any> {

  console.log("---- Inside makeRequest_GetConnectionStatus ----");
  console.log(p_input_record);

  return this.http
    .post(
      this.API_URL + "/prod/getConnectionStatus",
      JSON.stringify(p_input_record),
      this.options
    )
    .map(response => <any>response.json());
}

// makeRequest_GetConnectionStatus() -- End ---------------------------------------------------------------------------


// --  @details :  HTTP request Function to get Connection Status #############################################
// makeRequest_GetCollectionTrend() -- Start ---------------------------------------------------------------------------

makeRequest_GetCollectionTrend(p_input_record): Observable<any> {

  console.log("---- Inside makeRequest_GetCollectionTrend ----");
  console.log(p_input_record);

  return this.http
    .post(
      this.API_URL + "/prod/getCollectionTrend",
      JSON.stringify(p_input_record),
      this.options
    )
    .map(response => <any>response.json());
}

// makeRequest_GetCollectionTrend() -- End ---------------------------------------------------------------------------


// --  @details :  HTTP request Function to get Customer Id ############################################# 
// makeRequest_GetCustomerId() -- Start ---------------------------------------------------------------------------

makeRequest_GetCustomerId(p_input_record): Observable<any> {
  
    console.log("---- Inside GetCustomerId ----");
    console.log(p_input_record);
  
    return this.http
      .post(
        this.API_URL + "/prod/getCustomerId",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }
  
  // makeRequest_GetCustomerId() -- End ---------------------------------------------------------------------------

  // --  @details :  HTTP request Function to get Customer Id ############################################# 
// makeRequest_GetCustomerListReport() -- Start -----------------------------------------------------------------

makeRequest_getCustomerListReport(p_input_record): Observable<any> {
  
    console.log("---- Inside makeRequest_GetCustomerListReport ----");
    console.log(p_input_record);
  
    return this.http
      .post(
        this.API_URL + "/prod/getCustomerListReport",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }
  
  // makeRequest_GetCustomerListReport() -- End ------------------------------------------------------------------


// --  @details :  HTTP request Function to getSTBStatusReport ############################################# 
// makeRequest_getSTBStatusReport() -- Start -----------------------------------------------------------------

  makeRequest_getSTBStatusReport(p_input_record): Observable<any> {
  
    console.log("---- Inside makeRequest_getSTBStatusReport ----");
    console.log(p_input_record);
  
    return this.http
      .post(
        this.API_URL + "/prod/getStbStatusReport",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }
  
  // makeRequest_getSTBStatusReport() -- End ------------------------------------------------------------------

   // --  @details :  HTTP request Function to getSTBStatusReport ############################################# 
  // makeRequest_getSTBStatusReport() -- Start -----------------------------------------------------------------

  makeRequest_getCollectionSummary(p_input_record): Observable<any> {
  
    console.log("---- Inside makeRequest_getCollectionSummary ----");
    console.log(p_input_record);
  
    return this.http
      .post(
        this.API_URL + "/prod/getCollectionSummary",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }
  
  // makeRequest_getSTBStatusReport() -- End ------------------------------------------------------------------

  // --  @details :  HTTP request Function to makeRequest_getAreawiseCollection ############################################# 
  // makeRequest_getAreawiseCollection() -- Start -----------------------------------------------------------------

  makeRequest_getAreawiseCollection(p_input_record): Observable<any> {
  
    console.log("---- Inside makeRequest_getAreawiseCollection ----");
    console.log(p_input_record);
  
    return this.http
      .post(
        this.API_URL + "/prod/mobiCableProd_getAreawiseCollection",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }
  
  // makeRequest_getAreawiseCollection() -- End ------------------------------------------------------------------


  // --  @details :  HTTP request Function to makeRequest_getUseriseCollection ############################################# 
  // makeRequest_getUseriseCollection() -- Start -----------------------------------------------------------------

  makeRequest_getUseriseCollection(p_input_record): Observable<any> {
  
    console.log("---- Inside makeRequest_getUseriseCollection ----");
    console.log(p_input_record);
  
    return this.http
      .post(
        this.API_URL + "/prod/mobiCableProd_getUserwiseCollection",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }
  
  // makeRequest_getUseriseCollection() -- End ------------------------------------------------------------------

  // --  @details :  HTTP request Function to makeRequest_getAreaSummary ############################################# 
  // makeRequest_getAreaSummary() -- Start -----------------------------------------------------------------

  makeRequest_getAreaSummary(p_input_record): Observable<any> {
  
    console.log("---- Inside makeRequest_getAreaSummary ----");
    console.log(p_input_record);
  
    return this.http
      .post(
        this.API_URL + "/prod/mobiCableProd_getAreawiseCollection",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }
  
  // makeRequest_getAreaSummary() -- End ------------------------------------------------------------------


 // --  @details :  HTTP request Function to makeRequest_getExpense ############################################# 
  // makeRequest_getExpense() -- Start -----------------------------------------------------------------

  makeRequest_getExpense(p_input_record): Observable<any> {
  
    console.log("---- Inside makeRequest_getExpense ----");
    console.log(p_input_record);
  
    return this.http
      .post(
        this.API_URL + "/prod/mobiCableProd_getExpense",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }
  
  // makeRequest_getExpense() -- End ------------------------------------------------------------------

  // --  @details :  HTTP request Function to makeRequest_getExpenseTrend ############################################# 
  // makeRequest_getExpenseTrend() -- Start -----------------------------------------------------------------

  makeRequest_getExpenseTrend(p_input_record): Observable<any> {
  
    console.log("---- Inside makeRequest_getExpenseTrend ----");
    console.log(p_input_record);
  
    return this.http
      .post(
        this.API_URL + "/prod/mobiCableProd_getDailyExpenseTrend",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => <any>response.json());
  }
    // makeRequest_getExpenseTrend() -- End ------------------------------------------------------------------

  // --  @details :  HTTP request Function to makeRequest_getExpenseTrend ############################################# 
  // makeRequest_getAreawiseLatestBill() -- Start ------------------------------------------------------------------

  makeRequest_getAreawiseLatestBill(p_input_record): Observable<any> {

    console.log("---- Inside makeRequest_getAreawiseCollection ----");
    console.log(p_input_record);
    
    return this.http
    .post(
    this.API_URL + "/prod/mobiCableProd_getAreawiseLatestBill",
    JSON.stringify(p_input_record),
    this.options
    )
    .map(response => <any>response.json());
    }
  // makeRequest_getAreawiseLatestBill() -- End ------------------------------------------------------------------


    // makeRequest_getAreawiseLatestBill() -- Start ------------------------------------------------------------------

    makeRequest_getCollectionStatus(p_input_record): Observable<any> {

      console.log("---- Inside makeRequest_getCollectionStatus ----");
      console.log(p_input_record);
      
      return this.http
      .post(
      this.API_URL + "/prod/mobiCableProd_getCollectionStatusCrm",
      JSON.stringify(p_input_record),
      this.options
      )
      .map(response => <any>response.json());
      }
    // makeRequest_getAreawiseLatestBill() -- End ------------------------------------------------------------------
  
  
   // makeRequest_getCollectionListReport() -- Start ------------------------------------------------------------------

    makeRequest_getCollectionListReport(p_input_record): Observable<any> {

      console.log("---- Inside makeRequest_getCollectionListReport ----");
      console.log(p_input_record);
      
      return this.http
      .post(
      this.API_URL + "/prod/mobiCableProd_getCollectionListReportNew",
      JSON.stringify(p_input_record),
      this.options
      )
      .map(response => <any>response.json());
      }
    // makeRequest_getCollectionListReport() -- End ------------------------------------------------------------------
   
   
    // makeRequest_getGstReport() -- Start ------------------------------------------------------------------

    makeRequest_getGstReport(p_input_record): Observable<any> {

      console.log("---- Inside makeRequest_getCollectionListReport ----");
      console.log(p_input_record);
      
      return this.http
      .post(
      this.API_URL + "/prod/mobiCableProd_getGstListReport",
      JSON.stringify(p_input_record),
      this.options
      )
      .map(response => <any>response.json());
      }
    // makeRequest_getGstReport() -- End ------------------------------------------------------------------

  // --  @details :  HTTP request Function to makeRequest_getStbVcNumberList #############################################
  // makeRequest_getAreawiseLatestBill() -- Start ------------------------------------------------------------------
    makeRequest_getStbVcNumberList(p_input_record):Observable<any>{
        return this.http.post(this.API_URL + "/prod/getStbVcNumberList",
        JSON.stringify(p_input_record),
        this.options
    ).map(response=><any>response.json())
    }
  // makeRequest_getStbVcNumberList() -- End ------------------------------------------------------------------

      // makeRequest_getInvoiceByArea() -- Start ------------------------------------------------------------------
      
      makeRequest_getInvoiceByArea(p_input_record): Observable<any> {

        console.log("---- Inside makeRequest_getInvoiceByArea ----");
        console.log(p_input_record);
        
        return this.http
        .post(
        this.API_URL + "/prod/MobiCableProd_getInvoiceByArea",
        JSON.stringify(p_input_record),
        this.options
        )
        .map(response => <any>response.json());
        }
  
  
      // makeRequest_getInvoiceByArea() -- End ------------------------------------------------------------------

}
// -------------------  Injectable & Class Definition - End ----------------------------------------------------
