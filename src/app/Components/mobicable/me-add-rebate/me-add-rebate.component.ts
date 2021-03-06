/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR ADD REBATE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   25-MAY-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Ability to add balance/credit for a customer
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 25-MAY-2018    v1.0     - Created the New Component.
____________________________________________________________________________________________________________

*/
// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities

import { Component, OnInit, NgZone } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PersistenceService } from "angular-persistence";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";

// Import Additional Libraries/Functionalities
import { MatSnackBar } from "@angular/material";
import swal from "sweetalert2";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService        } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService        } from "../../../Service/me-user-profile.service";
import { MeValidateFormFieldsService } from "../../../Service/me-validate-form-fields.service";
import { MeCallHttpPostService       } from "../../../Service/me-call-http-post.service";
import { StorageType                 } from "../../../Service/Interfaces/storage-type.enum";
import { MeSendSmsService } from "../../../Service/me-send-sms.service";
import { MeToastNotificationService } from './../../../Service/me-toast-notification.service'; // This Service for custom toast notification

declare var $:      any;
declare var M:      any;
// declare var jsPDF: any;

//  ~ End  -------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-me-add-rebate',
  templateUrl: './me-add-rebate.component.html',
  styleUrls: ['./me-add-rebate.component.css']
})
export class MeAddRebateComponent implements OnInit {

// -- @details : Class variable declaration ###################################################################
  //  ~ Start  __________________________________________________________________________________________________

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  collectPayment: FormGroup;

  //-- Create List of Form Fields
  rebateAmount: AbstractControl;
  rebateRemarks: AbstractControl;

  IsformValid          : any     = "";
  customer_number_param: any     = "";
  showLoader           : boolean = false;
  showAlertMessage     : boolean = false;
  customerPhone        : any;

  billNumber             : any = "";
  billMonth              : any = "";
  billDate               : any = "";
  billType               : any = "";

  rent_amount             : any = "";
  CGSTAmount              : any = "";
  SGSTAmount              : any = "";
  totalTax                : any = "";
  billAmount              : any = "";
  previousDue             : any = "";
  partialPayment          : any = "";
  collectionAmount        : any = "";
  collectionAmountDisplay : any = "";
  amountRebateDisplay     : any = "";
  availableBalDisplay     : any = "";
  additionalCharge        : any = "";
  rebateAmountTillDate    : any = "";

  originalCollectionAmt : any = "";
  receivedAmt           : any = "";
  outstadingBal         : any = "";
  availableBal          : any = "";
  collectedOn           : any = "";
  collectedBy           : any = "";

  redFlag               : boolean = false;
  orangeFlag            : boolean = false;
  greenFlag             : boolean = false;
  showSubmit            : boolean = false;
  showCollectionSummary : boolean = false;
  showRebateSummary     : boolean = false;
  isReadOnly            : boolean = false;
  showMessage           : boolean = false;


  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput    : any = "";
  private _userProfileData   : any;
  private _userLogin         : any;
  
  sms_phone        : any;
  sms_customer_name: any;
  sms_text         : any;
  outstandingAmt   : any;
  customerObject   : any;
  serial           : any;
  avail_bal        : any;
  date             : any;
  month            : any;
  bill_date        : any;
  overDue          : any;

  private _latestBill   : any;
  billDetailsList : any    = [];

  private formValuesJSON: any      = null;
  private currentDate              = new Date().toString();

  private customer_params : any = {
    "customer_number" : null,
    "owner_id": null
  };    

