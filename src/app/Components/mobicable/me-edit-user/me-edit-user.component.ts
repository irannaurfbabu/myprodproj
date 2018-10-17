/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR EDIT USER ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   THAPAS  |
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Ability to edit existing User
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|            ++ 24-JAN-2018    v1.0     - Created the New Component.
|     ++ 07-mar-2018             -created new 3 columns (specfy limit,install limit,limit value)and other changes -edited by adithya 
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start ________________________________________________________________________________________________

// Import Angular Core Libraries/Functionalities
import { Component, OnInit, NgZone } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { PersistenceService } from 'angular-persistence';
import { NgProgressModule, NgProgress } from '@ngx-progressbar/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { MatSelectModule } from '@angular/material/select';
import { OnChanges } from '@angular/core';


import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
  NgForm
} from '@angular/forms';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatRippleModule,
  MatSortModule,
  MatAutocompleteModule,
  MatSelect
} from '@angular/material';

import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { Observable } from 'rxjs/Observable';
import swal from 'sweetalert2';


// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from '../../../Service/me-call-http-get.service';
import { MeUserProfileService } from '../../../Service/me-user-profile.service';
import { MeValidateFormFieldsService } from '../../../Service/me-validate-form-fields.service';
import { MeCallHttpPostService } from '../../../Service/me-call-http-post.service';
import { MeAreaInterface } from '../../../Service/Interfaces/me-area-interface';
import { MeUserInterface } from '../../../Service/Interfaces/me-user-interface';
import { StorageType } from '../../../Service/Interfaces/storage-type.enum';
import { MeToastNotificationService } from './../../../Service/me-toast-notification.service'; // This Service for custom toast notification
import { MeGzipService } from '../../../Service/me-gzip.service';

// below variables declared for Jquery and Material script
// $ for jQuery functions and M for Material functions
declare var jQuery: any;
declare var $     : any;
declare var M     : any;

//  ~ End ________________________________________________________________________________________

// -------------------  Component & Class Definition - Start -------------------------------------

@Component({
  selector   : 'app-me-edit-user',
  templateUrl: './me-edit-user.component.html',
  styleUrls  : ['./me-edit-user.component.css']
})
export class MeEditUserComponent implements OnInit {
 
// --  @details :  Declare Variables #############################################################
//  ~ Start -variables ___________________________________________________________________________
 
//-- Create Form Group &  Create List of Fields
// All variables used in component template ( html file ) must be public
  editUser: FormGroup;
    
  user_name        : AbstractControl;
  user_phone       : AbstractControl;
  user_email       : AbstractControl;
  user_role        : AbstractControl;
  device_id        : AbstractControl;
  login_id         : AbstractControl;
  user_password    : AbstractControl;
  user_offline_limit: AbstractControl;
  adduserarea      : AbstractControl;
  status           : AbstractControl;
  user_install     : AbstractControl;
  user_spec        : AbstractControl;
 
   isActive       : boolean;
   isInactive     : boolean;
   showLoader     : boolean;
   areaArrayList  : any = [];
   showNoRecords  : boolean = false;
   showTableLoader: boolean = false;
   IsformValid    : any = '';
   ShowPackPrice  :boolean=false;
   passwordView   : boolean = false;
   showAlertMessage   : boolean = false;

  Showlimit:     any = '';
  specfic_limit: any = '';
  limit_value:   any = '';
  Showvalue: any = '';
  isDelete: any = ' ';
  requirePack: any;
 
   record_create_on  : any;
   record_create_by  : any;
   record_modified_on: any;
   record_modified_by: any;
   old_phoneNumber: any;

  // pagination variables
    productsPerPage = 5;
    selectedPage    = 1;
    p: number = 1; // for pagination
  notify: any = '';

    
// Class Local variables
// All variables used within the class must be private

  private formValuesJSON: any      = null;
  private callHttpPostReponse: any = null;
  private currentDate              = new Date().toString();
  private assignLoginID: any       = null;
  private selectedArea: any        = null;
  private area_obj: any            = '';
  private area_obj_exist: any      = '';
  private hasArea: boolean         = false;
  private owner_id     : any;
  private user_obj     : any = '';
  private user_id_param: number = 0;

