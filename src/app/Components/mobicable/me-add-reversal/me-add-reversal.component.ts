/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR ADD BALANCE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Ability to add balance/credit for a customer
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

import { Component,             OnInit,         NgZone }    from "@angular/core";
import { RouterModule,          ActivatedRoute, Router }    from "@angular/router";
import { NgProgressModule,      NgProgress      }      from "@ngx-progressbar/core";
import { NgProgressRouterModule }               from   "@ngx-progressbar/router";
import { ErrorStateMatcher      }               from   "@angular/material/core";
import { PersistenceService }               from   "angular-persistence";

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


import { MatSnackBar } from "@angular/material";
import { startWith   } from "rxjs/operators/startWith";
import { map         } from "rxjs/operators/map";
import { Observable  } from "rxjs/Observable";
import swal from "sweetalert2";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService        } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService        } from "../../../Service/me-user-profile.service";
import { MeValidateFormFieldsService } from "../../../Service/me-validate-form-fields.service";
import { MeCallHttpPostService       } from "../../../Service/me-call-http-post.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { MeToastNotificationService } from './../../../Service/me-toast-notification.service'; // This Service for custom toast notification
import { MeGzipService } from '../../../Service/me-gzip.service';

declare var jQuery: any;
declare var $     : any;
declare var M: any;

//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start -----------------------------------------------
@Component({
  selector   : "app-me-add-reversal",
  templateUrl: "./me-add-reversal.component.html",
  styleUrls: ["./me-add-reversal.component.css"]
})
export class MeAddReversalComponent implements OnInit { 
  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  __________________________________________________________________________________________________

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  addReversal: FormGroup; 

  //-- Create List of Form Fields
  reversalAmount       : AbstractControl;
  balanceRemarks       : AbstractControl;
  IsformValid          : any  = "";
  creditTillDate       : any  = "";
  debitTillDate        : any  = "";
  availableBalance     : any  = "";
  reversalAmountDisplay: any  = "";
  newAvailableBalance  : any  = "";
  customer_number_param: any  = "";
  showLoader           : boolean = false;
  showAlertMessage     : boolean = false;
  ShowReversalAmount   : boolean = false;
  checkValue           :any;
  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput : any = "";
  private _userProfileData: any;
  private _userLogin      : any;
  private _customerDetails: any;
  private _customerBalance: any = [];
  private customerBalance_Obj           : any = "";

  private formValuesJSON     : any = null;
  private callHttpPostReponse: any = null;
  private currentDate        = new Date().toString();

 
  private postRequestObject: any   = {
    records: [
      {
        customer_details: {
          customer_id    : null,
          customer_number: null,
          user_id        : null,
          comments       : null,
          owner_id       : null,
          user_name      : null
     
           
        },
        payment_details: {
          payment_type   : null,
          payment_amount : null,
          payment_action : null,
          payment_remarks: null,
          payment_mode   : null,
          created_by     : null,
          created_by_id  : null,
          created_on     : null,
          modified_by    : null,
          modified_by_id : null,
          modified_on    : null

        }
        
      }
    ]
  };


  // function to open left side navgivation bar
  _opened: boolean = false;

  //Url Variabes
 public id:any;
 public source:string;

  
  //  ~ End  _________________________________________________________________________________________________

  // --  @details :  constructor #############################################################################
  //  ~ Start -constructor ------------------------------------------------------------------------------------

  constructor(
              fb                          : FormBuilder,
      public  callHttpGet                 : MeCallHttpGetService,
      public  callHttpPost                : MeCallHttpPostService,
      public  userProfileService          : MeUserProfileService,
      private addReversalPersistenceService: PersistenceService,
      private validateFields              : MeValidateFormFieldsService,
      public  snackBar                    : MatSnackBar,
      public  zone                        : NgZone,
      public  route                       : ActivatedRoute,
      public  router                      : Router,
     public   notification                : MeToastNotificationService,
     private gzipService       :MeGzipService,
  ) {

   // set the show loader flag to true
   this.showLoader = true;

   this.route.queryParams.subscribe(params => {
    this.id = params["id"];
    this.source = params["Source"];
  });

  console.log('Id',this.id,'source',this.source);

  this.customer_number_param = +this.id;
  
  console.log("---- --- --- Display ID Received ---- --- ---");
   console.log( this.customer_number_param);

    /*
       @details -  Intialize the form group with fields
          ++ The fields are set to default values - in below case to - null.
          ++ The fields are assigned validators
              ** Required Validator
      */

    //Set and Intialize Form Group.
    this.addReversal = fb.group({
      reversalAmount : [null, Validators.required],
      balanceRemarks: [null]
    });

    // Assign form controls to private variables.
    // Controls are used in me-create-area.component.html for accessing values and checking functionalities
    this.reversalAmount = this.addReversal.controls["reversalAmount"];
    this.balanceRemarks = this.addReversal.controls["balanceRemarks"];

    // assign default values

    this.creditTillDate        = 0;
    this.debitTillDate         = 0;
    this.availableBalance      = 0;
    this.reversalAmountDisplay = 0;
    this.newAvailableBalance   = 0;

    //subscribe for add balance value channge
    this.reversalAmount.valueChanges.subscribe((value: string) => {
      console.log(
        "%c ------------------  Event Change reversalAmount ------------------",
        "background: green; color: white; display: block;" 
      );
      console.log("reversalAmount Value:", value);
      this.checkValue=value;

      this.ShowReversalAmount=false;
      if(value){
        if(this.checkValue <= 10){
          this.ShowReversalAmount=true;
            }
        this.reversalAmountDisplay = value;
        this.newAvailableBalance = parseFloat(this.availableBalance) - parseFloat(value);

        if( this.newAvailableBalance < 0 ) {
          this.showAlertMessage = true; 
        }
        else if( this.newAvailableBalance >= 0 ) {
          this.showAlertMessage = false; 
        }

      }
      else {
        this.reversalAmountDisplay = 0;
        this.newAvailableBalance = 0;
      }


    });
  }

