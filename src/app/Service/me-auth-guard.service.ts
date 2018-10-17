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

import { Injectable }       from '@angular/core';
import { MeAuthService }    from './me-auth.service';
import { PersistenceService } from 'angular-persistence';
import { StorageType } from './Interfaces/storage-type.enum';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
}                           from '@angular/router';

@Injectable()
export class MeAuthGuardService implements CanActivate {
  getLoginFlag : boolean;
  constructor(
    private authService: MeAuthService, 
    private router     : Router,
    public loginFlagPersistenceService: PersistenceService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
     return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    this.getLoginFlag = this.loginFlagPersistenceService.get(
      "loginFlag",
      StorageType.SESSION
    );
    if (this.authService.getLoginFlag) { return true; }

    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;

    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    return false;
  }
}
