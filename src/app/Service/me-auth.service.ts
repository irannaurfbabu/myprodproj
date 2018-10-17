/*
____________________________________________________________________________________________________________
## AUTH SERVICE TO SET FLAG FOR LOGIN AND LOGOUT ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   23-FEB-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## SERVICE FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ Service to set flag after login
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 23-FEB-2018    v1.0     - Created the New Service.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import { PersistenceService } from 'angular-persistence';
import { StorageType } from './Interfaces/storage-type.enum';
// -------------------  Component & Class Definition - Start ------------------------------------------------
@Injectable()
export class MeAuthService {
// Form variable
  isLoggedIn = false;
  redirectUrl: string;
  getLoginFlag = false;

  constructor(    
    public loginFlagPersistenceService: PersistenceService,
  ){
     // Save the Input format in cache for use in other Components & Service - Using loginpersistenceService Service.
     this.getLoginFlag = this.loginFlagPersistenceService.get(
      "loginFlag",
      StorageType.SESSION
    );
    if(this.getLoginFlag === undefined)
    {
      this.getLoginFlag = false;
    }
  }
  // store the URL so we can redirect after logging in
  login(): Observable<boolean> {
    console.log(this.isLoggedIn);
    console.log( this.getLoginFlag , 'this.getLoginFlag');
    this.getLoginFlag=true;
    this.loginFlagPersistenceService.set("loginFlag", this.getLoginFlag,{type: StorageType.SESSION});
    return Observable.of(true).delay(1000).do(val => this.isLoggedIn = true);
  }

  logout(): void {
    this.isLoggedIn = false;
    this.getLoginFlag = false;
  }

}
  // class() -- End -----------------------------------------------------------------------------------------