  //  ~ End -constructor  --------------------------------------------------------------------------------------

  ngOnInit() {

    // set the show loader flag to true
    this.showLoader = true;

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
    this._userLogin = this.addReversalPersistenceService.get(
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
      console.log(
        "%c  Request Input : >>> ",
        "color: green; font-weight: bold;",
        this.getRequestInput
      );


   
       // make call to get list of customer balance details
      //  ~ Start  -------------------------------------------------------------------------------------------------

      this.callHttpGet.makeRequest_GetCustomerBalance(this.getRequestInput).subscribe(response => {
        // Log Response - Remove Later
        // console.warn(
        //   "%c ___________________________ Manage Payments Response ___________________________",
        //   "background: #ff9800;color: black; font-weight: bold;"
        // );

        // console.log(response.balanceList);
        // console.log("Balance Response Length : ", response.balanceList.length);

        this.gzipService.makeRequest_uncompress(response).then(function(result) {
              
          this._customerBalance = result.balanceList;

        if( this._customerBalance.length > 0 ) {

          // private customerBalance_Obj           : any = "";

          this.customerBalance_Obj = this._customerBalance.find(
            obj => obj.customer_number === this.customer_number_param
          );

          console.log("-- Balance Object --");
          console.log(this.customerBalance_Obj);

          // assign values

          this.creditTillDate   = this.customerBalance_Obj.credit_till_date;
          this.debitTillDate    = this.customerBalance_Obj.debit_till_date;
          this.availableBalance = this.customerBalance_Obj.available_balance;


          // set the show loader flag to true
          this.showLoader = false;

        }
        else
        {
          console.error('Failed to fetch records - Customer Balance List');
        }

        }.bind(this))

        


      });  //  ~ End  -------------------------------------------------------------------------------------------------


      });
    // ~ End  -------------------------------------------------------------------------------------------------

   

  

  }
  //  ~ End -ngOnInit  -------------------------------------------------------------------------------------




  // -- onSubmit -------------------------- ~start ---------------
  onSubmit(value: string): void {

    /* @details - Check for fields validity
         ++ Check the createArea validity
           ** If the form state is invalid call validateAllFormFields service
           ** If the form state is valid call http service
    */
        if(!this.addReversal.dirty){
          this.notification.ShowPreDefinedMessage('I','CMN-002'
      );
      }
 
     else if (this.addReversal.valid && !this.ShowReversalAmount) {
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
        this.postRequestObject.records[0].customer_details.customer_number =       this.customerBalance_Obj.customer_number;
        this.postRequestObject.records[0].customer_details.customer_id     =       this.customerBalance_Obj.customer_id;
        this.postRequestObject.records[0].customer_details.user_id         =       this._userProfileData.userDetails.user_id;
        this.postRequestObject.records[0].customer_details.user_name       =       this._userProfileData.userDetails.user_name;
        this.postRequestObject.records[0].customer_details.owner_id        =       this._userProfileData.ownerDetails.owner_id;
        this.postRequestObject.records[0].customer_details.comments        = 
                              this._userProfileData.userDetails.user_name                        + " added reversal Rs.  " +
                              this.formValuesJSON.reversalAmount                                      + " on " + this.currentDate; 

        this.postRequestObject.records[0].payment_details.payment_amount   =       this.formValuesJSON.reversalAmount;
        this.postRequestObject.records[0].payment_details.payment_remarks  =       this.formValuesJSON.balanceRemarks;
        this.postRequestObject.records[0].payment_details.payment_type     =       'ADDRVSL';
        this.postRequestObject.records[0].payment_details.payment_action   =       'ADDRVSL';
        this.postRequestObject.records[0].payment_details.payment_mode     =       'CASH';
        this.postRequestObject.records[0].payment_details.created_by       =       this._userProfileData.userDetails.user_name;
        this.postRequestObject.records[0].payment_details.created_by_id    =       this._userProfileData.userDetails.user_id;

      
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
             allowEnterKey : false,
             reverseButtons: true
             
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
                 .makeRequest_ManagePayments(this.postRequestObject)
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
                              this.router.navigate([this.source]);
    
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
       this.validateFields.validateAllFormFields(this.addReversal);
       this.notification.ShowPreDefinedMessage('w','CMN-001');
     }
 
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

// --  @details :  cancelButtonLink (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  
  cancelButtonLink(){
    this.router.navigate([this.source]);
  }

  //  ~ End  ----------------------------------------------------------------------------------------------------


}

// -------------------  Component & Class Definition - End -----------------------------------------------