  private getRequestInput : any = '';
  private _userProfileData: any;
  private _userLogin      : any;
  private _areaList       : MeAreaInterface[] = [];
  private _userList       : MeUserInterface[] = [];
  private _userMeta       : any;
  private filteredAreas   : Observable<any[]>;
  private user_phone_obj : any;
 

  private user_params : any = {
    'user_id' : null,
    'owner_id': null
  };

  private postRequestObject: any = {
    records: [
      {
        user_details: {
          email         : '',
          phone         : null,
          active        : null,
          dmlType       : 'U',
          user_id       : null,
          comments      : null,
          owner_id      : null,
          user_name     : null,
          modified_by   : null,
          modified_by_id: null,
          created_on    : null,
          recordType    : 'E'
        },
        user_meta: {
          status                  : null,
          remarks                 : null,
          device_id               : null,
          user_role               : null,
          user_role_id            : null,
          user_login_id           : null,
          user_password           : null,
          user_offline_limit      : null,
          user_install            : null,
          user_spec             : null,
        },
        user_area: []
      }
    ]
  };

  // function to open left side navgivation bar
  _opened: boolean = false;
  

//  ~ End -variables __________________________________________________________________________________________
  
// --  @details :  constructor #################################################################################
//  ~ Start -constructor _______________________________________________________________________________________
  constructor(
              fb                        : FormBuilder,
      public  callHttpGet               : MeCallHttpGetService,
      public  callHttpPost              : MeCallHttpPostService,
      public  userProfileService        : MeUserProfileService,
      private editUserPersistenceService: PersistenceService,
      private validateFields            : MeValidateFormFieldsService,
      public  zone                      : NgZone,
      public  route                     : ActivatedRoute,
      public  router                    : Router,
      public notification               : MeToastNotificationService,
      private gzipService               :MeGzipService,
  ) {
    // set the show loader flag to true
    this.showLoader = true;
    this.showTableLoader = true;

    this.user_id_param = +this.route.snapshot.params['id'];
    console.log('---- --- --- Display ID Received ---- --- ---');
    console.log(this.user_id_param);

    /*
@details -  Intialize the form group with fields
  ++ The fields are set to default values - in below case to - null.
  ++ The fields are assigned validators
      ** Required Validator
*/

    this.editUser = fb.group({
      user_name        : [null, Validators.required],
      user_phone       : [null, Validators.required],
      user_email       : [''],
      user_role        : [null, Validators.required],
      device_id        : [null],
      login_id         : [null],
      user_password    : [null, Validators.required],
      user_offline_limit: [null],
      adduserarea      : [null],
      status           : [false],
      user_install     : [null],
      user_spec        : [null],
    });

    // Assign form controls to private variables
    // Controls are used in me-create-area.component.html for accessing values and checking functionalities
    this.user_name         = this.editUser.controls['user_name'];
    this.user_phone        = this.editUser.controls['user_phone'];
    this.user_email        = this.editUser.controls['user_email'];
    this.user_role         = this.editUser.controls['user_role'];
    this.device_id         = this.editUser.controls['device_id'];
    this.login_id          = this.editUser.controls['login_id'];
    this.user_password     = this.editUser.controls['user_password'];
    this.user_offline_limit = this.editUser.controls['user_offline_limit'];
    this.adduserarea       = this.editUser.controls['adduserarea'];
    this.status            = this.editUser.controls['status'];
    this.user_install = this.editUser.controls['user_install'];
    this.user_spec = this.editUser.controls['user_spec'];


    // Subscribe for pack price type changes
    // ~ Start -- pack price type changes ------------------------------------
      this.user_phone.valueChanges.subscribe((value: string) => {
        console.log(
          '%c ------------------  Event Change User Phone ------------------',
          'background: blue; color: white; display: block;'
        );
        console.log('User Phone changed to:', value);

        // checking for dublicate entry of area name and display warning alert message
        this.user_phone_obj = this._userList.find( obj => obj.phone === value );
        
        if(this.user_phone_obj && this.user_phone_obj.phone != this.old_phoneNumber) {
          this.showAlertMessage = true; 
          // console.log('obj',this.user_phone_obj.phone);
        }
        else {
          this.showAlertMessage = false; 
        }

        this.assignLoginID = value;
        this.editUser.controls['login_id'].setValue(value);
      });
    // ~ End -- pack price type changes ------------------------------------
    
  
    // Subscribe for offline amount limit  changes
    // ~ Start -- offline amount limit changes ------------------------------------
    this.user_offline_limit.valueChanges.subscribe(
      (value: number) => {

        console.log('%c ------------------  Event Change User Phone ------------------', 'background: blue; color: white; display: block;');
        console.log('User Phone changed to:', value);

        this.ShowPackPrice = false;

        if (value <= 10) {
          this.ShowPackPrice = true;
        }

      }
    );
  // ~ End -- offline amount limit changes ------------------------------------
  // ~ Start -- user offline  limit changes ----------------
    this.user_spec.valueChanges.subscribe(
      (value: string) => {
        console.log('%c ------------------  Event Change specify limit Type ------------------', 'background: blue; color: white; display: block;');
        console.log('specify limit Type :', value);
        if (value) {
          if (value === 'blank') {
            this.Showvalue = false;
             this.editUser.get('user_offline_limit').clearValidators();
            this.editUser.get('user_offline_limit').updateValueAndValidity();
          } else {
            this.Showvalue = true;
                     }
        

          if (value === 'NOT') {
            this.Showlimit = false;
           
          } else {
            this.Showlimit = true;
            
          }
        }
        if(this.specfic_limit){
        if (this.specfic_limit === value) {
          this.editUser.controls['user_offline_limit'].setValue(this.limit_value);
        }
        if (this.specfic_limit !== value)  {
          this.editUser.controls['user_offline_limit'].setValue('');
        }
        }
        
        $(document).ready(function () {
          M.updateTextFields();

        });
      }
    );


    // Subscribe for pack price type changes
    // ~ Start -- pack price type changes ------------------------------------
    this.adduserarea.valueChanges.subscribe((value: string) => {
      console.log(
        '%c ------------------  Event Change adduserarea ------------------',
        'background: blue; color: white; display: block;'
      );
      console.log('adduserarea changed to:', value);
      this.selectedArea = value;
          });

    // ~ End -- pack price type changes ------------------------------------

  } 

//  ~ End -constructor _________________________________________________________________________________

 
  // --  @details :  ngOnInit ##############################################################################
  //  ~ Start -ngOnInit ____________________________________________________________________________________

