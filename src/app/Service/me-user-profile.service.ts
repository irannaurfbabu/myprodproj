/*
___________________________________________________________________________________________________________
## SERVICE OBJECT FOR USER LOGIN AND PROFILE SERVICES ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## SERVICE FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user authentication
|   ++ HTTP Service for user profile retrieval
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 24-JAN-2018    v1.0     - Created the New Service.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  ########################################################################
//  ~ Start  ------------------------------------------------------------------------------------------------------
// Angular Imports (in-built imports)
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
import "rxjs/add/operator/publishReplay";

//  ~ End  ------------------------------------------------------------------------------------------------------


// -------------------  Class Definition - Start ------------------------------------------------------------------
@Injectable()
export class MeUserProfileService {

  // -- @details : Class variable declaration ####################################################################
  //  ~ Start  ---------------------------------------------------------------------------------------------------
  //Class Variables
  // private data: BehaviorSubject<any> = new BehaviorSubject(null);
  private _UserProfile:Observable<any> = null;

  // HTTP Request Variables
  headers = new Headers();
  options = new RequestOptions({ headers: this.headers });
  private API_URL = "https://h45om730i6.execute-api.ap-south-1.amazonaws.com";

  //  ~ End  ------------------------------------------------------------------------------------------------------


  // --  @details :  constructor ##################################################################################
  //  ~ Start  ----------------------------------------------------------------------------------------------------
  constructor(private http: Http) {
    this.headers.set("Content-Type", "application/json");
    this.headers.set("x-api-key", "wb3TXtjeuU4u7YdNuPiHxSBFnPfiBtH3W9LVG8P7");
  }

  //  ~ End  ------------------------------------------------------------------------------------------------------

  // @details - User Login Authentications  ########################################################################
  //  ~ Start  ------------------------------------------------------------------------------------------------------

  authenticate_login(login): Observable<any> {
    return this.http
      .post(
        this.API_URL + "/prod/getUserValidate",
        JSON.stringify(login),
        this.options
      )
      .map(response => response.json());
       
  }

  //  ~ End  ------------------------------------------------------------------------------------------------------

  //  @details - User Profile Functions ###########################################################################
  //  ~ Start  ----------------------------------------------------------------------------------------------------
 
  // ++ make http request to fetch user profile 
  // ++ publishReplay(1) tells rxjs to cache the most recent value which is perfect for single value http calls. 
  // ++ refCount() is used to keep the observable alive for as long as there are subscribers.
  //
  makeRequest_UserProfile(login): Observable<any> {
    
    if (!this._UserProfile) {
      this._UserProfile = this.http
        .post(
          this.API_URL + "/prod/getUserProfileList",
          JSON.stringify(login),
          this.options
        )
        .map(response => response.json())
        .publishReplay(1)
        .refCount();
    }

    return this._UserProfile;
  }

  // ++ Provide Clear Cache feature while user tries to relogin or during logout.
  clearUserProfileCache(){
    this._UserProfile = null;
  }

  //  ~ End  ------------------------------------------------------------------------------------------------------


}
// -------------------  Class Definition - End ------------------------------------------------------------------


// Remove Old Code -- Later
// // -- SetUserProfile -----------------------------
// setData_UserProfile(p_profileDetails: any) {
//   // Set the data variable with Profile Response Value
//   this.data.next(p_profileDetails);
// }

// // -- SetUserProfile -----------------------------
// getData_UserProfile(): Observable<any> {
//   return this.data.asObservable();
// }