
/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR OWNER PROFILE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for Owner profile retrieval
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 14-JUN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities
import { Component, OnInit, NgZone } from '@angular/core';
import { PersistenceService } from "angular-persistence";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { NgProgressRouterModule } from "@ngx-progressbar/router";

import { startWith } from "rxjs/operators/startWith";
import { map } from "rxjs/operators/map";
import { Observable } from "rxjs/Observable";
import swal from "sweetalert2";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { MeValidateFormFieldsService } from "../../../Service/me-validate-form-fields.service";
import { MeAreaInterface } from "../../../Service/Interfaces/me-area-interface";
import { MeCallHttpPostService } from "../../../Service/me-call-http-post.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { MeToastNotificationService } from './../../../Service/me-toast-notification.service'; // This Service for custom toast notification
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

declare var jQuery: any;
declare var $     : any;
declare var M     : any;
@Component({
  selector: 'app-me-owner-profile',
  templateUrl: './me-owner-profile.component.html',
  styleUrls: ['./me-owner-profile.component.css']
})
export class MeOwnerProfileComponent implements OnInit {
 // -- @details : Class variable declaration ###################################################################
  //  ~ Start  __________________________________________________________________________________________________

  // Class Form variables
  private _userLogin      : any;
  private _userProfileData: any;
  private owner_metaJson  : any;
  private user_metaJson   : any;
  private OwnerProfileJson: any;
  private postRequestObject :any;
  private user_meta        :any;
  private user_details     :any={
    user_id: null,
    user_name: null
  };
  // All variables used in component template ( html file ) must be public
  owner_details: FormGroup;
  owner_meta   : FormGroup;
//-- Create List of Form Fields
owner_company_name: AbstractControl;
owner_name     : AbstractControl;
owner_phone    : AbstractControl;
owner_email    : AbstractControl;
status         :AbstractControl;

GSTIN          : AbstractControl;
enable_gst     : AbstractControl;
support_number : AbstractControl;

  // function to open left side navgivation bar
  _opened: boolean = false;

  isActive          : boolean;
  isInactive        : boolean;
  showLoader        : boolean;

//  ~ End  _________________________________________________________________________________________________

// --  @details :  constructor #############################################################################
//  ~ Start -constructor ------------------------------------------------------------------------------------
 
constructor(
        fb                                    : FormBuilder,
        public  callHttpGet                   : MeCallHttpGetService,
        public  callHttpPost                  : MeCallHttpPostService,
        public  userProfileService            : MeUserProfileService,
        private OwnerProfilePersistenceService: PersistenceService,
        private validateFields                : MeValidateFormFieldsService,
        public  snackBar                      : MatSnackBar,
        public  zone                          : NgZone,
        public  router                        : Router,
        public notification                   : MeToastNotificationService
  ) { 
     // set the show loader flag to true
     this.showLoader = true;
      /*
       @details -  Intialize the form group with fields
          ++ The fields are set to default values - in below case to - null.
          ++ The fields are assigned validators
              ** Required Validator
      */
     this.owner_details= fb.group({
      owner_company_name: [null, Validators.required],
      owner_name        : [null, Validators.required],
      owner_phone       : [null, Validators.required],
      owner_email       : [null],
      status            : [null],
    });

    this.owner_meta=fb.group({
      GSTIN          : [null],
      enable_gst     : [null],
      support_number : [null],
    });

    this.owner_company_name = this.owner_details.controls["owner_company_name"];
    this.owner_name = this.owner_details.controls["owner_name"];
    this.owner_phone = this.owner_details.controls["owner_phone"];
    this.owner_email = this.owner_details.controls["owner_email"];
    this.status = this.owner_details.controls["status"];
    
    this.GSTIN = this.owner_meta.controls["GSTIN"];
    this.enable_gst = this.owner_meta.controls["enable_gst"];
    this.support_number = this.owner_meta.controls["support_number"];

  }
  //  ~ End -constructor  --------------------------------------------------------------------------------------

  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start -ngOnInit  ---------------------------------------------------------------------------------------
  ngOnInit() {

   
    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.OwnerProfilePersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );
    // console.warn("----------------- User Login ----------------- ");
    // console.dir(this._userLogin);

