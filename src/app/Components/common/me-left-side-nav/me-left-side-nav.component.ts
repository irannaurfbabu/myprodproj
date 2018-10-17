/*
____________________________________________________________________________________________________________
## COMPONENT FOR HOME PAGE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   05-Mar-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## SERVICE FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ Component Definition for Left Side Nav Nav Page
|   ++ Subscribe and Retrieve User Profile Details from MeUserProfileService
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 05-Mar-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  ##################################################################
//  ~ Start  ------------------------------------------------------------------------------------------------
// Import Core Libraries/Functionalities

import { Component, OnInit, NgZone } from "@angular/core";
import { PersistenceService } from "angular-persistence";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { RouterModule, Router } from "@angular/router";
import { NgProgressRouterModule } from "@ngx-progressbar/router";

// Import Custom Libraries/Functionalities/Services
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { StorageType }  from "../../../Service/Interfaces/storage-type.enum";
import { MeGzipService } from '../../../Service/me-gzip.service';

//  ~ End  ---------------------------------------------------------------------------------------------------

declare var jQuery: any;
declare var $: any;


@Component({
  selector: 'app-me-left-side-nav',
  templateUrl: './me-left-side-nav.component.html',
  styleUrls: ['./me-left-side-nav.component.css','../../../../assets/css/stars.css']
})
export class MeLeftSideNavComponent implements OnInit {

  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  --------------------------------------------------------------------------------------------------

  private userProfileData: any;
  private _userLogin: any;

  userName:String = "";
  userEmail:String = "";
  UserRoleOwner:boolean=false;


  //  ~ End  --------------------------------------------------------------------------------------------------

  // --  @details :  constructor #################################################################################
  //  ~ Start  ---------------------------------------------------------------------------------------------------
  constructor(
    private zone: NgZone,
    public userProfileService: MeUserProfileService,
    public homePersistenceService: PersistenceService,
    private gzipService       :MeGzipService,
    private router                    : Router,
  ) { }
  //  ~ End  ---------------------------------------------------------------------------------------------------


  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  ngOnInit() {
    console.log(
      "%c  Inside Left Side Nav component ngonInit : ",
      "background: #1898dd;color: white; font-weight: bold;"
    );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.homePersistenceService.get("userLogin",StorageType.SESSION);
    // console.log("User Login", this._userLogin);

    // make call to User Profile Request based on login details
    this.userProfileService.makeRequest_UserProfile(this._userLogin).subscribe(response => {
        // console.log("Profile Inside Left Side Nav Component :", response);
      
        // this.gzipService.makeRequest_uncompress(response).then(function(result) {
        
          this.userName = response.userDetails.user_name;
          this.userEmail = response.userDetails.email;


          if(response.userDetails.user_role_id == "1001"){
            this.UserRoleOwner=true;
          }else{
            this.UserRoleOwner=false;
          }

        // }.bind(this))

      });

     // initialize and execute jquery document ready    
     this.zone.run(() => {
      // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
      // https://angular.io/api/core/NgZone

      $(document).ready(function(){
          
        $('.collapsible').collapsible();

      });

    });
  }
  //  ~ End  ----------------------------------------------------------------------------------------------------


  NavigateToOwnerProfile(){
    if(this.UserRoleOwner){
      this.router.navigate(['/ownerprofile'])
    }
  }


}
