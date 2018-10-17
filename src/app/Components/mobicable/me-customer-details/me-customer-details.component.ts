/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR CUSTOMER DETAILS ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ HTTP Service for customer details retrieval
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

import {    Component, OnInit, NgZone, Input} from "@angular/core";
import { Output , EventEmitter } from "@angular/core";
import {    PersistenceService }               from   "angular-persistence";
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
}      from "@angular/forms";

import {    startWith          }               from   "rxjs/operators/startWith";
import {    RouterModule,      ActivatedRoute, Router } from "@angular/router";
import {    map                }               from   "rxjs/operators/map";
import {    Observable         }               from   "rxjs/Observable";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";

declare var jQuery: any;
declare var $     : any;
declare var M     : any;


//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start -----------------------------------------------

@Component({
  selector: 'app-me-customer-details',
  templateUrl: './me-customer-details.component.html',
  styleUrls: ['./me-customer-details.component.css']
})
export class MeCustomerDetailsComponent implements OnInit {

   // -- @details : Class variable declaration ###################################################################
  //  ~ Start - variable declaration _____________________________________________________________________________

  @Input() setCustomerNumberObj: any;
  

  // Class Form variables
  // All variables used in component template ( html file ) must be public
 
  customerName          : any     = "";
  customerID            : any     = "";
  customerPhone         : any     = "";
  customerAddress       : any     = "";
  customerArea          : any     = "";
  customerStatus        : any     = "";
  isPresentActive       : boolean = false;
  customer_number_param : any     = "";
  showCircularLoader    : boolean = true;

  _SubscriptionList:any = [];
  _CustomerPaymentList:any=[];
  //-- Create Form Group
  createComplaint: FormGroup;
  filter:any;
  productsPerPage = 10;
  selectedPage    = 1;
  currentpage:any;
 customerNumber   : any;


 // Class Local variables
 // All variables used within the class must be private


  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput        : any = "";
  private _userLogin             : any;
  private _customerDetails_obj   : any;
  private getSubscriptionParams  : any;
  private _userProfileData       : any;

  private customer_details_params: any = {
  phone            : null,
  full_name        : null,
  customer_id      : null,
  customer_number  : null
};
 private postRequestCustomerObject: any =
  {
    records: [{
      customer_params: {
        owner_id: null,
        customer_number: null,
       
      }
    }]
  };

  //Url Variabes
 public id:any;
 public source:string;

@Output() customerObjectEvent = new EventEmitter<string>();
 
//  ~ End  - variable declaration _______________________________________________________________________________

// --  @details :  constructor #############################################################################
//  ~ Start -constructor ------------------------------------------------------------------------------------
constructor(
  public  callHttpGet                      : MeCallHttpGetService,
  public  userProfileService               : MeUserProfileService,
  private customerDetailsPersistenceService: PersistenceService,
  public  zone                        : NgZone,
  public  route                       : ActivatedRoute,
 
) {

  // initialize and show loader
  this.showCircularLoader = true;
  

 
  
  this.route.queryParams.subscribe(params => {
      this.id = params["id"];
      this.source = params["Sorce"];
  });

//   this.customer_number_param = +this.id;
//   console.log("---- --- --- Display ID Received ---- --- ---");
//   console.log( this.customer_number_param);

}


//  ~ End -constructor  --------------------------------------------------------------------------------------



  //  ~ Start -ngOnChanges  ---------------------------------------------------------------------------------------
  // --  @details :  ngOnChanges ##################################################################################
  // ngOnChanges get updated customerNumber
  
    ngOnChanges(setCustomerNumberObj:any) {
      // console.log('on change',this.setCustomerNumberObj);
      this.customer_number_param = this.setCustomerNumberObj;
      this.customerNumber= this.setCustomerNumberObj;
      this.ngOnInit();
    }

