
/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR CREATE AREA ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Ability to Create New Area
|   
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

import { Component, OnInit, NgZone } from "@angular/core";
import { ErrorStateMatcher } from "@angular/material/core";
import { PersistenceService } from "angular-persistence";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { NgProgressRouterModule } from "@ngx-progressbar/router";
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
  MatSnackBarModule,
  MatSortModule,
  MatSnackBar,
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

//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start -----------------------------------------------

@Component({
  selector   : "app-me-create-area",
  templateUrl: "./me-create-area.component.html",
  styleUrls  : ["./me-create-area.component.css"]
})
export class MeCreateAreaComponent implements OnInit {
  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  __________________________________________________________________________________________________

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  createArea: FormGroup;

  //-- Create List of Form Fields
  area_name: AbstractControl;
  city     : AbstractControl;
  state    : AbstractControl;
  pincode  : AbstractControl;
  city_id  : AbstractControl;
  state_id : AbstractControl;

  IsformValid : any = ""; 
  showAlertMessage     : boolean = false;

 // Class Local variables
 // All variables used within the class must be private
  private getRequestInput : any = "";
  private _userProfileData: any;
  private _userLogin      : any;
  private _cityList       : any = [];
  private city_obj        : any = "";
  private _areaList       : any = [];
  private area_name_obj        : any = "";

   filteredCities: Observable<any[]>;
  // private filteredCities: any = [];

  private formValuesJSON: any      = null;
  private callHttpPostReponse: any = null;
  private currentDate              = new Date().toString();
  private postRequestObject: any   = {
    records: [
      {
        area_id      : null,
        area_name    : null,
        city         : null,
        city_id      : null,
        state        : null,
        state_id     : null,
        pincode      : null,
        owner_id     : null,
        created_by_id: null,
        created_by   : null,
        active       : "Y",
        dmlType      : "I",
        comments     : null,
        recordType   : "N"
      }
    ]
  };


  // function to open left side navgivation bar
  _opened: boolean = false;

  
 
//  ~ End  _________________________________________________________________________________________________

// --  @details :  constructor #############################################################################
//  ~ Start -constructor ------------------------------------------------------------------------------------
  constructor(
            fb                          : FormBuilder,
    public  callHttpGet                 : MeCallHttpGetService,
    public  callHttpPost                : MeCallHttpPostService,
    public  userProfileService          : MeUserProfileService,
    private createAreaPersistenceService: PersistenceService,
    private validateFields              : MeValidateFormFieldsService,
    public  snackBar                    : MatSnackBar,
    public  zone                        : NgZone,
    public  router                      : Router,
    public notification                 : MeToastNotificationService,
    private gzipService                 : MeGzipService,

  ) {
    /*
       @details -  Intialize the form group with fields
          ++ The fields are set to default values - in below case to - null.
          ++ The fields are assigned validators
              ** Required Validator
      */

    this.createArea = fb.group({
      area_name: [null, Validators.required],
      city     : [null, Validators.required],
      state    : [null, Validators.required],
      pincode  : [null, Validators.required],
      city_id  : [null],
      state_id : [null]
    });

    // Assign form controls to private variables
    // Controls are used in me-create-area.component.html for accessing values and checking functionalities
    this.area_name = this.createArea.controls["area_name"];
    this.city      = this.createArea.controls["city"];
    this.state     = this.createArea.controls["state"];
    this.pincode   = this.createArea.controls["pincode"];
    this.city_id   = this.createArea.controls["city_id"];
    this.state_id  = this.createArea.controls["state_id"];

    //
    this.city.valueChanges.subscribe((value: string) => {
      console.log(
        "%c ------------------  Event Change City ------------------",
        "background: green; color: white; display: block;"
      );
      console.warn("*** Values before Calculation *** ");
      console.log("City Value:", value);
      console.log("City Records:", this._cityList);
      this.city_obj = this._cityList.find(obj => obj.city_name === value);
      console.log(this.city_obj);

      if (this.city_obj) {
        // Set the values to hiddenn fields
        this.createArea.controls["city_id"].setValue(this.city_obj.city_id);
        this.createArea.controls["state_id"].setValue(this.city_obj.state_id);
        this.createArea.controls["state"].setValue(this.city_obj.state_name);
      } else {
        this.createArea.controls["city_id"].setValue(null);
        this.createArea.controls["state_id"].setValue(null);
        this.createArea.controls["state"].setValue(null);
        this.createArea.controls["state"].markAsTouched({ onlySelf: true });
      }
    });

    
    //subscribe for area name value channge
      this.area_name.valueChanges.subscribe((value: string) => {
        console.log(
          "%c ------------------  Event Change Area_name ------------------",
          "background: green; color: white; display: block;"
        );
        console.log("area_name Value:", value);

        this.showAlertMessage = false; 

        // checking for dublicate entry of area name and display warning alert message
        this.area_name_obj = this._areaList.find( obj => obj.area_name.toLocaleLowerCase() === value.toLowerCase() );
        
        if(this.area_name_obj) {
          this.showAlertMessage = true; 
          console.log('obj',this.area_name_obj.area_name);
        }
          
    });

  }

