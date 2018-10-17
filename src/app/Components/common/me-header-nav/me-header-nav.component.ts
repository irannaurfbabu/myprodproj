/*
____________________________________________________________________________________________________________
## COMPONENT FOR HOME PAGE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   05-Mar-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## SERVICE FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ Component Definition for Header Nav Page
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

import { Component, OnInit, EventEmitter, Output, NgZone } from "@angular/core";
import { PersistenceService } from "angular-persistence";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { Router } from "@angular/router";
import { NgProgressRouterModule } from "@ngx-progressbar/router";

// Import Custom Libraries/Functionalities/Services
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { StorageType }  from "../../../Service/Interfaces/storage-type.enum";
import { MeAuthService } from './../../../Service/me-auth.service';

import swal from "sweetalert2";
//  ~ End  ---------------------------------------------------------------------------------------------------

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-me-header-nav',
  templateUrl: './me-header-nav.component.html',
  styleUrls: ['./me-header-nav.component.css']
})
export class MeHeaderNavComponent implements OnInit {

  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  --------------------------------------------------------------------------------------------------

  private userProfileData: any;
  private _userLogin: any;

  document: any = window.document;

// function to open left side navgivation bar
_opened: boolean = false;
ownerCompanyName: String = "";

@Output() toggleSidebarEvent = new EventEmitter<boolean>();
_toggleSidebar() {
  this.toggleSidebarEvent.emit (!this._opened);
  // this._opened = !this._opened;
}

  //  ~ End  --------------------------------------------------------------------------------------------------

  // --  @details :  constructor #################################################################################
  //  ~ Start  ---------------------------------------------------------------------------------------------------
  constructor(
    public userProfileService: MeUserProfileService,
    public homePersistenceService: PersistenceService,
    public  router                    : Router,
    public authService: MeAuthService,
    private zone: NgZone
    
  ) {

 

  }

  //  ~ End  ---------------------------------------------------------------------------------------------------

  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  ngOnInit() {
    console.log(
      "%c  Inside Header Nav component ngonInit : ",
      "background: #1898dd;color: white; font-weight: bold;"
    );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.homePersistenceService.get("userLogin",StorageType.SESSION);
    // console.log("User Login", this._userLogin);

    // make call to User Profile Request based on login details
    this.userProfileService.makeRequest_UserProfile(this._userLogin).subscribe(response => {
        // console.log("Profile Inside Header Nav Component :", response);
        // console.log("OwnerDetails Inside Header Nav Component :", response.ownerDetails.owner_company_name);

        this.ownerCompanyName = response.ownerDetails.owner_company_name;

      });
      
  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

  // -- @details : Logout ####################################################
  //  ~ Logout ~ Start  ------------------------------------------------------ 

  logout(){
    //  call sweet alert - Start __________________________________________________
    swal({
      title: 'Are you sure?',
      type: 'warning',
      text: 'You will be logged out...',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
      allowOutsideClick : false,
      allowEscapeKey : false,
      allowEnterKey : false,
      reverseButtons : true
      
    }).then((result) => {

      console.log(result);
      console.log(result.dismiss);

      // If the value is "yes"
      if(result.value) {
        swal({
          title: 'Logging Out...',
          allowOutsideClick : false,
          allowEscapeKey : false,
          allowEnterKey : false,
          showConfirmButton: false,
          onOpen: () => {
          
            //close sweet alert loader
            swal.close();

            // call clean\clear persistance values
            this.clear_cache();
            this.authService.logout();
            

            // navigate to login page
            this.router.navigateByUrl("/login");

          
          }
        });

      }
    
      // // If the value is "cancel"  - result.dismiss
      // if( result.dismiss === swal.DismissReason.cancel)
      // { 
      //   console.log('User Cancelled Logout');
      // }

    });

  }


  clear_cache(){
  // clear cache variables;
  this.homePersistenceService.remove('userLogin',StorageType.SESSION);

  // clears all storage saved by this service, and returns a list of keys that were removed;
  this.homePersistenceService.removeAll(StorageType.SESSION);    

  //cleans the storage of expired objects
  this.homePersistenceService.clean(StorageType.SESSION);

  }

//  ~ Logout ~ End  -------------------------------------------------------------------- 


  // -- @details : toggleFullScreen() ####################################################
  //  ~ toggleFullScreen() ~ Start  ------------------------------------------------------ 
  
    toggleFullScreen() {
      console.log('click on fullscreen in fun');
      if ((document['fullScreenElement'] && document['fullScreenElement'] !== null) ||
          (!document['mozFullScreen'] && !document.webkitIsFullScreen)) {
          if (document.documentElement['requestFullScreen']) {
              document.documentElement['requestFullScreen']();
          } else if (document.documentElement['mozRequestFullScreen']) {
              document.documentElement['mozRequestFullScreen']();
          } else if (document.documentElement.webkitRequestFullScreen) {
              document.documentElement.webkitRequestFullscreen();
          }
      } else {
          if (document['cancelFullScreen']) {
              document['cancelFullScreen']();
          } else if (document['mozCancelFullScreen']) {
              document['mozCancelFullScreen']();
          } else if (document.webkitCancelFullScreen) {
              document.webkitCancelFullScreen();
          }
      }
    }

  //  ~ toggleFullScreen() ~ END  ------------------------------------------------------ 


}
