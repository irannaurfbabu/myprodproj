/*
____________________________________________________________________________________________________________
## POST SERVICE FOR VARIOUS FORM DATA SUBMISSION ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## SERVICE FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service to post Area Data
|   ++ HTTP Service to post Pack Data
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
import { Headers } from "@angular/http";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import {HttpClientModule} from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operators";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";


import { PostRecord } from "./post-record";

// -------------------  Injectable & Class Definition - Start ------------------------------------------------
@Injectable()
export class MeCallHttpPostService {
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

  //  ~ End  ---------------------------------------------------------------------------------------------------

  // --  @details :  HTTP request Function to submit area details  #############################################
  // makeRequest_ManageArea() -- Start  ________________________________________________________________________

  makeRequest_ManageArea(p_input_record):  Observable<any> {
    console.warn("----------Inside Manage Area Call ------------- ");
    console.dir(p_input_record);

    const options = new RequestOptions({ headers: this.headers });

    return this.http
      .post(
        this.API_URL + "/prod/manageArea",
        JSON.stringify(p_input_record), 
        this.options
      )
      .map(response => response.json());
  }

  // makeRequest_ManageArea() -- End __________________________________________________________________________


  // --  @details :  HTTP request Function to submit Pack details #############################################
  // makeRequest_ManagePack() -- Start  _______________________________________________________________________

  makeRequest_ManagePack(p_input_record):  Observable<any> {
    console.warn("----------Inside Manage Pack Call ------------- ");
    console.dir(p_input_record);

    const options = new RequestOptions({ headers: this.headers });

    return this.http
      .post(
        this.API_URL + "/prod/managePack",
        JSON.stringify(p_input_record), 
        this.options
      )
      .map(response => response.json());
  }

// --  @details :  HTTP request Function to submit Pack details #############################################
// makeRequest_ManageUser() -- Start  _______________________________________________________________________

makeRequest_ManageUser(p_input_record):  Observable<any> {
  console.warn("----------Inside Manage User Call ------------- ");
  console.dir(p_input_record);
 console.log(JSON.stringify(p_input_record));

  const options = new RequestOptions({ headers: this.headers });

  return this.http
    .post(
      this.API_URL + "/prod/manageUser",
      JSON.stringify(p_input_record), 
      this.options
    )
    .map(response => response.json());
}

// makeRequest_ManageUser() -- End  _________________________________________________________________________



  // --  @details :  HTTP request Function for Area List for a Owner #############################################
  // makeRequest_ManageArea() -- Start ---------------------------------------------------------------------------

  makeRequest_ManageCustomer(p_input_record): Observable<any> {
    console.warn("----------Inside Manage Area Calll ------------- ");
    console.log( JSON.stringify(p_input_record));

    const options = new RequestOptions({ headers: this.headers });

    return this.http
      .post(
        this.API_URL + "/prod/managecustomer",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => response.json());
  }

  
// --  @details :  HTTP request Function for Complaint Titles List for a Owner #############################################
  // makeRequest_manageComplaints() -- Start --------------------------------------------------------------------------- 
  
  makeRequest_manageComplaints(p_input_record): Observable<any> {
    //  console.log(JSON.stringify(p_input_record));

    return this.http
      .post(
        this.API_URL + "/prod/manageComplaint",
        JSON.stringify(p_input_record),
        this.options
      )
      .map(response => response.json());
  }

  // makeRequest_getComplaintTitles() -- End --------------------------------------------------------------------------- 

  // --  @details :  HTTP request Function for Complaint Details for a Customer #############################################
  // makeRequest_getComplaintDetails() -- Start --------------------------------------------------------------------------- 


// --  @details :  HTTP request Function to submit Payment details #############################################
// makeRequest_ManagePayments() -- Start  _______________________________________________________________________

makeRequest_ManagePayments(p_input_record):  Observable<any> {
  console.warn("----------Inside Manage User Call ------------- ");
  console.dir(p_input_record);

  const options = new RequestOptions({ headers: this.headers });

  return this.http
    .post(
      this.API_URL + "/prod/managePayments",
      JSON.stringify(p_input_record), 
      this.options
    )
    .map(response => response.json());
}

// makeRequest_ManagePayments() -- End  _________________________________________________________________________


// --  @details :  HTTP request Function to submit Payment details #############################################
// makeRequest_ManageOwnerProfile() -- Start  _______________________________________________________________________

makeRequest_CompanyDetails(p_input_record): Observable<any> {
  console.warn("----------Inside Manage Owner Profile ------------- ");
  console.dir(p_input_record);
  
  const options = new RequestOptions({ headers: this.headers });
  
  return this.http
  .post(
  this.API_URL + "/prod/manageOwner",
  JSON.stringify(p_input_record),
  this.options
  )
  .map(response => response.json());
  }
  
  // makeRequest_ManageOwnerProfile() -- End  _______________________________________________________________________


  // --  @details :  HTTP request Function to submit Payment details #############################################
  // makeRequest_mobiCableDev_manageExpense() -- Start  _______________________________________________________________________

  makeRequest_ManageExpense(p_input_record): Observable<any> {
    console.warn("----------Inside Manage Owner Profile ------------- ");
    console.dir(p_input_record);
    
    const options = new RequestOptions({ headers: this.headers });
    
    return this.http
    .post(
    this.API_URL + "/prod/mobiCableProd_manageExpense",
    JSON.stringify(p_input_record),
    this.options
    )
    .map(response => response.json());
  }
  
// makeRequest_mobiCableDev_manageExpense() -- End--------------------------------------------------------------------------
  




}

// -------------------  Injectable & Class Definition - End ------------------------------------------------