    // make call to get user profile details
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.userProfileService.makeRequest_UserProfile(this._userLogin).subscribe(response => {
      
      this._userProfileData = response;

        // console.warn(
        //   "----------------- User Profile Response ----------------- "
        // );
        // console.log(this._userProfileData);
        // console.log(this._userProfileData.ownerDetails);
        this.owner_metaJson = JSON.parse(this._userProfileData.ownerDetails.owner_meta_value);
        this.user_meta  = JSON.parse(this._userProfileData.userDetails.user_meta_value);
        console.log('this.user_meta',this.user_meta );
             
        // Set the values to owner_details fields
        this.owner_details.controls["owner_company_name"].setValue(this._userProfileData.ownerDetails.owner_company_name);
        this.owner_details.controls["owner_name"].setValue(this._userProfileData.ownerDetails.owner_name);
        this.owner_details.controls["owner_phone"].setValue(this._userProfileData.ownerDetails.owner_phone);
        this.owner_details.controls["owner_email"].setValue(this._userProfileData.ownerDetails.owner_email);

        // Set the values to owner_meta fields
        this.owner_meta.controls["GSTIN"].setValue(this.owner_metaJson.GSTIN);
        this.owner_meta.controls["support_number"].setValue(this.owner_metaJson.support_number);

    
      //set status flag
      if (this.owner_metaJson.enable_gst === "Y") {
        this.owner_details.controls["status"].setValue(true); 
        this.owner_meta.controls["enable_gst"].setValue(this.owner_metaJson.enable_gst);    
        this.isActive        = true;
        this.isInactive      = false;
      } else if (this.owner_metaJson.enable_gst === "N") {
        this.owner_details.controls["status"].setValue(false);       
        this.owner_meta.controls["enable_gst"].setValue(this.owner_metaJson.enable_gst);
        this.isActive        = false;
        this.isInactive      = true;
      }


      // initialize and execute jquery document ready
      this.zone.run(() => {
        // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
        // https://angular.io/api/core/NgZone

        $(document).ready(function() {
          M.updateTextFields();
          $("select").select();
          $("input#input_text, textarea#textarea2").characterCounter();
          $('.modal').modal();
        });
      });
      this.showLoader = false;
    });
      // ~ End  --------------------------------------------------------------------------------------------------
  
  }


  // -- onSubmit -------------------------- ~start ---------------
  onSubmit(value: string): void {

  /* @details - Check for fields validity
     ++ Check the editArea validity
       ** If the form state is invalid call validateAllFormFields service
       ** If the form state is valid call http service
  */
  // console.log('this.owner_details',this.owner_details);
  if (!this.owner_details.dirty && !this.owner_meta.dirty  ) {
  
    this.notification.ShowPreDefinedMessage('I', 'CMN-002');
  
  }
  else
  {
    console.log('this.user_meta',this.user_meta);

    // Assining Enable Gst values 
    if(this.isActive)
    {
      this.owner_meta.controls["enable_gst"].setValue('Y');
    }else{
      this.owner_meta.controls["enable_gst"].setValue('N');
    }
    if (this.owner_details.valid  ) {
      
      // Assining owner details values 
      this.owner_details.value.owner_id       = this._userProfileData.ownerDetails.owner_id;
      this.owner_details.value.dmlType        = 'U';
      this.owner_details.value.recordType     = 'E';
      this.owner_details.value.active         = 'Y';
      this.owner_details.value.modified_by_id = this._userProfileData.userDetails.user_id;
      this.owner_details.value.modified_by    = this._userProfileData.userDetails.user_name;

      // Assining owner details values 
      this.owner_meta.value.owner_meta_id    = this._userProfileData.ownerDetails.owner_meta_id; 
      this.owner_meta.value.owner_meta_key    = this._userProfileData.ownerDetails.owner_meta_key; 
      this.owner_meta.value.owner_meta_value    = this.owner_metaJson.owner_meta_value; 
      this.owner_meta.value.subscribe_sms    = this.owner_metaJson.subscribe_sms; 
  
      this.user_details.user_id             = this._userProfileData.userDetails.user_id;
      this.user_details.user_name            = this.owner_details.value.owner_name;
      // Constructing Json  
      this.OwnerProfileJson = {'user_meta':this.user_meta,'user_details':this.user_details,'owner_details':this.owner_details.value,'owner_meta':this.owner_meta.value};

      // console.log('OwnerProfileJson',JSON.stringify(this.OwnerProfileJson));
    

      this.postRequestObject=this.callHttpGet.createGetRequestRecord(this.OwnerProfileJson);

      // console.log('postRequestObject',JSON.stringify(this.postRequestObject));

      //  call sweet alert - Start ________________________________________________________________________________________________________
      swal({
        title: 'Are you sure?',
        type: 'warning',
        text: 'Changes will be saved...',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Proceed!',
        allowOutsideClick : false,
        allowEscapeKey : false,
        allowEnterKey : false
        
      }).then((result) => {
        
        // console.log(result);
        
        //  Check result of confirmation button click - start ----------------------------------------------------------------------
        if(result.value) {
        
        // console.log(result.value);
        
        swal({
        title: 'Processing...',
        titleText: 'Your record is being saved...',
        text: 'Please do not refresh this page or click back button',
        allowOutsideClick : false,
        allowEscapeKey : false,
        allowEnterKey : false,
        onOpen: () => {
        swal.showLoading()
        }
        });
  
     this.callHttpPost.makeRequest_CompanyDetails(this.postRequestObject).subscribe(response => {
       this._userProfileData = response;
       // Log Response -  Later
      console.warn(
        '%c ___________________________ CompanyDetails Post Response ___________________________',
        'background: #4dd0e1;color: black; font-weight: bold;'
        );
  
      console.log(response);
  
      // swal.close();
  
      // Check reponse for success or failure - start
      if(response.p_out_mssg_flg = 'S') {
  
      // swal ~ start -----
      swal({
      type: 'success',
      title: 'Your work has been saved',
      text: 'Click OK to proceed...',
      allowOutsideClick : false,
      allowEscapeKey : false,
      allowEnterKey : false,
      showConfirmButton: true
      
      }).then((result) => {
      
      if(result.value) {
      this.router.navigateByUrl('/home');
      
      }
      
      }) // swal ~ end -----
      
      }
      else if(response.p_out_mssg_flg = 'E') {
      
      // swal ~ start -----
      swal({
      type: 'error',
      title: 'Failed to process your work',
      text: 'Click OK to proceed...',
      allowOutsideClick : false,
      allowEscapeKey : false,
      allowEnterKey : false,
      showConfirmButton: true
      
      }).then((result) => {
      
      if(result.value) {
      
      swal.close();
      
      }
      
      }) // swal ~ end -----
      
      } // Check reponse for success or failure - end
     });
      //  ~ End  --  post reqest call-------------------------------------------------------------------------
    
    } //  Check result of  confirmation button  - End ----------------------------------------------------------------------
    
    }); //  call sweet alert - End 

  }else{

    this.validateFields.validateAllFormFields(this.owner_details);

    this.notification.ShowPreDefinedMessage('w','CMN-001');

  }// check Valid condition - End 
}// check Dirty condition - End 

}



// -- onSubmit -------------------------- ~end ---------------

// --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  receiveToggleSidebarObj($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this._opened = $event;

    // console.log("**** @@ Sidebar Open Object @@ ****");
    console.log(this._opened);

  }
  //  ~ End  ----------------------------------------------------------------------------------------------------
 
  // function to set status active or inactive
  setStatus(){
    console.log("-------------- Status Clicked --------------");
    this.isActive   = !this.isActive;
    this.isInactive = !this.isInactive;
  }

}
