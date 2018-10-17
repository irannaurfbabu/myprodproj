/*
____________________________________________________________________________________________________________
## COMPONENT FOR USER LOGIN PAGE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## SERVICE FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ Component Definition for User Login Page
|   ++ Validates User Input  by making call to MeValidateFormFieldsService
|   ++ Authenticates User Login ID and Password by making call to MeUserProfileService
|   ++ Retrieves User Authentication Response
|       ** If the authentication is valid - make a call to User profile data
|       ** Set the Use Profile data in MeUserProfileService service for use in other Components
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 24-JAN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities
import { Component, OnInit, Injector, HostBinding  } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl
} from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { RouterModule } from "@angular/router";
import { NgProgressRouterModule } from "@ngx-progressbar/router";
import { PersistenceService } from "angular-persistence";



// Import Custom Libraries/Functionalities/Services
import { MeValidateFormFieldsService } from "../../../Service/me-validate-form-fields.service";
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { StorageType }  from "../../../Service/Interfaces/storage-type.enum";
import { MeAuthService } from '../../../Service/me-auth.service';
import { MeGzipService } from '../../../Service/me-gzip.service';

//  ~ End  --------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start ------------------------------------------------
@Component({
  selector: "app-me-login",
  templateUrl: "./me-login.component.html",
  styleUrls: ["./me-login.component.css"]
})
export class MeLoginComponent implements OnInit {

  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  --------------------------------------------------------------------------------------------------

  //-- Create Form Group
  loginForm: FormGroup;

  //-- Create Form Fields variables
  user_login_id: AbstractControl;
  user_password: AbstractControl;

  // Class Variables
  showProgressBar: boolean = false;
  showLoginButton: boolean = true;
  private getRequestInput: any = "";

  //  ~ End  ----------------------------------------------------------------------------------------------------

  // --  @details :  constructor #################################################################################
  //  ~ Start  ---------------------------------------------------------------------------------------------------
  constructor(
    fb: FormBuilder,
    public validateFields: MeValidateFormFieldsService,
    public callHttpGet: MeCallHttpGetService,
    public userProfileService: MeUserProfileService,
    public snackBar: MatSnackBar,
    public router: Router,
    public progress: NgProgress,
    public loginpersistenceService: PersistenceService,
    public authService: MeAuthService,
    private gzipService       :MeGzipService,
  ) {

   

    /*
       @details -  Intialize the form group with fields
          ++ The fields are set to default values - in below case to - null.
          ++ The fields are assigned validators
              ** Required Validator
      */

    this.loginForm = fb.group({
      user_login_id: [null, Validators.required],
      user_password: [null, Validators.required]
    });

    // Assign form controls to private variables
    // Controls are used in me-login.component.html for accessing values and checking functionalities
    this.user_login_id = this.loginForm.controls["user_login_id"];
    this.user_password = this.loginForm.controls["user_password"];
  }

  //  ~ End  ------------------------------------------------------------------------------------------------------

  // --  @details :  ngOnInit ######################################################################################
  //  ~ Start  ------------------------------------------------------------------------------------------------------
  ngOnInit() {

    //clear cache before starting
    this.clear_cache();
    
    this.userProfileService.clearUserProfileCache();

    // // keep startup url (in case your app is an SPA with html5 url routing)
    // var initialHref = window.location.href;
    // console.log(initialHref);

  }
  //  ~ End  ------------------------------------------------------------------------------------------------------

 



  // --  @details :  onSubmit #####################################################################################
  //  ~ Start  ----------------------------------------------------------------------------------------------------
  onSubmit(form_data: string): void {
    /* @details - Check for fields validity
         ++ Check the createArea validity
           ** If the form state is invalid call validateAllFormFields service
           ** If the form state is valid call http service
    */

    if (this.loginForm.valid) {
      // set & start the top progress bar
      this.progress.start();

      // Set the Loader to true and hide the login button
      this.showLoginButton = false;
      this.showProgressBar = true;

      // get the Input JSON format for making http request.
      this.getRequestInput = this.callHttpGet.createGetRequestRecord(
        form_data
      );
      // console.log(     "%c  Request Input : ",
      //   "color: green; font-weight: bold;",
      //   this.getRequestInput
      // );

      // Save the Input format in cache for use in other Components & Service - Using loginpersistenceService Service.
      this.loginpersistenceService.set("userLogin", this.getRequestInput,{type: StorageType.SESSION});

      // make call for authentication -- Start ---------------------------------
      this.userProfileService.authenticate_login(this.getRequestInput).subscribe(response => {

        this.gzipService.makeRequest_uncompress(response).then(function(result) {
        
          // Check if result variables have value
          if (result.p_out_mssg_flg && result.p_out_mssg) {
            // If the login is valid
            if (result.p_out_mssg_flg === "S") {
              // stop the progress bar
              this.progress.complete();
              this.authService.login().subscribe(() => {
                if (this.authService.isLoggedIn) {
                  // console.log(this.authService.isLoggedIn);
                  this.router.navigateByUrl("/home");
                }
              // if the login is valid navigate to home page
              });
            } 
            else if (result.p_out_mssg_flg === "E") {
              // if the login is Invalid - Display message to the user
              this.openSnackBar(result.p_out_mssg, "Okay");

              // Set the Loader to true and hide the login button
              this.showLoginButton = true;
              this.showProgressBar = false;
              this.progress.complete();
            }
          }
        
        }.bind(this))
          
      });

      // make call for authentication -- End ---------------------------------
    } else {
      // call validate fields service - if the form is in invalid state;
      this.validateFields.validateAllFormFields(this.loginForm);
    }
  }

  //  ~ End  ------------------------------------------------------------------------------------------------------

  // --  @details :  openSnackBar Function Call for Showing Toast ##################################################
  //  ~ Start  ------------------------------------------------------------------------------------------------------
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000
    });
  }


  clear_cache() {
    
    // clear cache variables;
    this.loginpersistenceService.remove('userLogin',StorageType.SESSION);
  
    // clears all storage saved by this service, and returns a list of keys that were removed;
    this.loginpersistenceService.removeAll(StorageType.SESSION);    
    
    //cleans the storage of expired objects
    this.loginpersistenceService.clean(StorageType.SESSION);  
  
  }
  //  ~ End  ------------------------------------------------------------------------------------------------------


}
// -------------------  Component & Class Definition - End ------------------------------------------------------------------

 