  //  ~ End -ngOnChanges  ---------------------------------------------------------------------------------------



  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start -ngOnInit  ---------------------------------------------------------------------------------------
  ngOnInit() {

    if(this.setCustomerNumberObj) {

      this.customer_number_param = this.setCustomerNumberObj;
      console.log('this.customer_number_param',this.customer_number_param);
      

    }
    else 
    {
      this.customer_number_param = +this.id;
      // this.postRequestCustomerObject.records[0].customer_number =this.customer_number_param;
      console.log('postRequestCustomerObject payment',this.customer_number_param);      

    }


    console.log(
      "%c ---------------------------- *****  Inside Customer Component ngonInit ***** ---------------------------- ",
      "background: #ff5722;color: white; font-weight: bold; display: block;"
    );

    // initialize and show loader
    this.showCircularLoader = true;


    // initialize and execute jquery document ready
    this.zone.run(() => {
      // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
      // https://angular.io/api/core/NgZone

      $(document).ready(function() {
        $("select").select();
        $("input#input_text, textarea#textarea2").characterCounter();
        $('.modal').modal(
          {
            dismissible: false,
          }
        );
        // intialize input label
        M.updateTextFields();
      });
    });

  
    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.customerDetailsPersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );
    console.warn("----------------- User Login ----------------- ");
    console.dir(this._userLogin);
 // make call to get user profile details
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.userProfileService.makeRequest_UserProfile(this._userLogin).subscribe(response => {
        this._userProfileData = response;

        console.warn(
          "----------------- User Profile Response ----------------- "
        );
        console.log(this._userProfileData);
        console.log(this._userProfileData.ownerDetails);

      });
    // ~ End  -------------------------------------------------------------------------------------------------

   
    // create object for user areqa input json
    this.customer_details_params.customer_number = this.customer_number_param;
    this.customer_details_params.customer_id     = "";
    this.customer_details_params.full_name       = "";
    this.customer_details_params.phone           = "";
    

    // get the Input JSON format for making http request.
    this.getRequestInput = this.callHttpGet.createGetRequestRecord(
      this.customer_details_params
    );
    console.log(
      "%c  Request Input - Customer Details : >>> ",
      "color: green; font-weight: bold;",
      this.getRequestInput
    );
 

     //get customer details -- start -------------------------------------------
     this.callHttpGet
     .makeRequest_GetCustomerDetails(this.getRequestInput)
     .subscribe(response => {
 
        // Log Response - Remove Later
        console.log(
          "%c ---------------------------- *****  Customer Details Response - ngonInit ***** ---------------------------- ",
          "background: #2196f3;color: white; font-weight: bold; display: block;"
        );
         // assign customer details response to local vairable
         this._customerDetails_obj = response.customersDetails;
          
 
         console.log(this._customerDetails_obj); 

         if(this._customerDetails_obj) {

          this.customerID      = this._customerDetails_obj[0].customer_id;
          this.customerName    = this._customerDetails_obj[0].full_name;
          this.customerPhone   = this._customerDetails_obj[0].phone;
          this.customerAddress = this._customerDetails_obj[0].address1;
          this.customerArea    = this._customerDetails_obj[0].area_name;
          
             
          console.log("Status : " + this._customerDetails_obj[0].active);

          this.customerObjectEvent.emit(this._customerDetails_obj);

          if(this._customerDetails_obj[0].active === "Y") {
           this.isPresentActive = true;
          }
          else if(  this._customerDetails_obj[0].active === "N" ){
           this.isPresentActive = false;
          }
  


         }


        // initialize and show loader
        this.showCircularLoader = false;

        this.postRequestCustomerObject.records[0].customer_params.owner_id = this._userProfileData.ownerDetails.owner_id;
        this.postRequestCustomerObject.records[0].customer_params.customer_number =this._customerDetails_obj[0].customer_number;
        console.log(this.postRequestCustomerObject);

       // Subscribing to get SubscriptionList
       this.callHttpGet.makeRequest_GetSubscriptionList(this.postRequestCustomerObject).subscribe(response => {
        console.log(
          "%c Subscription List ***** ----------------------------------------------------------- ",
          "background: #ff5722;font-weight: bold;color: white; "
        );

        this._SubscriptionList = response.subscription;
        console.log(this._SubscriptionList);
      });
// makeRequest_GetSubscriptionList() ~ End  ----------------------------------------------------------------------------------------
// Subscribing to get SubscriptionList
// this.callHttpGet.makeRequest_GetCustomerPayments(this.postRequestCustomerObject).subscribe(response => {
//   console.log(
//     "%c Subscription List ***** ----------------------------------------------------------- ",
//     "background: #ff5722;font-weight: bold;color: white; "
//   );

//   this._CustomerPaymentList = response.customerPaymentsList;
//   console.log(this._CustomerPaymentList);
// });
// makeRequest_GetSubscriptionList() ~ End  ----------------------------------------------------------------------------------------


// initialize and execute jquery document ready
this.zone.run(() => {
  // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
  // https://angular.io/api/core/NgZone

  $(document).ready(function() {
    $("select").select();
    $("input#input_text, textarea#textarea2").characterCounter();
    $('.modal').modal(
      {
        dismissible: false,
      }
    );
    // intialize input label
    M.updateTextFields();
  });
});


     });   
 
    //get customer details -- end -------------------------------------------


  }

  //  ~ End -ngOnInit  -------------------------------------------------------------------------------------


}

// -------------------  Component & Class Definition - Start -----------------------------------------------