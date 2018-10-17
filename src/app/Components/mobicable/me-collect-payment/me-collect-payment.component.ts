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
|   ++ 27-MAR-2018    v0.17    - Added the Send SMS Service.
____________________________________________________________________________________________________________

*/
// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities

import { Component, OnInit, NgZone } from "@angular/core";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { NgProgressRouterModule } from "@ngx-progressbar/router";
import { ErrorStateMatcher } from "@angular/material/core";
import { PersistenceService } from "angular-persistence";
import { DatePipe } from '@angular/common';
import { Output , EventEmitter , Input } from "@angular/core";


import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
 
} from "@angular/forms";

import {    MatSnackBar, getMatFormFieldPlaceholderConflictError } from "@angular/material";
import {    startWith   } from "rxjs/operators/startWith";
import {    map         } from "rxjs/operators/map";
import {    Observable  } from "rxjs/Observable";
import swal from        "sweetalert2";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService        } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService        } from "../../../Service/me-user-profile.service";
import { MeValidateFormFieldsService } from "../../../Service/me-validate-form-fields.service";
import { MeCallHttpPostService       } from "../../../Service/me-call-http-post.service";
import { StorageType                 } from "../../../Service/Interfaces/storage-type.enum";
import { MeSendSmsService } from "../../../Service/me-send-sms.service";
import { MeCustomerDetailsComponent } from "../me-customer-details/me-customer-details.component";
import { MeToastNotificationService } from './../../../Service/me-toast-notification.service'; // This Service for custom toast notification
import * as moment from 'moment';
//import { DatePipe } from '@angular/common';
import * as jsPDF from 'jspdf';

declare var jQuery: any;
declare var $:      any;
declare var M:      any;
// declare var jsPDF: any;

//  ~ End  -------------------------------------------------------------------------------------------------

@Component({
  selector: "app-me-collect-payment",
  templateUrl: "./me-collect-payment.component.html",
  styleUrls: ["./me-collect-payment.component.css"]
})
export class MeCollectPaymentComponent implements OnInit {
  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  __________________________________________________________________________________________________

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  collectPayment: FormGroup;



  //-- Create List of Form Fields
  receivedAmount         : AbstractControl;
  collectionRemarks      : AbstractControl;
  payment_mode           : AbstractControl;

  IsformValid            : any     = "";
  customer_number_param  : any      = "";
  showLoader             : boolean = false;
  showRemarkNA           : boolean = false;
  showRemarkNOB          : boolean = false;
  showRemarkEXS          : boolean = false;
  showRemarkLSS          : boolean = false;

  DisplayBalanceRemarks     : any;
  customerPhone : any;

  billNumber             : any = "";
  billMonth              : any = "";
  billDate               : any = "";
  billType               : any = "";

  rent_amount            : any = "";
  CGSTAmount             : any = "";
  SGSTAmount             : any = "";
  totalTax               : any = "";
  billAmount             : any = "";
  additionalCharge       : any = "";
  rebateAmount           : any = "";
  previousDue            : any = "";
  partialPayment         : any = "";
  collectionAmountDisplay: any = "";
  receivedAmountDisplay  : any = "";
  rebateAmountDisplay    : any = "";
  receivedAmountEntered  : any = "";
  outstandingAmount      : any = "";

  originalCollectionAmt : any = "";
  outstadingBal         : any = "";
  availableBal          : any = "";
  collectedOn           : any = "";
  collectedBy           : any = "";
  
  subscription : any = "";
  subscriptionPack : any = "";
  packName : any = "";
  vcNumber : any = "";
  xOffset : any;
  offset : any;

  redFlag               : boolean = false;
  orangeFlag            : boolean = false;
  greenFlag             : boolean = false;
  showSubmit            : boolean = false;
  showCollectionSummary : boolean = false;
  showCollectionEntry   : boolean = false;
  isReadOnly            : boolean = false;

  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput    : any = "";
  private _userProfileData   : any;
  private _userLogin         : any;
  private _customerDetails   : any;
  private _customerBalance   : any = [];
  private customerBalance_Obj: any = "";
 
  owner_meta             : any = "";
  customer_meta           : any;

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
  private callHttpPostReponse: any = null;
  private currentDate              = new Date().toString();
  private presentDate                = new Date().toLocaleString();