  private postRequestObject: any = {
    records: [
      {
        bill_details: {
          bill_id    : null
        },
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

  // variable to toggle sidebar
  _opened: boolean = false;
  ownerCompanyName: String = "";
  
//Url Variabes
public id:any;
public source:string;

  //  ~ End  _________________________________________________________________________________________________


  constructor(
            fb                              : FormBuilder,
    public  callHttpGet                     : MeCallHttpGetService,
    public  callHttpPost                    : MeCallHttpPostService,
    public  userProfileService              : MeUserProfileService,
    private collectPaymentPersistenceService: PersistenceService,
    private validateFields                  : MeValidateFormFieldsService,
    public  snackBar                        : MatSnackBar,
    public  zone                            : NgZone,
    public  route                           : ActivatedRoute,
    public  router                          : Router,
    public  callservice                     : MeSendSmsService,
    public  notification                    : MeToastNotificationService
  ) { 
    // set the show loader flag to true
    this.showLoader        = true;
    this.showRebateSummary = false;


    this.route.queryParams.subscribe(params => {
      this.id = params["id"];
      this.source = params["Source"];
  });

    console.log('Id',this.id,'source',this.source);
    this.customer_number_param = +this.id;   

   console.log("---- --- --- Display ID Received ---- --- ---");
    console.log(this.customer_number_param);

/*
@details -  Intialize the form group with fields
  ++ The fields are set to default values - in below case to - null.
  ++ The fields are assigned validators
      ** Required Validator
*/

    //Set and Intialize Form Group.
    this.collectPayment = fb.group({
      rebateAmount: [null, Validators.required],
      rebateRemarks: [null,Validators.required]
    });

    // Assign form controls to private variables.
    // Controls are used in me-create-area.component.html for accessing values and checking functionalities
    this.rebateAmount = this.collectPayment.controls["rebateAmount"];
    this.rebateRemarks = this.collectPayment.controls["rebateRemarks"];

    // assign default values

    this.amountRebateDisplay = 0;

    //subscribe for add balance value channge 
    this.rebateAmount.valueChanges.subscribe((value: string) => {
      console.log(
        "%c ------------------  Event Change rebateAmount ------------------",
        "background: green; color: white; display: block;"
      );

      if (value) {

        if(this._latestBill.billSummary.bill_type === 'UP' || this._latestBill.billSummary.bill_type === 'PP') {
          
          this.amountRebateDisplay    = value;
          this.collectionAmountDisplay = parseFloat(this._latestBill.billSummary.collection_amount) - parseFloat(this.amountRebateDisplay);
          this.showRebateSummary       = true;

          if(this.collectionAmountDisplay < 0 ) {
            // show alert  
            this.showMessage = true;
            this.showAlertMessage = true; 

          }
          else{
            // show alert  
            this.showMessage = false;
            this.showAlertMessage = false; 
            
          }
          
        }


      }  
      else{

        this.amountRebateDisplay     = 0;
        this.collectionAmountDisplay = 0;

      }



    });

  }
 
  //  ~ End -constructor  --------------------------------------------------------------------------------------

  ngOnInit() {
    
    // set the show loader flag to true
    this.showLoader = true;
    this.showRebateSummary = false;

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
      "%c ---------------------------- *****  Inside Collect Payment component ngonInit ***** ---------------------------- ",
      "background: #dd2c00;color: white; font-weight: bold;"
    );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.collectPaymentPersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );
    console.warn("----------------- User Login ----------------- ");
    console.dir(this._userLogin);

    // make call to get user profile details
    //  ~ Start  ------------------------------------------------------------------------------------------
    this.userProfileService
      .makeRequest_UserProfile(this._userLogin)
      .subscribe(response => {
        this._userProfileData = response;

        console.warn(
          "----------------- User Profile Response ----------------- "
        );
        console.log(this._userProfileData);
        console.log(this._userProfileData.ownerDetails);

      // make call to get customer bill details
      //  ~ Start - get customer bill details  --------------------------------------------------------------
       
      // assigng to display in header nav bar
      this.ownerCompanyName = response.ownerDetails.owner_company_name;
      
      // Intialize input parameters for get request  
      this.customer_params.customer_number    = this.customer_number_param;
      this.customer_params.owner_id           = this._userProfileData.ownerDetails.owner_id;
      this.customer_params.owner_company_name = this._userProfileData.ownerDetails.owner_company_name;

      // get the Input JSON format for making http request.
       this.getRequestInput = this.callHttpGet.createGetRequestRecord(
        this.customer_params
      );

      console.log(
        "%c ---------------------------- *****  getRequestInput  ***** ---------------------------- ",
        "background: #dd2c00;color: white; font-weight: bold;"
      );

      console.log(
        "%c  Request Input : >>> ",
        "color: light; font-weight: bold;",
        this.getRequestInput
      );

      this.callHttpGet.makeRequest_GetLatestBill(this.getRequestInput).subscribe(
        response => {

            // Log Response - Remove Later
            console.warn(
              "%c ___________________________ Get Latest Bill Response ___________________________",
              "background: #ff9800;color: black; font-weight: bold;"
            );

            console.log(response);

            this._latestBill = response;

            if(this._latestBill){

              //assign bill summary
              this.billNumber = this._latestBill.billSummary.bill_id;
              this.billMonth  = this._latestBill.billSummary.bill_date;
              this.billDate   = this._latestBill.billSummary.bill_date;
               
              // assign totals
              this.previousDue          = this._latestBill.billSummary.previous_due;
              this.partialPayment       = this._latestBill.billSummary.partial_amount;
              this.rent_amount          = this._latestBill.billSummary.rent_amount;
              this.CGSTAmount           = this._latestBill.billSummary.cgst_total;
              this.SGSTAmount           = this._latestBill.billSummary.sgst_total;
              this.totalTax             = this._latestBill.billSummary.tax_total;
              this.billAmount           = this._latestBill.billSummary.bill_amount;
              this.collectionAmount     = this._latestBill.billSummary.collection_amount;
              this.additionalCharge     = this._latestBill.billSummary.additional_charge | 0;
              this.rebateAmountTillDate = this._latestBill.billSummary.rebate_amount | 0;


              // set bill status 

              // Bill Status-  partiallly paid 
              if(this._latestBill.billSummary.bill_type === 'PP') {

                this.billType = "Partially Paid";

                this.greenFlag  = false;
                this.redFlag    = false;
                this.orangeFlag = true;

                if(this._latestBill.billSummary.received_amount > 0 ) {
                  this.showCollectionSummary = true;

                  // set values
                  this.originalCollectionAmt = this._latestBill.billSummary.collection_amount_original;
                  this.receivedAmt           = this._latestBill.billSummary.received_amount;
                  this.outstadingBal         = this._latestBill.billSummary.outstanding_balance;
                  this.availableBal          = this._latestBill.customerTran.available_balance;
                  this.collectedOn           = this._latestBill.billSummary.received_date;
                  this.collectedBy           = this._latestBill.billSummary.user_name;
                }
               
                else {
                  this.showCollectionSummary = false;
                }

              }
              else if(this._latestBill.billSummary.bill_type === 'UP') {

                this.billType = "Unpaid";

                this.greenFlag  = false;
                this.redFlag    = true;
                this.orangeFlag = false;

                //hide submit button
                this.showCollectionSummary = false;

              }
              else if(this._latestBill.billSummary.bill_type === 'FP') {

                this.billType = "Fully Paid";

                this.greenFlag  = true;
                this.redFlag    = false;
                this.orangeFlag = false;

                if(this._latestBill.billSummary.received_amount > 0 ) {
                  this.showCollectionSummary = true;
                   

                  // set values
                  this.originalCollectionAmt = this._latestBill.billSummary.collection_amount_original;
                  this.receivedAmt           = this._latestBill.billSummary.received_amount;
                  this.outstadingBal         = this._latestBill.billSummary.outstanding_balance;
                  this.availableBal          = this._latestBill.customerTran.available_balance;
                  this.collectedOn           = this._latestBill.billSummary.received_date;
                  this.collectedBy           = this._latestBill.billSummary.user_name;
                }
               
                else {
                  this.showCollectionSummary = false;
                }

              }


            }

            // hide loader
            this.showLoader = false;

      });

      //  ~ End - get customer bill details  -------------------------------------------------------------

      });
    // ~ End  ---------------------------------------------------------------------------------------------
  }
  //  ~ End -ngOnInit  -------------------------------------------------------------------------------------
 

  // -- onSubmit -------------------------- ~start ---------------
  onSubmit(value: string): void {
    /* @details - Check for fields validity
       
    */

    if (this.collectPayment.valid && this.showAlertMessage == false) {
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
      console.log("this._latestBill.customer_number " + this._latestBill.customer_number);
      console.log("this._latestBill.customer_id " + this._latestBill.customer_id);

    
      this.postRequestObject.records[0].customer_details.customer_number = this._latestBill.billSummary.customer_number;
      this.postRequestObject.records[0].customer_details.customer_id     = this._latestBill.billSummary.customer_id;
      this.postRequestObject.records[0].customer_details.user_id         = this._userProfileData.userDetails.user_id;
      this.postRequestObject.records[0].customer_details.user_name       = this._userProfileData.userDetails.user_name;
      this.postRequestObject.records[0].customer_details.owner_id        = this._userProfileData.ownerDetails.owner_id;
      this.postRequestObject.records[0].customer_details.comments        = 
        this._userProfileData.userDetails.user_name + " added rebate Rs. " +
        this.formValuesJSON.rebateAmount + " on " + this.currentDate;

      this.postRequestObject.records[0].payment_details.payment_amount   = this.formValuesJSON.rebateAmount;
      this.postRequestObject.records[0].payment_details.payment_remarks  = this.formValuesJSON.rebateRemarks;
      this.postRequestObject.records[0].payment_details.payment_action   = "ADDRBT";
      this.postRequestObject.records[0].payment_details.payment_mode     = "NONE";
      this.postRequestObject.records[0].payment_details.created_by       = this._userProfileData.userDetails.user_name;
      this.postRequestObject.records[0].payment_details.created_by_id    = this._userProfileData.userDetails.user_id;

      this.postRequestObject.records[0].bill_details.bill_id             = this._latestBill.billSummary.bill_id;

      console.log(
        "%c Pack Object After ***** -------------------------------------------------------------------------- ",
        "background: #91dd4a;font-weight: bold;color: white; "
      );
      console.log(JSON.stringify(this.postRequestObject));


    //  call sweet alert - Start ________________________________________________________________________________________________________
      swal({
        title: "Are you sure?",
        type: "warning",
        text: "Changes will be saved...",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Proceed!",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        reverseButtons: true
      }).then(result => {
        console.log(result);
     
        //  Check result of buttom click - start ----------------------------------------------------------------------
      if (result.value) {
        console.log(result.value);
        
        swal({
          title: "Processing...",
          titleText: "Your record is being saved...",
          text: "Please do not refresh this page or click back button",
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          onOpen: () => {
            swal.showLoading();
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
          
            // Check reponse for success or failure - start
            if ((response.p_out_mssg_flg = "S")) {

              // SMS Integration - Start
             
              // this.sms_phone  = this.customerObject[0].phone;  
              // this.sms_customer_name        =   this.customerObject[0].full_name;

              // this.outstandingAmt = parseFloat(this.collectionAmountDisplay) - parseFloat(this.formValuesJSON.receivedAmount);
              
              // if (this.outstandingAmt >= 0) {
              //   this.sms_text          = "Dear "+this.sms_customer_name+", Thank your for payment of Rs. "+ this.formValuesJSON.receivedAmount +". Your outstanding balance is Rs. " + this.outstandingAmt;  //sms content
              //   this.overDue = this.outstandingAmt;
              // }
              // if (this.outstandingAmt < 0) {
              //     this.avail_bal = this.outstandingAmt * -1;  
              //     this.sms_text          = "Dear "+this.sms_customer_name+", Thank your for payment of Rs. "+ this.formValuesJSON.receivedAmount +". Your available balance is Rs. " + this.avail_bal;  //sms content
              //     this.overDue = this.avail_bal;
              // }

              // console.log(
              //   "%c Request Parameters for SMS***** -------------------------------------------------------------------------- ",
              //   "background: #8bc34a;font-weight: bold;color: white; "
              // );
              // console.log(this.sms_phone,this.sms_customer_name,this.sms_text);
              // console.log(this.collectionAmountDisplay,this.formValuesJSON.receivedAmount)
              // this.callservice.makeRequest_sendSMS(this.sms_phone,this.sms_text).subscribe(
              //   response => {

              //         console.warn(
              //           "%c ___________________________ SMS Response ___________________________",
              //           "background: #c6ff00;color: black; font-weight: bold;"
              //         );
              //       console.log(response);
                
              //   });
               
              // swal ~ start -----
              swal({
                type: "success",
                title: "Your work has been saved",
                text: "Click OK to proceed...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                showConfirmButton: true,
              }).then(result => {
                if (result.value) {
                  this.router.navigate([this.source]);
                }
              }); // swal ~ end -----
            } else if ((response.p_out_mssg_flg = "E")) {
              // swal ~ start -----
              swal({
                type: "error",
                title: "Failed to process your work",
                text: "Click OK to proceed...",
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                showConfirmButton: true
              }).then(result => {
                if (result.value) {
                  this.router.navigate([this.source]);
                }
              }); // swal ~ end -----
            } // Check reponse for success or failure - start
        
          });
                //  ~ End  --  post reqest call-------------------------------------------------------------------------
   
    }//  Check result of buttom click - End ----------------------------------------------------------------------
    }); //  call sweet alert - End ___________________________________________________________________________________________________


    } else {

      if(this.showAlertMessage) {
        this.notification.ShowCustomMessage('w' , 'Rebate amount cannot exceed collection amount!');
      } 
      else {
        this.validateFields.validateAllFormFields(this.collectPayment);
        this.notification.ShowPreDefinedMessage('w','CMN-001');
      }
    }
  }


  // -- onSubmit -------------------------- ~end ---------------

   // --  @details :  receiveCustomerObject (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  receiveCustomerObject($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this.customerObject = $event;

    console.log("**** @@ Customer Object @@ ****");
    console.log(this.customerObject);
    

  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

  // --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  
  receiveToggleSidebarObj($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this._opened = $event;

    // console.log("**** @@ Sidebar Open Object @@ ****");
    console.log(this._opened);

  }

// variable to toggle sidebar
_toggleSidebar() {
    this._opened = !this._opened;
}

//  ~ End  --------------------------------------------------------------------------------------------
 
// --  @details :  cancelButtonLink ()#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  
  cancelButtonLink(){
    this.router.navigate([this.source]);
  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

}
// -------------------  Component & Class Definition - End -----------------------------------------------
