/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR CREATE PACK ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Ability to Create New Pack
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 24-JAN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start_________________________________________________________________________________________________
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
import { MeCalculatePackPriceService } from "../../../Service/me-calculate-pack-price.service";
import { MeCallHttpPostService } from "../../../Service/me-call-http-post.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { MePackInterface } from "../../../Service/Interfaces/me-pack-interface";
import { MeToastNotificationService } from './../../../Service/me-toast-notification.service'; // This Service for custom toast notification
import { MeGzipService } from '../../../Service/me-gzip.service';


declare var jQuery: any;
declare var $     : any;
declare var M     : any;

//  ~ End _________________________________________________________________________________________________


// -------------------  Component & Class Definition - Start -----------------------------------------------

@Component({
  selector: "app-me-create-pack",
  templateUrl: "./me-create-pack.component.html",
  styleUrls: ["./me-create-pack.component.css"]
})

export class MeCreatePackComponent implements OnInit {

// -- @details : Class variable declaration ###################################################################
//  ~ Start  __________________________________________________________________________________________________

// Class Form variables
// All variables used in component template ( html file ) must be public
  createPack: FormGroup;

  //-- Create List of Fields
  pack_name      : AbstractControl;
  pack_type      : AbstractControl;
  pack_price     : AbstractControl;
  pack_price_type: AbstractControl;
  pack_comments  : AbstractControl;

  base_price  : number;
  cgst_amount : number;
  sgst_amount : number;
  total_tax   : number;
  total_amount: number;
  
  IsformValid : any = "";
  ShowPackPrice:boolean=false;
  showAlertMessage:boolean=false;
  checkValue:any;


// Class Local variables
// All variables used within the class must be private  
  private getRequestInput : any = "";
  private _userProfileData: any;
  private _userLogin      : any;

  private formValuesJSON: any      = null;
  private callHttpPostReponse: any = null;
  private currentDate              = new Date().toString();
  private _packList: MePackInterface[] = [];
  private pack_name_obj      : any     = "";

  private present_PackName     : any = "";