  smsDueAmount:any;
  private messageTemplate:any={
    cust_details: [{
      tran_amount: null,
      due_amnt: null,
      company_name: null,
      NAME: null,
      mobile_number: null
    }],
    count_details: [{
      cust_count: 1
    }],
    sms_details: [{
      system: 'cableguy',
      msg_id: 2,
      temp_id: 1
    }]
    }


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

  // function to open left side navgivation bar
  _opened: boolean = false;
  ownerCompanyName: String = "";

  tempVcNumber : any;
  tempPackName : any;

  _toggleSidebar() {
      this._opened = !this._opened;
  }



//Url Variabes
public id:any;
public source:string;

  //  ~ End  _________________________________________________________________________________________________

  // --  @details :  constructor #############################################################################
  //  ~ Start -constructor ------------------------------------------------------------------------------------
  constructor(
            fb                           : FormBuilder,
    public  callHttpGet                  : MeCallHttpGetService,
    public  callHttpPost                 : MeCallHttpPostService,
    public  userProfileService           : MeUserProfileService,
    private collectPaymentPersistenceService: PersistenceService,
    private validateFields               : MeValidateFormFieldsService,
    public  snackBar                     : MatSnackBar,
    public  zone                         : NgZone,
    public  route                        : ActivatedRoute,
    public  router                       : Router,
    public callservice                   : MeSendSmsService,
    public notification                  : MeToastNotificationService
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
    console.log(this.customer_number_param);

    /*
@details -  Intialize the form group with fields
++ The fields are set to default values - in below case to - null.
++ The fields are assigned validators
    ** Required Validator
*/

    //Set and Intialize Form Group.
    this.collectPayment = fb.group({
      receivedAmount: [null, Validators.required],
      payment_mode: ['CASH', Validators.required],
      collectionRemarks: [null]
    });

    // Assign form controls to private variables.
    // Controls are used in me-create-area.component.html for accessing values and checking functionalities
    this.receivedAmount    = this.collectPayment.controls["receivedAmount"];
    this.collectionRemarks = this.collectPayment.controls["collectionRemarks"];
    this.payment_mode      = this.collectPayment.controls["payment_mode"];
    // assign default values

    this.receivedAmountDisplay = 0;
    this.rebateAmountDisplay = 0;
    this.receivedAmountEntered = 0;
    this.outstandingAmount = 0;



    this.showRemarkNA = true;
    this.showRemarkNOB = false;
    this.showRemarkEXS = false;
    this.showRemarkLSS = false;


    //subscribe for add balance value channge
    this.receivedAmount.valueChanges.subscribe((value: string) => {
      console.log(
        "%c ------------------  Event Change receivedAmount ------------------",
        "background: green; color: white; display: block;"
      );

       if (value) {

        // assign the value entered and caculate outstanding amount
         this.receivedAmountEntered = value;
         this.outstandingAmount = parseFloat(this.receivedAmountEntered) - parseFloat(this.collectionAmountDisplay);

         console.log("Outstanding Amount : ", this.outstandingAmount  );

         // Show message/display remarks based on outstanding amount
         if (this.outstandingAmount < 0) {
          
          this.showRemarkNA = false;
          this.showRemarkNOB = false;
          this.showRemarkEXS = false;
          this.showRemarkLSS = true;

          this.DisplayBalanceRemarks = 'Less Amount';
          console.log('this.DisplayBalanceRemarks',this.DisplayBalanceRemarks);


         } else if (this.outstandingAmount > 0) {

          this.showRemarkNA = false;
          this.showRemarkNOB = false;
          this.showRemarkEXS = true;
          this.showRemarkLSS = false;
          this.DisplayBalanceRemarks = 'Excess Amount';
          console.log('this.DisplayBalanceRemarks',this.DisplayBalanceRemarks);

         }
         else if (this.outstandingAmount === 0)  {
          this.showRemarkNA = false;
          this.showRemarkNOB = true;
          this.showRemarkEXS = false;
          this.showRemarkLSS = false;

          this.DisplayBalanceRemarks = 'No Outstanding';
          console.log('this.DisplayBalanceRemarks',this.DisplayBalanceRemarks);

         }
         
         else {
            this.showRemarkNA = true;
            this.showRemarkNOB = false;
            this.showRemarkEXS = false;
            this.showRemarkLSS = false;

            this.DisplayBalanceRemarks = 'NA';
            console.log('this.DisplayBalanceRemarks',this.DisplayBalanceRemarks);


         }

      
      }
      else {
        this.receivedAmountEntered = 0;

        // reset flags
        this.showRemarkNA = true;
        this.showRemarkNOB = false;
        this.showRemarkEXS = false;
        this.showRemarkLSS = false;
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

      // make call to get customer bill details
      //  ~ Start - get customer bill details  -------------------------------------------------------------------------------------------------
       
      // assigng to display in header nav bar
      this.ownerCompanyName = response.ownerDetails.owner_company_name;
      
      // Intialize input parameters for get request  
      this.customer_params.customer_number = this.customer_number_param;
      this.customer_params.owner_id = this._userProfileData.ownerDetails.owner_id;
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

      this.callHttpGet. makeRequest_GetCustomerMeta(this.getRequestInput).subscribe(
        response => {
          console.warn("Customer Meta")
          console.log(response)
          this.customer_meta = response;
          console.log(this.customer_meta.customer_meta.GSTIN)
        }
  
      )


      this.callHttpGet.makeRequest_GetSubscriptionList(this.getRequestInput).subscribe(
        response => {
          console.warn(
            "%c ___________________________ Subscription Response ___________________________",
            "background: #ff9800;color: black; font-weight: bold;"
          );
          console.log(response);
           this.subscription = response;
          // //JSON.stringify(this.subscription);
          console.log(this.subscription);
          // //console.log(this.subscription.subscription_name);
           this.packName = this.subscription.subscription.map(function (obj){
             return obj.subscription_name;
           });
           console.log(this.packName);
          this.vcNumber = this.subscription.subscription.map(function (obj){
            return obj.stb_vc_number;
           
          });
         
        }
      )

      // Initialize Values to Zero
      this.previousDue             = 0;
      this.partialPayment          = 0;
      this.rent_amount             = 0;
      this.CGSTAmount              = 0;
      this.SGSTAmount              = 0;
      this.totalTax                = 0;
      this.billAmount              = 0;
      this.rebateAmount            = 0;
      this.additionalCharge        = 0;
      this.collectionAmountDisplay = 0;
      this.receivedAmountEntered   = 0;


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
              this.billMonth = this._latestBill.billSummary.bill_date;
              this.billDate = this._latestBill.billSummary.bill_date;

              if ( this._latestBill.billSummary.bill_type === 'FP' ) {
                this.billType = "Fully Paid";

                this.greenFlag  = true;
                this.redFlag    = false;
                this.orangeFlag = false;

                // if full paid set the collection and received amount
                this.collectPayment.controls["receivedAmount"].setValue(this._latestBill.billSummary.received_amount);

                // set values
                this.receivedAmountDisplay =  this._latestBill.billSummary.received_amount;
                this.originalCollectionAmt = 
                  this._latestBill.billSummary.collection_amount_original +
                  this._latestBill.billSummary.additional_charge ;
                                      ;
                this.rebateAmountDisplay   = this._latestBill.billSummary.rebate_amount;  
                this.outstadingBal         = this._latestBill.billSummary.outstanding_balance;
                this.availableBal          = this._latestBill.customerTran.available_balance;
                this.collectedOn           = this._latestBill.billSummary.received_date;
                this.collectedBy           = this._latestBill.billSummary.user_name;
                
                

                //hide submit button
                this.showSubmit = false;
                this.isReadOnly = true;
                this.showCollectionSummary = true;
                this.showCollectionEntry = false;

              }
              if ( this._latestBill.billSummary.bill_type === 'UP' ) {
                this.billType = "Unpaid";

                this.greenFlag  = false;
                this.redFlag    = true;
                this.orangeFlag = false;

                //hide submit button
                this.showSubmit = true;
                this.showCollectionSummary = false;
                this.showCollectionEntry = true;

              }
              if ( this._latestBill.billSummary.bill_type === 'PP' ) {
                this.billType = "Partially Paid";
                this.showCollectionEntry = true;

                this.greenFlag  = false;
                this.redFlag    = false;
                this.orangeFlag = true;

                //hide submit button
                this.showSubmit = true;
                this.isReadOnly = false;
                
                if(this._latestBill.billSummary.received_amount > 0 ) {
                  this.showCollectionSummary = true;
                 

                  // set values
                  this.receivedAmountDisplay =  this._latestBill.billSummary.received_amount;
                  this.originalCollectionAmt =  this._latestBill.billSummary.collection_amount_original +
                                      this._latestBill.billSummary.additional_charge ;
                  this.outstadingBal         = this._latestBill.billSummary.outstanding_balance;
                  this.availableBal          = this._latestBill.customerTran.available_balance;
                  this.collectedOn           = this._latestBill.billSummary.received_date;
                  this.collectedBy           = this._latestBill.billSummary.user_name;
                }
                else {
                  this.showCollectionSummary = false;
                }
                
                // if full paid set the collection and received amount
                // this.collectPayment.controls["receivedAmount"].setValue(response.billSummary.received_amount);

              }

              // assign bill details
              this.billDetailsList = this._latestBill.billDetail;


              // assign totals

              this.previousDue             = this._latestBill.billSummary.previous_due;
              this.partialPayment          = this._latestBill.billSummary.partial_amount;
              this.rent_amount             = this._latestBill.billSummary.rent_amount;
              this.CGSTAmount              = this._latestBill.billSummary.cgst_total  | 0;
              this.SGSTAmount              = this._latestBill.billSummary.sgst_total  | 0;
              this.totalTax                = this._latestBill.billSummary.tax_total  | 0 ;
              this.billAmount              = this._latestBill.billSummary.bill_amount;
              this.additionalCharge        = this._latestBill.billSummary.additional_charge | 0;
              this.rebateAmount            = this._latestBill.billSummary.rebate_amount  | 0 ;
              this.collectionAmountDisplay = this._latestBill.billSummary.collection_amount;

              console.log(this.collectionAmountDisplay,this.receivedAmountDisplay);
              
              this.serial = JSON.stringify(this.currentDate);
              console.log(this.serial);
              this.date = moment(this.serial).format('MMMM Do YYYY');
              console.log(this.date);

              // this.bill_date = JSON.stringify(this.billDate);
              // console.log(this.bill_date);
              this.month = moment(this.billMonth).format('MMMM Do YYYY');
              console.log(this.month);

            //   this.outstandingAmt = parseFloat(this.collectionAmountDisplay) - parseFloat(this.receivedAmountDisplay);

            //   if (this.outstandingAmt >= 0) {
            //     this.overDue = this.outstandingAmt;
            //   }
            //   else{
            //     this.overDue = this.outstandingAmt * -1;
            //   }
              
             }

            // hide loader
            this.showLoader = false;

            $(document).ready(function() {
              M.updateTextFields();
              $('select').select();
              $('.datepicker').datepicker();
              $('.modal').modal({
                dismissible: false,
              });
          });

      });

      //  ~ End - get customer bill details  -------------------------------------------------------------------------------------------------
 
      });
    // ~ End  -------------------------------------------------------------------------------------------------
 
  }
  //  ~ End -ngOnInit  -------------------------------------------------------------------------------------
 

  // -- onSubmit -------------------------- ~start ---------------
  onSubmit(value: string): void {
    /* @details - Check for fields validity
      
    */
   console.log('Payment mode',this.collectPayment.controls["payment_mode"].value);

    if (this.collectPayment.valid) {
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
        this._userProfileData.userDetails.user_name + " collected payment Rs. " +
        this.formValuesJSON.receivedAmount + " on " + this.currentDate;

      this.postRequestObject.records[0].payment_details.payment_amount   = this.formValuesJSON.receivedAmount;
      this.postRequestObject.records[0].payment_details.payment_remarks  = this.formValuesJSON.collectionRemarks;
      this.postRequestObject.records[0].payment_details.payment_type     = "COLL";
      this.postRequestObject.records[0].payment_details.payment_action   = "COLL";
      this.postRequestObject.records[0].payment_details.payment_mode     = this.collectPayment.controls["payment_mode"].value;
      this.postRequestObject.records[0].payment_details.created_by       = this._userProfileData.userDetails.user_name;
      this.postRequestObject.records[0].payment_details.created_by_id    = this._userProfileData.userDetails.user_id;

      this.postRequestObject.records[0].bill_details.bill_id             = this._latestBill.billSummary.bill_id;

      console.log(
        "%c Pack Object After ***** -------------------------------------------------------------------------- ",
        "background: #8bc34a;font-weight: bold;color: white; "
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

              this.owner_meta = JSON.parse(this._userProfileData.ownerDetails.owner_meta_value);
              console.log("obj values ", this.owner_meta.enable_gst);
              // SMS Integration - Start
             
              this.sms_phone  = this.customerObject[0].phone;  
              this.sms_customer_name        =   this.customerObject[0].full_name;

              this.outstandingAmt = parseFloat(this.collectionAmountDisplay) - parseFloat(this.formValuesJSON.receivedAmount);
              
              if (this.outstandingAmt >= 0) {
                this.sms_text          = "Dear "+this.sms_customer_name+", Thank your for payment of Rs. "+ this.formValuesJSON.receivedAmount +". Your outstanding balance is Rs. " + this.outstandingAmt;  //sms content
                this.overDue = this.outstandingAmt;
              }
              if (this.outstandingAmt < 0) {
                  this.avail_bal = this.outstandingAmt * -1;  
                  this.sms_text          = "Dear "+this.sms_customer_name+", Thank your for payment of Rs. "+ this.formValuesJSON.receivedAmount +". Your available balance is Rs. " + this.avail_bal;  //sms content
                  this.overDue = this.avail_bal;
              }

              console.log(
                "%c Request Parameters for SMS***** -------------------------------------------------------------------------- ",
                "background: #8bc34a;font-weight: bold;color: white; "
              );
              console.log(this.sms_phone,this.sms_customer_name,this.sms_text);
              console.log(this.collectionAmountDisplay,this.formValuesJSON.receivedAmount)
             
             
              if(this.owner_meta.subscribe_sms == "Y"){


                this.messageTemplate.cust_details[0].tran_amount=this.formValuesJSON.receivedAmount;
                this.messageTemplate.cust_details[0].due_amnt=this.outstandingAmt * -1;  
                this.messageTemplate.cust_details[0].company_name=this._userProfileData.ownerDetails.owner_company_name;
                this.messageTemplate.cust_details[0].NAME=this.sms_customer_name;  
                this.messageTemplate.cust_details[0].mobile_number=this.sms_phone;

                console.log('this.messageTemplate',this.messageTemplate);

                this.callservice.makeRequest_ManageSMS(this.messageTemplate).subscribe(
                  response => {
  
                        console.warn(
                          "%c ___________________________ SMS Response ___________________________",
                          "background: #c6ff00;color: black; font-weight: bold;"
                        );
                      console.log('response',response);
                  
                  });


              // this.callservice.makeRequest_sendSMS(this.sms_phone,this.sms_text).subscribe(
              //   response => {

              //         console.warn(
              //           "%c ___________________________ SMS Response ___________________________",
              //           "background: #c6ff00;color: black; font-weight: bold;"
              //         );
              //       console.log(response);
                
              //   });
              }

//  call sweet alert - Start ________________________________________________________________________________________________________
swal({
  title: "Download PDF Receipt",
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
if(result.value){
this.downloadPdf();
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
} else{

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
            }// swal ~ end -----

            }); 
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
      this.validateFields.validateAllFormFields(this.collectPayment);
      this.notification.ShowPreDefinedMessage('w','CMN-001');
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
  //  ~ End  ----------------------------------------------------------------------------------------------------

  // --  @details :  downloadPdf ()#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  
  downloadPdf() { 
    console.log('this.originalCollectionAmt',this.originalCollectionAmt);
    console.log('this.DisplayBalanceRemarks',this.DisplayBalanceRemarks);
    
    var doc = new jsPDF('p','pt');
    doc.rect(5,5,310,366)
    doc.setFontSize(15)
    var text = `${this.customer_params.owner_company_name}`
    doc.text(text,155,25,null,null,'center');
    doc.setFontSize(7)
    //var text1 = `${this._userProfileData.ownerDetails.owner_company_address}`
   // doc.text(text1,155,35,null,null,'center');
    doc.setFontSize(8)
    doc.text(`Phone Number: ${this.customerObject[0].phone}`, 10, 50)
    if(this.owner_meta.enable_gst === "Y")
    {
    doc.text('GSTIN :',310,50,null,null,'right')
    }
    doc.line(5, 58, 315, 58)
    doc.setFontSize(10)
    doc.text('Customer Details:',10, 72)
    doc.line(5, 80, 315, 80)
    doc.setFontSize(8)
    doc.text(`${this.customerObject[0].full_name}`, 10, 90)
    doc.text(`Customer ID : ${this.customerObject[0].customer_id}`,310, 90,null,null,'right')
    doc.text('Address :', 10,102 )
     var text1= `${this.customerObject[0].address1}`
     var line= doc.splitTextToSize(text1,128)
     doc.text(line, 48, 102)
    doc.text(`Bill Id : ${ this.billNumber}` ,310, 102,null,null,'right')
    doc.text(`Bill Month : ${this.month}`,310, 114,null,null,'right')
    if(this.customer_meta.customer_meta.GSTIN != "")
    {
      doc.text(`GSTIN : ${this.customer_meta.customer_meta.GSTIN}`,310,126,null,null,'right')
    }
    doc.text('VC Number :', 10, 120)
    if(this.vcNumber.length > 4)
    {
      this.tempVcNumber = this.vcNumber.slice(0,3)
      this.tempVcNumber = this.tempVcNumber.concat('...')
      var vc = `${this.tempVcNumber}`
      var line3 = doc.splitTextToSize(vc,128)
      doc.text(line3,58,120)
    }
    else{
      var vc = `${this.vcNumber}`
      var line3 = doc.splitTextToSize(vc,128)
      doc.text(line3,58,120)
    }
    doc.text('Plan Name :', 10, 138)
    if(this.packName.length > 4)
    {
      this.tempPackName = this.packName.slice(0,3) 
      this.tempPackName = this.tempPackName.concat('...')
      var text2 = `${this.tempPackName}`
      var line2 = doc.splitTextToSize(text2,128)
      doc.text(line2,56,138)  
    }
    else{
    var text2 =`${this.packName}`
    var line2 = doc.splitTextToSize(text2,128)
    doc.text(line2,56,138)
    }
    // doc.text('GSTIN : gstin9548547585',310, 130,null,null,'right')
    doc.line(5, 156, 315, 156)
    doc.setFontSize(10)
    doc.text('Payment Details:', 10, 170)
    doc.text('Amount (Rs)', 310,170,null,null,'right')
    doc.line(5, 178, 315, 178)
    doc.setFontSize(8)
    doc.text('Monthly Charge',10,188)
    doc.text(':',150,188)
    doc.text(`${this.rent_amount.toFixed(2)}`,310,188,null,null,'right')
    doc.text("SGST(9%)",10,200)
    doc.text(':',150,200)
    doc.text(`${this.SGSTAmount.toFixed(2)}`,310,200,null,null,'right')
    doc.text("CGST(9%)",10,212)
    doc.text(':',150,212)
    doc.text(`${this.CGSTAmount.toFixed(2)}`,310,212,null,null,'right')
    doc.line(5, 222, 315, 222)
    doc.setFontSize(10)
    doc.text("Sub Total With Tax",10,236)
    doc.text(":",150,236)
    doc.text(`${this.billAmount.toFixed(2)}`,310,236,null,null,'right')
    doc.line(5, 244, 315, 244)
    doc.setFontSize(8)
    doc.text("Previous Due",10,254)
    doc.text(":",150,254)
    doc.text(`${this.previousDue.toFixed(2)}`,310,254,null,null,'right')
    // doc.line(260, 238, 310, 238)
    doc.text("Total Amount",10,266)
    doc.text(":",150,266)
    doc.text(`${this.collectionAmountDisplay.toFixed(2)}`,310,266,null,null,'right')
    // doc.line(260, 250, 310, 250)
    doc.text("Paid Amount",10,278)
    doc.text(":",150,278)
    doc.text(`${this.receivedAmountEntered.toFixed(2)}`,310,278,null,null,'right')
    doc.text("Outstanding Balance",10,290)
    doc.text(":",150,290)
    doc.text(`${this.outstandingAmount.toFixed(2)}`,310,290,null,null,'right')
    doc.text("Balance Remarks",10,302)
    doc.text(":",150,302)
    doc.text(`${this.DisplayBalanceRemarks}`,310,302,null,null,'right')
    doc.line(5, 310, 315,310)
    doc.setFontSize(8)
    doc.text('Issued By:', 10, 320)
    doc.text('Mobicollector', 55, 320)
    doc.text(`Remarks: ${this.billType}`, 10, 332)
    doc.text(`Date: ${this.date}`, 10, 344)
    doc.setFontSize(8)
    doc.text('Thank You For Your Business', 110, 356)
    doc.setFontSize(6)
    doc.text('Powered By www.Mobiezy.com', 120, 364)
    doc.save('Reciept-'+this.customerObject[0].full_name+'-'+this._latestBill.billSummary.customer_id+'-'+this.presentDate+'.pdf');
  }

  //  ~ End  ----------------------------------------------------------------------------------------------------

 // --  @details :  cancelButtonLink ()#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  
  cancelButtonLink(){
    this.router.navigate([this.source]);
  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

}

// -------------------  Component & Class Definition - End -----------------------------------------------