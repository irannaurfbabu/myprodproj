/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR CREATE EXPENSE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   28-JUL-2018 |   CREATED_BY  |   IRANNA
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Ability to Create New Expense
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 28-JUL-2018    v1.0     - Created the New Component.
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
import * as _ from 'lodash';


declare var jQuery: any;
declare var $     : any;
declare var M     : any;

//  ~ End _________________________________________________________________________________________________


// -------------------  Component & Class Definition - Start -----------------------------------------------


@Component({
  selector: 'app-me-create-expense',
  templateUrl: './me-create-expense.component.html',
  styleUrls: ['./me-create-expense.component.css']
})
export class MeCreateExpenseComponent implements OnInit {
// -- @details : Class variable declaration ###################################################################
//  ~ Start  __________________________________________________________________________________________________

// Class Form variables
// All variables used in component template ( html file ) must be public
createPack: FormGroup;


// Form Group
createExpense: FormGroup;

//-- Create List of Fields
expense_title: AbstractControl;
expense_category_id: AbstractControl;
expense_category: AbstractControl;
expense_description: AbstractControl;
expense_date: AbstractControl;
expense_price_type: AbstractControl;
expense_amount: AbstractControl;

  // Public Local Variables
  _expensePriceTypeSelect: any = [];

  showDuration     : boolean = false;
  displaybase_price: number  = 0;
  displaycgst      : number  = 0;
  displaygst       : number  = 0;
  displaytotal_tax : number  = 0;
  displaytotal     : number  = 0;

  displayExpenseTitle: any = "None";
  displayCategory    : any = "None";
  displayExpenseDate : any = new Date();

IsformValid : any = "";
ShowPackPrice:boolean=false;
showAlertMessage:boolean=false;
checkValue:any;


// Class Local variables
// All variables used within the class must be private  
private getRequestInput : any = "";
private _userProfileData: any;
private _userLogin      : any;


public currentDate     = new Date();



private formJSONValue: any = {};
private postRequestObject: any = {
  records: [
    {
      expense_title      : null,
      expense_description: null,
      expense_category_id: null,
      expense_category   : null,
      expense_date       : null,
      expense_price_type : null,
      expense_amount     : null,
      base_price         : null,
      cgst_amount        : null,
      sgst_amount        : null,
      total_tax          : null,
      total_amount       : null,
      gst_applied        : null,
      owner_id           : null,
      created_by_id      : null,
      created_by         : null,
      active             : "Y",
      dmlType            : "I",
      recordType         : "N",
    }
  ]
};

//>>>>> @details - Class variable declaration ~ End ___________________________________________


// function to open left side navgivation bar
_opened: boolean = false;
ownerCompanyName: String = "";

_expenseCategorySelect: any =
[{ 
  value: 1,
  label: 'Salary'
},
{
  value: 2,
  label: 'Equipment'
},
{
  value: 3,
  label: 'Service'
},
{
  value: 4,
  label: 'Electricity Bill'
},
{
  value: 5,
  label: 'Internet Bill'
},
{
  value: 6,
  label: 'Rent'
},
{
  value: 7,
  label: 'Others'
}
]


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

   // assign fields and validators to form group
   this.createExpense = fb.group({
    expense_title      : [null, Validators.required],
    expense_category   : [null, Validators.required],
    expense_date       : [this.currentDate],
    expense_price_type : [null, Validators.required],
    expense_amount     : [null, Validators.required],
    expense_description: [null]
  });

  
    // map form fields and controls

    this.expense_title = this.createExpense.controls["expense_title"];
    this.expense_description = this.createExpense.controls["expense_description"];
    this.expense_category = this.createExpense.controls["expense_category"];
    this.expense_price_type = this.createExpense.controls["expense_price_type"];
    this.expense_amount = this.createExpense.controls["expense_amount"];
    this.expense_date =this.createExpense.controls["expense_date"];
    // Expense Title Value Changes __________________________________________
    this.expense_title.valueChanges.subscribe((value: string) => {
      console.log('value',value);
      if (value) {
        console.log('value',value);
        this.displayExpenseTitle = _.capitalize(value);
      } else {
        this.displayExpenseTitle = "None";
      }
    });
 
   

      // Expense Category Value Changes __________________________________________
      this.expense_category.valueChanges.subscribe((value: string) => {
        if (value) {
          console.log('expense_category_value',value);
          // extra the object from array
          let getCategoryObject: any = _.filter(
            this._expenseCategorySelect,
            function(obj) {
              return obj.value == value;
            }
          );
          console.log("---- getCategoryObject ----");
          console.log(getCategoryObject);
  
          this.displayCategory = getCategoryObject[0].label;
        } else {
          this.displayCategory = "None";
        }
      });
   