  private postRequestObject: any = {
    records: [
      {
        pack_name      : null,
        pack_type      : null,
        pack_price      : null,
        base_price     : null,
        cgst_amount    : null,
        sgst_amount    : null,
        total_tax      : null,
        total_amount   : null,
        pack_price_type: null,
        gst_applied    : null,
        owner_id       : null,
        created_by_id  : null,
        created_by     : null,
        active         : "Y",
        dmlType        : "I",
        comments       : null,
        recordType     : "N"
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
            fb                          : FormBuilder,
    public  callHttpGet                 : MeCallHttpGetService,
    public  callHttpPost                : MeCallHttpPostService,
    public  userProfileService          : MeUserProfileService,
    private createPackPersistenceService: PersistenceService,
    private validateFields              : MeValidateFormFieldsService,
    public  calculatePrice              : MeCalculatePackPriceService,
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

      this.calculatePrice.base_price=0;
      this.calculatePrice.cgst_amount = 0.00;
      this.calculatePrice.sgst_amount = 0.00;
      this.calculatePrice.total_tax = 0.00;
      this.calculatePrice.total_amount = 0.00;

      this.createPack = fb.group({
        pack_name      : [null, Validators.required],
        pack_type      : [null, Validators.required],
        pack_price     : [ Validators.required],
        pack_price_type: [null, Validators.required],
        pack_comments  : [null]
      });
 
    
      // Assign form controls to private variables
      // Controls are used in me-create-area.component.html for accessing values and checking functionalities
      this.pack_name       = this.createPack.controls["pack_name"];
      this.pack_type       = this.createPack.controls["pack_type"];
      this.pack_price      = this.createPack.controls["pack_price"];
      this.pack_price_type = this.createPack.controls["pack_price_type"];
      this.pack_comments   = this.createPack.controls["pack_comments"];

   
      // Subscribe for pack price changes
      // ~ Start -- pack price changes ------------------------------------
      this.pack_price.valueChanges.subscribe(
        (value: string) => {
          this.ShowPackPrice=false;
          this.checkValue=value;
          if(this.checkValue <= 10){
          this.ShowPackPrice=true;
            }

            if(value === null ) {
              this.createPack.controls['pack_price_type'].setValue(0);
            }
  
            console.log('%c ------------------  Event Change Pack Price ------------------','background: green; color: white; display: block;');
            console.warn('*** Values before Calculation *** ');
            console.log('Pack Price :', value);
            console.log('Pack Type  :', this.createPack.controls['pack_price_type'].value);
  
              this.calculatePrice.calculatePackPrice(
                  this.createPack.controls['pack_price'].value, 
                  this.createPack.controls['pack_price_type'].value 
                );
  
            console.warn('*** Values After Calculation *** ');
            console.log('Base Price :',this.calculatePrice.base_price);
            console.log('Total Tax :',this.calculatePrice.total_tax);
            console.log('Total Amount :',this.calculatePrice.total_amount);
  
          }
        );
      // ~ End -- pack end changes ------------------------------------  
        
      // Subscribe for pack price type changes
      // ~ Start -- pack price type changes ------------------------------------
      this.pack_price_type.valueChanges.subscribe(
            (value: string) => {
    
                console.log('%c ------------------  Event Change Pack Price ------------------','background: blue; color: white; display: block;');
                console.warn('*** Values before Calculation *** ');
                console.log('Price Type changed to:', value);
                console.log('Pack Price :', this.createPack.controls['pack_price'].value);

                  this.calculatePrice.calculatePackPrice(
                      this.createPack.controls['pack_price'].value, 
                      this.createPack.controls['pack_price_type'].value 
                    );
      
                    console.log('Base Price :',this.calculatePrice.base_price);
                    console.log('Total Tax :',this.calculatePrice.total_tax);
                    console.log('Total Amount :',this.calculatePrice.total_amount);

              }
            );
      // ~ End -- pack price type changes ------------------------------------


      this.pack_name.valueChanges.subscribe((value: string)=>{
      this.pack_name_obj=this._packList.find(obj => obj.pack_name === value);

      if(this.pack_name_obj && this.pack_name_obj.pack_name ) {
        this.showAlertMessage = true; 
        // console.log('obj',this.area_name_obj.area_name);
      }
      else {
        this.showAlertMessage = false; 
      }

      });

    }
//  ~ End -constructor ____________________________________________________________________________________

checkPackName(){
  this.showAlertMessage=false;
  this.pack_name_obj = this._packList.find(obj => obj.pack_name.toLocaleLowerCase() === this.pack_name.value.toLowerCase());
  if( this.pack_name_obj){
    this.showAlertMessage=true;
  }
}

// --  @details :  ngOnInit ###############################################################################
//  ~ Start -ngOnInit _____________________________________________________________________________________
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



         // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.createPackPersistenceService.get(
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

        // assigng to display in header nav bar
        this.ownerCompanyName = response.ownerDetails.owner_company_name;

        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this._userProfileData.ownerDetails
        );
        console.log(
          "%c  Request Input : >>> ",
          "color: green; font-weight: bold;",
          this.getRequestInput
        );
        // make call to get list of Packs for the owner
        //  ~ Start  -------------------------------------------------------------------------------------------------

        this.callHttpGet
          .makeRequest_ManagePack(this.getRequestInput)
          .subscribe(response => {

              // UnZipping and uncompress for retrieving Pack List
              this.gzipService.makeRequest_uncompress(response).then(function(result) {

            // Log Response - Remove Later
            console.warn(
              "%c ___________________________ Manage Pack Response ___________________________",
              "background: #ff9800;color: black; font-weight: bold;"
            );

            console.log(result.packList);
            console.log("Pack Length : ", result.packList.length);

            this._packList = result.packList;
          }.bind(this)) 
          });

        //  ~ End  -------------------------------------------------------------------------------------------------
    
      });
    // ~ End  -------------------------------------------------------------------------------------------------

  }
 //  ~ End -ngOnInit _____________________________________________________________________________________

  // -- onSubmit -------------------------- ~start ---------------
  onSubmit(value: string): void {

   /* @details - Check for fields validity
        ++ Check the createArea validity
          ** If the form state is invalid call validateAllFormFields service
          ** If the form state is valid call http service
   */
console.log(this.createPack);
    if (this.createPack.valid && !this.ShowPackPrice && !this.showAlertMessage) {
console.log(!this.ShowPackPrice);
      console.log("Submitted Values: ", value);


      console.log(
        "%c Form Submitted Values ***** -------------------------------------------------------------------------- ",
        "background: #689f38;font-weight: bold;color: white; "
      );
      console.log(value);

      console.log(
        "%c Pack Object Before ***** -------------------------------------------------------------------------- ",
        "background: #7cb342;font-weight: bold;color: white; "
      );
      console.log(this.postRequestObject);

      //create JSON
      this.formValuesJSON = JSON.parse(JSON.stringify(value));
      console.log("--------------- JSON Value ---------------");
      console.log(this.formValuesJSON);

       // Assign Values from values to post request object
       this.postRequestObject.records[0].pack_name       = this.formValuesJSON.pack_name;
       this.postRequestObject.records[0].pack_type       = this.formValuesJSON.pack_type;
       this.postRequestObject.records[0].base_price      = this.calculatePrice.base_price;
       this.postRequestObject.records[0].cgst_amount     = this.calculatePrice.cgst_amount;
       this.postRequestObject.records[0].sgst_amount     = this.calculatePrice.sgst_amount;
       this.postRequestObject.records[0].total_tax       = this.calculatePrice.total_tax;
       this.postRequestObject.records[0].total_amount    = this.calculatePrice.total_amount;
       this.postRequestObject.records[0].pack_price_type = this.formValuesJSON.pack_price_type;
       this.postRequestObject.records[0].pack_price = this.formValuesJSON.pack_price;
       this.postRequestObject.records[0].owner_id        = this._userProfileData.ownerDetails.owner_id;
       this.postRequestObject.records[0].created_by      = this._userProfileData.userDetails.user_name;
       this.postRequestObject.records[0].created_by_id   = this._userProfileData.userDetails.user_id;
       this.postRequestObject.records[0].comments        =  
         this._userProfileData.userDetails.user_name +
         " created a new area " +
         this.formValuesJSON.pack_name +
         " on " +
         this.currentDate; 
 
      if(  this.formValuesJSON.pack_price_type === 'BPGST' || this.formValuesJSON.pack_price_type === 'TPGST'  ) {
        this.postRequestObject.records[0].gst_applied = 'Y';
      }
      else {
        this.postRequestObject.records[0].gst_applied = 'N';
      }

      
      console.log( 
        "%c Pack Object After ***** -------------------------------------------------------------------------- ",
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
             .makeRequest_ManagePack(this.postRequestObject)
             .subscribe(response => {
               // Log Response - Remove Later
               console.warn(
                 "%c ___________________________ Manage Pack Post Response ___________________________",
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
                           this.router.navigateByUrl('/managepack');

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
        this.notification.ShowCustomMessage('w' , 'Pack Name Already Exist!');
      } else {
      this.validateFields.validateAllFormFields(this.createPack);
      this.notification.ShowPreDefinedMessage('w','CMN-001');
    }

  }
}

  // -- onSubmit -------------------------- ~end ---------------

 

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