  //  ~ End -constructor  --------------------------------------------------------------------------------------

  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start -ngOnInit  ---------------------------------------------------------------------------------------
  ngOnInit() {


    // initialize and execute jquery document ready
    this.zone.run(() => {
      // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
      // https://angular.io/api/core/NgZone

      $(document).ready(function() {
        $("select").select();
        $("input#input_text, textarea#textarea2").characterCounter();

        // intialize input label
        M.updateTextFields();
      });
    });

    console.log(
      "%c ---------------------------- *****  Inside Create Area component ngonInit ***** ---------------------------- ",
      "background: #dd2c00;color: white; font-weight: bold;"
    );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.createAreaPersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );
    console.warn("----------------- User Login ----------------- ");
    console.dir(this._userLogin);

    // make call to get user profile details
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.userProfileService
      .makeRequest_UserProfile(this._userLogin)
      .subscribe(response => {
        this._userProfileData = response;

        console.warn(
          "----------------- User Profile Response ----------------- "
        );
        console.log(this._userProfileData);
        console.log(this._userProfileData.ownerDetails);

        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this._userProfileData.ownerDetails
        );
        // console.log(this._userProfileData.ownerDetails);
       
    // make call for retrieving Area List
    //  ~ Start -retrieving Area List  ------------------------------------------------------------------------------------------
      this.callHttpGet.makeRequest_GetArea(this.getRequestInput).subscribe(response => {
      
       // UnZipping and uncompress for retrieving  List
     this.gzipService.makeRequest_uncompress(response).then(function(result) {
        this._areaList = result.areaList;

          console.log(
            "%c Area List ***** -------------------------------------------------------------------------- ",
            "background: #ff5722;font-weight: bold;color: white; "
          );
          console.log(this._areaList);
        }.bind(this)) 


        }); // ~ End -retrieving Area List---------------------------------------------------------------------

      });
    // ~ End  --------------------------------------------------------------------------------------------------

    // make call to get user profile details
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.callHttpGet.makeRequest_getCityList().subscribe(response => {
      console.log(
        "%c City List ***** -------------------------------------------------------------------------- ",
        "background: #ff5722;font-weight: bold;color: white; "
      );

      this._cityList = response.cityList;
      console.log(this._cityList);
      console.log(this._cityList.slice());
    });
    // ~ End  -------------------------------------------------------------------------------------------------


  }

  //  ~ End -ngOnInit  -------------------------------------------------------------------------------------

  // --  @details :  onSubmit ##################################################################################
  //  ~ Start -onSubmit  ---------------------------------------------------------------------------------------

  onSubmit(value: string): void {
    /* @details - Check for fields validity
        ++ Check the createArea validity
          ** If the form state is invalid call validateAllFormFields service
          ** If the form state is valid call http service
   */

    if (this.createArea.valid && this.showAlertMessage == false) {
      console.log(
        "%c Form Submitted Values ***** -------------------------------------------------------------------------- ",
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
      this.postRequestObject.records[0].area_name     = this.formValuesJSON.area_name;
      this.postRequestObject.records[0].city          = this.formValuesJSON.city;
      this.postRequestObject.records[0].city_id       = this.formValuesJSON.city_id;
      this.postRequestObject.records[0].state         = this.formValuesJSON.state;
      this.postRequestObject.records[0].state_id      = this.formValuesJSON.state_id;
      this.postRequestObject.records[0].pincode       = this.formValuesJSON.pincode;
      this.postRequestObject.records[0].owner_id      = this._userProfileData.ownerDetails.owner_id;
      this.postRequestObject.records[0].created_by    = this._userProfileData.userDetails.user_name;
      this.postRequestObject.records[0].created_by_id = this._userProfileData.userDetails.user_id;
      this.postRequestObject.records[0].comments      = 
        this._userProfileData.userDetails.user_name +
        " created a new area " +
        this.formValuesJSON.area_name +
        " on " +
        this.currentDate;

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

     //  Check result of buttom click - start ----------------------------------------------------------------------
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

                } // Check reponse for success or failure - start

             });

           //  ~ End  --  post reqest call-------------------------------------------------------------------------

     } //  Check result of buttom click - End ----------------------------------------------------------------------

   });  //  call sweet alert - End ___________________________________________________________________________________________________ 



    } else {
      if(this.showAlertMessage) {
        
        this.notification.ShowCustomMessage('w' , 'This Area Already Exist!');
      } 
      else {
        this.validateFields.validateAllFormFields(this.createArea);
        this.notification.ShowPreDefinedMessage('w', 'CMN-001');
      }
    }
  }

  //  ~ End -onSubmit  ---------------------------------------------------------------------------------------

  getCityList() {
    this.filteredCities = this.city.valueChanges.pipe(
      startWith(""),
      map(
        cityValue => 
          cityValue ? this.filterCities(cityValue): this._cityList.slice()
      )
    );

    console.warn("----------------- filteredCities ----------------- ");
    console.warn(this.filteredCities);
  }

  filterCities(city_value: string) {
    console.log(
      "%c filterCities ***** -------------------------------------------------------------------------- ",
      "background: #4caf50;font-weight: bold;color: white; "
    );
    console.log(city_value.toLowerCase());

    return this._cityList.filter(
      city => 
        city.city_name.toLowerCase().indexOf(city_value.toLowerCase()) === 0
    );
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




}

// -------------------  Component & Class Definition - End -----------------------------------------------