    // Subscribe Expense Price Type Value Changes __________________________________________
    this.expense_price_type.valueChanges.subscribe((value: string) => {
      console.log("------ Expense Type Changed Value ------");
      console.log(value);

      // Calculate the price pack details
      this.calculatePrice.calculatePackPrice(
        this.createExpense.controls["expense_amount"].value,
        this.createExpense.controls["expense_price_type"].value
      );

      console.log(this.calculatePrice);

      // assign calculated values for display
      this.displaybase_price = this.calculatePrice.base_price;
      this.displaycgst = this.calculatePrice.cgst_amount;
      this.displaygst = this.calculatePrice.sgst_amount;
      this.displaytotal_tax = this.calculatePrice.total_tax;
      this.displaytotal = this.calculatePrice.total_amount;
    });

    // ~ End -- pack end changes ------------------------------------  


// Subscribe Pack Price Value Changes __________________________________________
     this.expense_amount.valueChanges.subscribe((value: string) => {
      console.log("------ Expense Amount Changed Value ------");
      console.log(value);

      // Calculate the price pack details
      this.calculatePrice.calculatePackPrice(
        this.createExpense.controls["expense_amount"].value,
        this.createExpense.controls["expense_price_type"].value
      );

      console.log(this.calculatePrice);

      // assign calculated values for display
      this.displaybase_price = this.calculatePrice.base_price;
      this.displaycgst = this.calculatePrice.cgst_amount;
      this.displaygst = this.calculatePrice.sgst_amount;
      this.displaytotal_tax = this.calculatePrice.total_tax;
      this.displaytotal = this.calculatePrice.total_amount;
    });
    // ~ End -- pack end changes ------------------------------------  

  }
//  ~ End -constructor ____________________________________________________________________________________


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
   console.log(this.createExpense);
   if (this.createExpense.valid) {
     console.log("Submitted Values: ", value);

console.log(
  "%c Form Submitted Values ***** -------------------------------------------------------------------------- ",
  "background: #689f38;font-weight: bold;color: white; "
);
console.log(value);

console.log(
  "%c Expense Object Before ***** -------------------------------------------------------------------------- ",
  "background: #7cb342;font-weight: bold;color: white; "
);
console.log("postobj before assign", this.postRequestObject);

//create JSON
this.formJSONValue = JSON.parse(JSON.stringify(value));
console.log("--------------- JSON Value ---------------");
console.log(this.formJSONValue);

// Assign Values from values to post request object
this.postRequestObject.records[0].expense_title       =   _.capitalize(this.formJSONValue.expense_title) ;
this.postRequestObject.records[0].expense_category_id = this.formJSONValue.expense_category;
this.postRequestObject.records[0].expense_date        = this.formJSONValue.expense_date;
this.postRequestObject.records[0].expense_price_type  = this.formJSONValue.expense_price_type;
this.postRequestObject.records[0].expense_amount      = this.formJSONValue.expense_amount;
this.postRequestObject.records[0].expense_description = this.formJSONValue.expense_description;
this.postRequestObject.records[0].base_price          = this.calculatePrice.base_price;
this.postRequestObject.records[0].cgst_amount         = this.calculatePrice.cgst_amount;
this.postRequestObject.records[0].sgst_amount         = this.calculatePrice.sgst_amount;
this.postRequestObject.records[0].total_tax           = this.calculatePrice.total_tax;
this.postRequestObject.records[0].total_amount        = this.calculatePrice.total_amount;

this.postRequestObject.records[0].owner_id      = this._userProfileData.ownerDetails.owner_id;
this.postRequestObject.records[0].created_by    = this._userProfileData.userDetails.user_name;
this.postRequestObject.records[0].created_by_id = this._userProfileData.userDetails.user_id;
this.postRequestObject.records[0].comments      = this._userProfileData.userDetails.user_name + " created " +
                    this.formJSONValue.expense_title + '. Expense amount Rs. ' + this.calculatePrice.total_amount + ' on ' + this.currentDate; 

if ( this.formJSONValue.expense_price_type === "BPGST" || this.formJSONValue.expense_price_type === "TPGST" ) {
  this.postRequestObject.records[0].gst_applied = "Y";
  console.log( "GST applied ", this.postRequestObject.records[0].gst_applied  );
} else {
  this.postRequestObject.records[0].gst_applied = "N";
}

 // extract the object from array
 let category_id = this.formJSONValue.expense_category;
 let getCategoryObject: any = _.filter(
  this._expenseCategorySelect,
  function(obj) {
    return obj.value == category_id;
  }
);

// assign category value
this.postRequestObject.records[0].expense_category = _.capitalize(getCategoryObject[0].label);


console.log(
  "%c Expense Object After ***** -------------------------------------------------------------------------- ",
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
           .makeRequest_ManageExpense(this.postRequestObject)
           .subscribe(response => {
             // Log Response - Remove Later
             console.warn(
               "%c ___________________________ Manage expense Post Response ___________________________",
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
                         this.router.navigateByUrl('/manageexpense');

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
    
    this.validateFields.validateAllFormFields(this.createExpense);
    this.notification.ShowPreDefinedMessage('w','CMN-001');
  

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

// --  @details :  ExpanseDateChange (Emit Event)#######################################################
//  ~ Start  -------------------------------------------------------------------------------------------------
ExpanseDateChange(value){
console.log(value);
this.displayExpenseDate = value;
}
//  ~ End  ----------------------------------------------------------------------------------------------------

}
