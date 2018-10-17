/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR EDIT AREA ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Ability to Edit Area
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 24-JAN-2018    v1.0     - Created the New Component.
|   ++06-MAR-2018              -Notifications added  -----adithya
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start ________________________________________________________________________________________________
// Import Angular Core Libraries/Functionalities

import { Component, OnInit, NgZone } from "@angular/core";
import { ErrorStateMatcher } from "@angular/material/core";
import { PersistenceService } from "angular-persistence";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { NgProgressRouterModule } from "@ngx-progressbar/router";
import { DatePipe } from "@angular/common";
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
} from "@angular/forms";
import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatRippleModule,
  MatSortModule,
  MatAutocompleteModule
} from "@angular/material";

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
import { MeGzipService } from '../../../Service/me-gzip.service';

declare var jQuery: any;
declare var $     : any;
declare var M     : any;

//  ~ End ________________________________________________________________________________________________

// -------------------  Component & Class Definition - Start ---------------------------------------------

@Component({
  selector   : "app-me-edit-area",
  templateUrl: "./me-edit-area.component.html",
  styleUrls  : ["./me-edit-area.component.css"]
})
export class MeEditAreaComponent implements OnInit {
  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  __________________________________________________________________________________________________

  //-- Create Form Group
  editArea: FormGroup;

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  area_name: AbstractControl;
  city     : AbstractControl;
  state    : AbstractControl;
  pincode  : AbstractControl;
  status   : AbstractControl;
  area_id  : AbstractControl;
  city_id  : AbstractControl;
  state_id : AbstractControl;

  present_area_name : any;
  present_city      : any;
  present_state     : any;
  present_pincode   : any;
  present_status    : any;
  isPresentActive   : boolean;
  record_create_on  : any;
  record_create_by  : any;
  record_modified_on: any;
  record_modified_by: any;
  owner_id          : any;
  isActive          : boolean;
  isInactive        : boolean;
  showLoader        : boolean;
  showAlertMessage   : boolean = false;
  IsformValid : any = "";
 

 // Class Local variables
 // All variables used within the class must be private
  private getRequestInput: any = "";
  private city_obj       : any = "";
  private area_obj       : any = "";
  private area_name_obj       : any = "";
  private filteredCities : Observable<any[]>;
  private area_id_param  : number = 0;

  // service & datastore variables /
  private _userProfileData: any;
  private _userLogin      : any;
  private _cityList       : any = [];
  private _areaList       : MeAreaInterface[] = [];


  private formValuesJSON: any      = null;
  private callHttpPostReponse: any = null;
  private currentDate              = new Date().toString();
  private postRequestObject: any   = {
    records: [
      {
        area_id       : null,
        area_name     : null,
        city          : null,
        city_id       : null,
        state         : null,
        state_id      : null,
        pincode       : null,
        owner_id      : null,
        created_by_id : null,
        created_by    : null,
        modified_by_id: null,
        modified_by   : null,
        active        : "Y",
        dmlType       : null,
        comments      : null,
        recordType    : "E"
      }
    ]
  };

  // function to open left side navgivation bar
  _opened: boolean = false;
  ownerCompanyName: String = "";
 

  //  ~ End  __________________________________________________________________________________________________

  // --  @details :  constructor ##############################################################################
  //  ~ Start -constructor ____________________________________________________________________________________
  constructor(
                    fb                        : FormBuilder,
            public  callHttpGet               : MeCallHttpGetService,
            public  callHttpPost              : MeCallHttpPostService,
            public  userProfileService        : MeUserProfileService,
            private editAreaPersistenceService: PersistenceService,
            private validateFields            : MeValidateFormFieldsService,
            public  zone                      : NgZone,
            public  route                     : ActivatedRoute,
             public  router                    : Router,
             public notification               : MeToastNotificationService,
             private gzipService               :MeGzipService,
  ) {
    // set the show loader flag to true
    this.showLoader = true;

    this.area_id_param = +this.route.snapshot.params["id"];
    console.log("---- --- --- Display ID Received ---- --- ---");
    console.log(this.area_id_param);

    /*
  @details -  Intialize the form group with fields
     ++ The fields are set to default values - in below case to - null.
     ++ The fields are assigned validators
         ** Required Validator
 */ 

    this.editArea = fb.group({
      area_name: [null, Validators.required],
      city     : [null, Validators.required],
      state    : [null, Validators.required],
      pincode  : [null, Validators.required],
      status   : [null, Validators.required],
      area_id  : [null],
      city_id  : [null],
      state_id : [null]
    });

    // Assign form controls to private variables
    // Controls are used in me-edit-area.component.html for accessing values and checking functionalities
    this.area_id   = this.editArea.controls["area_id"];
    this.area_name = this.editArea.controls["area_name"];
    this.city      = this.editArea.controls["city"];
    this.state     = this.editArea.controls["state"];
    this.pincode   = this.editArea.controls["pincode"];
    this.status    = this.editArea.controls["status"];
    this.city_id   = this.editArea.controls["city_id"];
    this.state_id  = this.editArea.controls["state_id"];

    
    // Subscribe for city changes
    this.city.valueChanges.subscribe((value: string) => {
      // get the city object based on city selection/input
      // use the sity object to populate state and state id
      this.city_obj = this._cityList.find(obj => obj.city_name === value);

      if (this.city_obj) {
        // Set the values to hiddenn fields
        this.editArea.controls["city_id"].setValue(this.city_obj.city_id);
        this.editArea.controls["state_id"].setValue(this.city_obj.state_id);
        this.editArea.controls["state"].setValue(this.city_obj.state_name);
      } else {
        this.editArea.controls["city_id"].setValue(null);
        this.editArea.controls["state_id"].setValue(null);
        this.editArea.controls["state"].setValue(null);
        this.editArea.controls["state"].markAsTouched({ onlySelf: true });
      }
    });

    // Subscribe for pack price type changes
    // ~ Start -- pack price type changes ------------------------------------
    this.area_name.valueChanges.subscribe((value: string) => {
      // console.log(
      //   '%c ------------------  Event Change Area Name ------------------',
      //   'background: blue; color: white; display: block;'
      // );
      // console.log('Area Name changed to:', value);

      // checking for dublicate entry of area name and display warning alert message
      this.area_name_obj = this._areaList.find( obj => obj.area_name === value );
      
      if(this.area_name_obj && this.area_name_obj.area_name != this.present_area_name) {
        this.showAlertMessage = true; 
        // console.log('obj',this.area_name_obj.area_name);
      }
      else {
        this.showAlertMessage = false; 
      }
    });
  // ~ End -- pack price type changes ------------------------------------


  } //  ~ End -constructor ____________________________________________________________________________________