  ngOnInit() {
    // Initialize Loader
    this.showLoader = true;
    this.showTableLoader = true;

    // initialize and execute jquery document ready
    this.zone.run(() => {
      // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
      // https://angular.io/api/core/NgZone

      $(document).ready(function() {
        $('select').select();
        $('input#input_text, textarea#textarea2').characterCounter();

        // intialize input label
        M.updateTextFields();
      });
    });

    

    console.log(
      '%c ---------------------------- *****  Inside Create User component ngonInit ***** ---------------------------- ',
      'background: #dd2c00;color: white; font-weight: bold;'
    );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.editUserPersistenceService.get(
      'userLogin',
      StorageType.SESSION
    );
    console.warn('----------------- User Login ----------------- ');
    console.dir(this._userLogin);

    // make call to get user profile details
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.userProfileService
      .makeRequest_UserProfile(this._userLogin)
      .subscribe(response => {
        this._userProfileData = response;

        console.warn(
          '----------------- User Profile Response ----------------- '
        );
        console.log(this._userProfileData);
        console.log(this._userProfileData.ownerDetails);

        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this._userProfileData.ownerDetails
        );
        console.log(
          '%c  Request Input : >>> ',
          'color: green; font-weight: bold;',
          this.getRequestInput
        );

        // make call for retrieving Area List
        //  ~ Start  -------------------------------------------------------------------------------------------------
        this.callHttpGet
          .makeRequest_GetArea(this.getRequestInput)
          .subscribe(response => {
              // UnZipping and uncompress for retrieving Area List
              this.gzipService.makeRequest_uncompress(response).then(function(result) {
 
            // Log Response - Remove Later
            console.warn(
              '%c ___________________________ Area Response ___________________________',
              'background: #4dd0e1;color: black; font-weight: bold;'
            );

            console.log('Area Length : ', result.areaList.length);
            console.log(result.areaList);

            this._areaList = result.areaList;
          }.bind(this)) 

          });


       // make call for retrieving User List    
       //  ~ Start - retrieving User List -----------------------------------------------------------------------------
       this.callHttpGet
       .makeRequest_ManageUser(this.getRequestInput)
       .subscribe(response => {

         // UnZipping and uncompress for retrieving Area List
         this.gzipService.makeRequest_uncompress(response).then(function(result) {
 
         // Log Response - Remove Later
         console.warn(
           '%c ___________________________ Manage User Response ___________________________',
           'background: #9fa8da;color: black; font-weight: bold;'
         );

         console.log(result.usersList);
         console.log('User Length : ', result.usersList.length);

         this._userList = result.usersList;

         // Check the Response Array List and Display the data in tabular Format
         // If the Response Array List is blank/no-records - display no reacords in the table - set showNoRecords flag true
         if (this._userList.length > 0) {

          this.user_obj = this._userList.find(
            obj => obj.user_id === this.user_id_param
          );


           // Process User Object - Start -----------------------------------------
            if(this.user_obj) {

              console.log(this.user_obj);

              // assign user details
              this.editUser.controls['user_name'].setValue(this.user_obj.user_name);
              this.old_phoneNumber = this.user_obj.phone;
              this.editUser.controls['user_phone'].setValue(this.user_obj.phone);
              this.editUser.controls['user_email'].setValue(this.user_obj.email);
              this.editUser.controls['user_role'].setValue(this.user_obj.user_role_id);
              // this.editUser.controls["login_id"].setValue(this.user_obj.user_login_id);
              // this.editUser.controls["device_id"].setValue(this.user_obj.device_id);
              

               //set record details
               this.record_create_by   = this.user_obj.created_by;
               this.record_create_on   = this.user_obj.created_on;
               this.record_modified_by = this.user_obj.modified_by;
               this.record_modified_on = this.user_obj.modified_on;

               //set status flag 
               if (this.user_obj.active === 'Y') {

                this.editUser.controls['status'].setValue(true);
                this.isActive   = true;
                this.isInactive = false;
               

              } else if (this.user_obj.active === 'N') {

                this.editUser.controls['status'].setValue(false);
                this.isActive   = false;
                this.isInactive = true;


              }

              // create object for user areqa input json
              this.user_params.user_id  = this.user_id_param;
              this.user_params.owner_id = this._userProfileData.ownerDetails.owner_id;




                // get the Input JSON format for making http request.
                this.getRequestInput = this.callHttpGet.createGetRequestRecord(
                  this.user_params
                );
                console.log(
                  '%c  Request Input - User Params : >>> ',
                  'color: green; font-weight: bold;',
                  this.getRequestInput
                );

                this.callHttpGet.makeRequest_GetUserMeta(this.getRequestInput).subscribe(response => {

                   // Log Response - Remove Later
                   console.warn(
                    '%c ___________________________ Existing Meta for User Response ___________________________',
                    'background: #ff9800;color: black; font-weight: bold;'
                  );
                  console.log(response); 

                  if(response) {

                    this._userMeta = response;
                    console.log('login_id',this._userMeta.user_login_id);
                    this.editUser.controls['login_id'].setValue(this._userMeta.user_login_id);
                    this.editUser.controls['user_password'].setValue(this._userMeta.user_password);
                    this.editUser.controls['device_id'].setValue(this._userMeta.device_id);
                    this.editUser.controls['user_offline_limit'].setValue(this._userMeta.user_offline_limit);
                    this.editUser.controls['user_install'].setValue(this._userMeta.user_install);
                    this.editUser.controls['user_spec'].setValue(this._userMeta.user_spec);
                    this.specfic_limit = this._userMeta.user_spec;
                    this.limit_value = this._userMeta.user_offline_limit;
                    
                  }

                });
            
                this.callHttpGet.makeRequest_GetUserAreaList(this.getRequestInput).subscribe(response => {
                    // Log Response - Remove Later
                    console.warn(
                      '%c ___________________________ Existing Areas for User Response ___________________________',
                      'background: #ff9800;color: black; font-weight: bold;'
                    );
                    console.log(response); 

                    if ( response.userArea.length > 0 ) {
                      this.showNoRecords = false;
                      this.showTableLoader = false;
                      this.areaArrayList = response.userArea;

                      this.areaArrayList = this.areaArrayList.filter(obj => obj.area_id !== 0);

                      console.log('loaded area is: ',this.areaArrayList);
                    }
                    else if( response.userArea.length = 0 )
                    {
                      this.showNoRecords = true;
                      console.error('No area records found !.')
                    }

                    

                }); 

         
                   // intialize drop down and text labels
                    $(document).ready(function() {
                      $('select').select();
                    
                      // intialize input label
                      M.updateTextFields();

                    });
              
                  
                // show loader
                this.showLoader = false;

            }
            // Process User Object - End -----------------------------------------

         } else {
            console.error('Unable to fetch user list');

         }
        }.bind(this)) 

         
       });

    //  ~ End - retrieving User List -----------------------------------------------------------------------------

    // intialize drop down and text labels
      $(document).ready(function() {
        $('select').select();
      
        // intialize input label
        M.updateTextFields();

      });

    // make call to get list of Packs for the owner
    //  ~ Start  -------------------------------------------------------------------------------------------------

      this.callHttpGet.makeRequest_ManageUser(this.getRequestInput).subscribe(response => {
        // Log Response - Remove Later
        console.warn(
          "%c ___________________________ Manage User Response ___________________________",
          "background: #9fa8da;color: black; font-weight: bold;"
        );

        console.log(response.usersList);
        console.log("User Length : ", response.usersList.length);

        this._userList = response.usersList;

        
      });

    //  ~ End  -------------------------------------------------------------------------------------------------


  });
  //  ~ End -ngOnInit ________________________________________________________________________________________