  // --  @details :  ngOnInit ################################################################################
  //  ~ Start -ngOnInit ______________________________________________________________________________________
  ngOnInit() {
    // Initialize Loader
    this.showLoader = true;

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.editAreaPersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );

    // make call to fetch city list and assign to city datastore
    this.callHttpGet.makeRequest_getCityList().subscribe(response => {
      this._cityList = response.cityList;
    });

    // make call to get user profile details
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.userProfileService
      .makeRequest_UserProfile(this._userLogin)
      .subscribe(response => {
        this._userProfileData = response;

        // assigng to display in header nav bar
        this.ownerCompanyName = response.ownerDetails.owner_company_name;

        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this._userProfileData.ownerDetails
        );

        // make call for retrieving Area List
        //  ~ Start -retrieving Area List  ------------------------------------------------------------------------------------------
        this.callHttpGet
          .makeRequest_GetArea(this.getRequestInput)
          .subscribe(response => {

            // UnZipping and uncompress for retrieving  List
            this.gzipService.makeRequest_uncompress(response).then(function(result) {
 

            this._areaList = result.areaList;
            console.log('result response',result.areaList);

            // Check the Response Array List and Display the data in tabular Format
            // If the Response Array List is blank/no-records - display no reacords in the table - set showNoRecords flag true
            if (this._areaList.length > 0) {
              this.area_obj = this._areaList.find(
                obj => obj.area_id === this.area_id_param
              );


              if (this.area_obj) {
                // Set Values to form fields
                this.editArea.controls["area_id"].setValue(
                  this.area_obj.area_id
                );
                this.editArea.controls["area_name"].setValue(
                  this.area_obj.area_name
                );
                this.editArea.controls["city"].setValue(this.area_obj.city);
                this.editArea.controls["city_id"].setValue(
                  this.area_obj.city_id
                );
                this.editArea.controls["state"].setValue(this.area_obj.state);
                this.editArea.controls["state_id"].setValue(
                  this.area_obj.state_id
                );
                this.editArea.controls["pincode"].setValue(
                  this.area_obj.pincode
                );

                //set present area details - the current values of an area
                this.present_area_name = this.area_obj.area_name;
                this.present_city      = this.area_obj.city;
                this.present_state     = this.area_obj.state;
                this.present_pincode   = this.area_obj.pincode;

                //set record details
                this.record_create_by   = this.area_obj.created_by;
                this.record_create_on   = this.area_obj.created_on;
                this.record_modified_by = this.area_obj.modified_by;
                this.record_modified_on = this.area_obj.modified_on;
                
                if(this.area_obj && this.area_obj.area_name != this.present_area_name) {
                  this.showAlertMessage = true; 
                  // console.log('obj',this.area_obj.area_name);
                }
                else {
                  this.showAlertMessage = false; 
                }

                //set status flag
                if (this.area_obj.active === "Y") {
                  this.editArea.controls["status"].setValue(true);
                  this.isActive        = true;
                  this.isInactive      = false;
                  this.isPresentActive = true;
                } else if (this.area_obj.active === "N") {
                  this.editArea.controls["status"].setValue(false);
                  this.isActive        = false;
                  this.isInactive      = true;
                  this.isPresentActive = false;
                }
              }
            } else {
              console.error("Unable to fetch Area List");
            }
          }.bind(this)) 

            // Close Loader
            this.showLoader = false;
          }); // ~ End -retrieving Area List---------------------------------------------
      }); // ~ End  --------------------------------------------------------------------

    // initialize and execute jquery document ready
    this.zone.run(() => {
      // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
      // https://angular.io/api/core/NgZone

      $(document).ready(function() {
        $("select").select();
        $("input#input_text, textarea#textarea2").characterCounter();
        $('.modal').modal();
      });
    });
  } //  ~ End -ngOnInit __________________________________________________________________________________________

  // --  @details :  onSubmit ##################################################################################
  //  ~ Start -onSubmit ________________________________________________________________________________________

  onSubmit(value: string): void {
    /* @details - Check for fields validity
        ++ Check the editArea form validity
          ** If the form state is invalid call validateAllFormFields service
          ** If the form state is valid call http service
   */

    if(!this.editArea.dirty) {
      this.notification.ShowPreDefinedMessage('I', 'CMN-002');
    }
    else if (this.editArea.valid && this.showAlertMessage == false) {
      console.log(
        "%c Form Submitted Values ***** ----------------------------------------------------------------------- ",
        "background: #689f38;font-weight: bold;color: white; "
      );
      console.log(value);

      console.log(
        "%c Area Object Before ***** -------------------------------------------------------------------------- ",
        "background: #7cb342;font-weight: bold;color: white; "
      );
      console.log(this.postRequestObject);

      //create JSON
      this.formValuesJSON = JSON.parse(JSON.stringify(value));
      console.log("--------------- JSON Value ---------------");
      console.log(this.formValuesJSON);
      console.log(this.formValuesJSON.area_name);

      // Assign Values from values to post request object
      this.postRequestObject.records[0].area_id        = this.formValuesJSON.area_id;
      this.postRequestObject.records[0].area_name      = this.formValuesJSON.area_name;
      this.postRequestObject.records[0].city           = this.formValuesJSON.city;
      this.postRequestObject.records[0].city_id        = this.formValuesJSON.city_id;
      this.postRequestObject.records[0].state          = this.formValuesJSON.state;
      this.postRequestObject.records[0].state_id       = this.formValuesJSON.state_id;
      this.postRequestObject.records[0].pincode        = this.formValuesJSON.pincode;
      this.postRequestObject.records[0].owner_id       = this._userProfileData.ownerDetails.owner_id;
      this.postRequestObject.records[0].created_by     = null;
      this.postRequestObject.records[0].created_by_id  = null;
      this.postRequestObject.records[0].modified_by    = this._userProfileData.userDetails.user_name;
      this.postRequestObject.records[0].modified_by_id = this._userProfileData.userDetails.user_id;
      this.postRequestObject.records[0].comments       = 
        this._userProfileData.userDetails.user_name +
        " edited the area " +
        this.formValuesJSON.area_name +
        " on " +
        this.currentDate;

      if (this.formValuesJSON.status) {
        this.postRequestObject.records[0].active  = "Y";
        this.postRequestObject.records[0].dmlType = "U";
      } else if (!this.formValuesJSON.status) {
        this.postRequestObject.records[0].active  = "N";
        this.postRequestObject.records[0].dmlType = "D";
      }

      console.log(
        "%c Area Object After ***** -------------------------------------------------------------------------- ",
        "background: #8bc34a;font-weight: bold;color: white; "
      );
      console.log(JSON.stringify(this.postRequestObject));
 
      
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
                .makeRequest_ManageArea(this.postRequestObject)
                .subscribe(response => {
                  // Log Response - Remove Later
                  console.warn(
                    "%c ___________________________ Manage Area Post Response ___________________________",
                    "background: #4dd0e1;color: black; font-weight: bold;"
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
                              this.router.navigateByUrl('/managearea');

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
        this.notification.ShowCustomMessage('w' , 'Area Name Already Exist!');
      } else {
        this.validateFields.validateAllFormFields(this.editArea);
        this.notification.ShowPreDefinedMessage('w', 'CMN-001');
      }
    }
  }

  //  ~ End -onSubmit ________________________________________________________________________________________

  public handleCancelSubmit(dismissMethod: string): void {
    // dismissMethod can be 'cancel', 'overlay', 'close', and 'timer'
    // ... do something

    console.log(
      "User cancelled submit request. Cancel value : " + dismissMethod
    );
  }

  getCityList() {
    this.filteredCities = this.city.valueChanges.pipe(
      startWith(""),
      map(
        cityValue => 
          cityValue ? this.filterCities(cityValue): this._cityList.slice()
      )
    );
  }

  filterCities(city_value: string) {
    return this._cityList.filter(
      city => 
        city.city_name.toLowerCase().indexOf(city_value.toLowerCase()) === 0
    );
  }

  // function to set status active or inactive
  setStatus() {
    console.log("-------------- Status Clicked --------------");
    this.isActive   = !this.isActive;
    this.isInactive = !this.isInactive;
  }


  // --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  receiveToggleSidebarObj($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this._opened = $event;

    console.log("**** @@ Sidebar Open Object @@ ****");
    console.log(this._opened);

  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

 
} // -------------------  Component & Class Definition - End ---------------------------------------------
 