    // Set Values to form fields
    // this.editUser.controls["user_role"].setValue("BP");
  } //  ~ End -ngOnInit  -------------------------------------------------------------------------------------

  // --  @details :  onSubmit ##################################################################################
  //  ~ Start -onSubmit ________________________________________________________________________________________
  



  onSubmit(value: string): void {
    /* @details - Check for fields validity
      ++ Check the editArea form validity
        ** If the form state is invalid call validateAllFormFields service
        ** If the form state is valid call http service
 */
    
    if (this.areaArrayList.length <= 0) {

      this.requirePack = true;
    }
    // if (!this.editUser.dirty) {
    //   this.notification.ShowPreDefinedMessage('I', 'CMN-002');
    // }
     if (this.editUser.valid && this.areaArrayList.length !== 0 && this.showAlertMessage == false) {
      console.log(
        '%c Form Submitted Values ***** ----------------------------------------------------------------------- ',
        'background: #689f38;font-weight: bold;color: white; '
      );
      console.log(value);

      //create JSON
      this.formValuesJSON = JSON.parse(JSON.stringify(value));
      console.log('--------------- JSON Value ---------------');
      console.log(this.formValuesJSON);

      console.log(
        '%c Area Object Before ***** -------------------------------------------------------------------------- ',
        'background: #7cb342;font-weight: bold;color: white; '
      );
      console.log(this.postRequestObject);

      // assign user details
      this.postRequestObject.records[0].user_details.user_id        = this.user_id_param;
      this.postRequestObject.records[0].user_details.user_name      = this.formValuesJSON.user_name;
      this.postRequestObject.records[0].user_details.phone          = this.formValuesJSON.user_phone;
      this.postRequestObject.records[0].user_details.email          = this.formValuesJSON.user_email;
      this.postRequestObject.records[0].user_details.owner_id       = this._userProfileData.ownerDetails.owner_id;
      this.postRequestObject.records[0].user_details.modified_by    = this._userProfileData.userDetails.user_name;
      this.postRequestObject.records[0].user_details.modified_by_id = this._userProfileData.userDetails.user_id;
      this.postRequestObject.records[0].user_details.recordType     = 'E';
      this.postRequestObject.records[0].user_details.comments       =
        this._userProfileData.userDetails.user_name +
        ' edited the user data ' +
        this.formValuesJSON.area_name +
        ' on ' +
        this.currentDate;

      // assign user meta
      // this.postRequestObject.records[0].user_meta.user_role                = this.formValuesJSON.user_role
      this.postRequestObject.records[0].user_meta.user_role_id             = this.formValuesJSON.user_role;
      this.postRequestObject.records[0].user_meta.user_login_id            = this.formValuesJSON.login_id;
      this.postRequestObject.records[0].user_meta.user_password            = this.formValuesJSON.user_password;
      this.postRequestObject.records[0].user_meta.device_id                = this.formValuesJSON.device_id;
      this.postRequestObject.records[0].user_meta.user_offline_limit = this.formValuesJSON.user_offline_limit;
      this.postRequestObject.records[0].user_meta.user_install = this.formValuesJSON.user_install;
      this.postRequestObject.records[0].user_meta.user_spec = this.formValuesJSON.user_spec;

      if(this.formValuesJSON.status) {
        this.postRequestObject.records[0].user_details.active  = 'Y' ;
        this.postRequestObject.records[0].user_details.dmlType = 'U' ;
        this.postRequestObject.records[0].user_meta.status = 'Y' ;
      }
      else if(!this.formValuesJSON.status) {
       this.postRequestObject.records[0].user_details.active  = 'N' ;
       this.postRequestObject.records[0].user_details.dmlType = 'D';
       this.postRequestObject.records[0].user_meta.status = 'N' ;
      }

      // assign user area
      this.postRequestObject.records[0].user_area = this.areaArrayList;


      console.log(
        '%c Area Object After ***** -------------------------------------------------------------------------- ',
        'background: #7cb342;font-weight: bold;color: white; '
      );
      console.log(this.postRequestObject);


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
  
       console.log(result);
  
       //  Check result of confirmation button click - start ----------------------------------------------------------------------
       if(result.value) {
                     
             console.log(result.value);
  
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
  
  
              
             // make post reqest call to send area form data to DB
             //  ~ Start  --  post reqest call-------------------------------------------------------------------------
               this.callHttpPost
               .makeRequest_ManageUser(this.postRequestObject)
               .subscribe(response => {
                 // Log Response - Remove Later
                 console.warn(
                   '%c ___________________________ Manage User Post Response ___________________________',
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
                             this.router.navigateByUrl('/manageuser');
  
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
  
       } //  Check result of confirmation button click - End ----------------------------------------------------------------------
  
     });  //  call sweet alert - End ___________________________________________________________________________________________________ 
  


    } else {

      if(this.showAlertMessage) {
        this.notification.ShowCustomMessage('w' , 'User Phone Number Already Exist!');
      } else {
        this.validateFields.validateAllFormFields(this.editUser);
        this.notification.ShowPreDefinedMessage('w', 'CMN-001');
      }
      
    }
  }

  //  ~ End -onSubmit ________________________________________________________________________________________

  // Local Functions
  //  ~ Start -local functions  -------------------------------------------------------------------------------------
  getAreaList() {
    this.filteredAreas = this.adduserarea.valueChanges.pipe(
      startWith(''),
      map(
        areaValue => 
          areaValue ? this.filterAreas(areaValue): this._areaList.slice()
      )
    );

    console.warn('----------------- filteredAreas ----------------- ');
    console.warn(this.filteredAreas);
  }

  filterAreas(areaValue: string) {
    console.log(
      '%c filterAreas ***** -------------------------------------------------------------------------- ',
      'background: #4caf50;font-weight: bold;color: white; '
    );
    console.log(areaValue.toLowerCase());

    return this._areaList.filter(
      area => 
        area.area_name.toLowerCase().indexOf(areaValue.toLowerCase()) === 0
    );
  }


  // add area function
  //  ~ Start -addArea ________________________________________________________________________________________
  addArea(): boolean {

    console.log('--- Add Area ---');
    console.log('Selected Area : ' + this.selectedArea);
    console.log('this.hasArea  : ' + this.hasArea);

    this.hasArea = false;
    if (this.areaArrayList.length <= 0) {

      this.requirePack = false;
    }
    
    if (this.selectedArea === 'Select All') {
      this.areaArrayList = this._areaList;
      if (this.areaArrayList.length > 0) {
        this.showNoRecords = false;
      
      }
    }
    // Check if the selected area is already added to the area list
    if (this.areaArrayList.length > 0) {

      // find the selected Area existed in the areaArrayList Array
      this.area_obj_exist = this.areaArrayList.find(
        obj => obj.area_name === this.selectedArea

      );

      if (this.area_obj_exist) {
        this.hasArea = true;
        this.notify = this.area_obj_exist.area_name + ' Already Exist please add new area';
        this.notification.ShowCustomMessage('w', this.notify, );
        return false;
      }
    }

    // If selectedArea has value and the area is not alreasy added. 
    // Fetch the area object and add the area object to areaArrayList array using push.
    if (this.selectedArea && !this.hasArea) {

      this.area_obj = this._areaList.find(
        obj => obj.area_name === this.selectedArea
      );
      if (this.area_obj) {
        this.showNoRecords = false;
        console.log(
          '%c Selected Area Object ***** -------------------------------------------------------------------------- ',
          'background: #4caf50;font-weight: bold;color: white; '
        );
        console.log(this.area_obj);

        // create an instance of area object to extract area values
        let area_obj_extract: any = {
          area_id: null,
          area_name: null
        };

        area_obj_extract.area_id = this.area_obj.area_id;
        area_obj_extract.area_name = this.area_obj.area_name;
        console.log(area_obj_extract);
        this.areaArrayList.push(area_obj_extract);
        this.selectedArea = ' ';

        console.log('--- Arrray List ---');
        console.log(this.areaArrayList);

      }
    }
 
    this.editUser.controls['adduserarea'].setValue(''); // to clear the input filed 
    return true;
  } 
  //  ~ End -addArea ________________________________________________________________________________________

  // delete area function
  //  ~ Start -deleteArea ________________________________________________________________________________________
  deleteArea(areaid, areaname) { // areaid parameter received here
    this.areaArrayList = this.areaArrayList.filter(obj => obj.area_id !== areaid);
    this.notify = areaname + '  deleted from the list';
    this.notification.ShowCustomMessage('I', this.notify);
    if ( this.areaArrayList.length === 0 )  {
    this.showNoRecords = true;
    }
    
    return true;
    
    }
  //  ~ End -deleteArea ________________________________________________________________________________________


  // function to set status active or inactive 
  //  ~ Start -setStatus ________________________________________________________________________________________
  setStatus() {
    console.log('-------------- Status Clicked --------------');
    this.isActive   = !this.isActive ;
    this.isInactive = !this.isInactive ;

  }  //  ~ End -setStatus ________________________________________________________________________________________

  // --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  receiveToggleSidebarObj($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this._opened = $event;

    // console.log("**** @@ Sidebar Open Object @@ ****");
    console.log(this._opened);

  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

  // ~ Start -- user offline  limit changes ----------------
  selectall() {
    this.editUser.controls['adduserarea'].setValue('Select All');
  }

  // ~ Start - Password -- show/hide  ---------------------------------
  // @details -   Function to display show/hide

  toggleViewPassword() {
    this.passwordView = !this.passwordView;
  }

  // to clear add area input field
  clearinputfield() {
    this.editUser.controls['adduserarea'].setValue('');
  }

  //  ~ End ---------------------------------------------------------------


}
 // -------------------  Component & Class Definition - End ---------------------------------------------

 $(document).ready(function () {
  $('.reset').click(function () { $(this).closest('form').find('input[type=text], textarea').val(''); });
});

