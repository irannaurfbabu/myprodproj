/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR EDIT EXPENSE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   28-JUL-2018 |   CREATED_BY  |   IRANNA
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Ability to Create edit Expense
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
  selector: 'app-me-edit-expense',
  templateUrl: './me-edit-expense.component.html',
  styleUrls: ['./me-edit-expense.component.css']
})
export class MeEditExpenseComponent implements OnInit {
// -- @details : Class variable declaration ###################################################################
//  ~ Start  __________________________________________________________________________________________________

// Class Form variables
// All variables used in component template ( html file ) must be public
 

// Form Group
editExpense: FormGroup;

//-- Create List of Fields
expense_title      : AbstractControl;
expense_category   : AbstractControl;
expense_description: AbstractControl;
expense_date       : AbstractControl;
expense_price_type : AbstractControl;
expense_amount     : AbstractControl;
expense_id         : AbstractControl;

// Public Local Variables
_expensePriceTypeSelect: any = [];

showDuration     : boolean = false;
displaybase_price: number  = 0;
displaycgst      : number  = 0;
displaygst       : number  = 0;
displaytotal_tax : number  = 0;
displaytotal     : number  = 0;

displayCurrentExpenseTitle: any = "None";
displayCurrentCategory    : any = "None";
displayCurrentExpenseDate : any = new Date();
displayCurrenttotal       : any = 0;

displayCreatedBy : any = "None";
displayCreatedOn : any = new Date();
displayModifiedBy : any = "None";
displayModifiedOn : any = new Date();

IsformValid  : any = "";
ShowPackPrice: boolean = false;
ShowPackName : boolean = false;
checkValue   : any;
showLoader        : boolean;

// Private Local Variables
private userDetails : any = "";
private ownerDetails : any = "";
private formJSONValue     :    any    =     {};
private _expenseList      :    any    =     [];
private expense_id_param  :    number =     0;
private currentDate         = new Date().toString();
private postRequestObject: any = {
  records: [
    {
      expense_id: null,
      expense_title: null,
      expense_description: null,
      expense_category_id: null,
      expense_category: null,
      expense_date: null,
      expense_price_type: null,
      expense_amount: null,
      base_price: null,
      cgst_amount: null,
      sgst_amount: null,
      total_tax: null,
      total_amount: null,
      gst_applied: null,
      owner_id: null,
      modified_by_id: null,
      modified_by: null,
      active: "Y",
      dmlType: "U",
      recordType: "E"
    }
  ]
};

// private variables
private getResponseAPI_Input : any = {
    records : [{
      owner_id : null,
      expense_id  : null
    }]
}

private _userProfileData: any;
private _userLogin      : any;


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
  public  route                       : ActivatedRoute,
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
 this.showLoader = true;

 this.expense_id_param = +this.route.snapshot.params["id"];
 console.log("---- --- --- Display ID Received ---- --- ---");
 console.log(this.expense_id_param);

    this.calculatePrice.base_price=0;
    this.calculatePrice.cgst_amount = 0.00;
    this.calculatePrice.sgst_amount = 0.00;
    this.calculatePrice.total_tax = 0.00;
    this.calculatePrice.total_amount = 0.00;

   // assign fields and validators to form group
   this.editExpense = fb.group({
    expense_title      : [null, Validators.required],
    expense_category   : [null, Validators.required],
    expense_date       : [null, Validators.required],
    expense_price_type : [null, Validators.required],
    expense_amount     : [null, Validators.required],
    expense_description: [null],
    expense_id: [null]
  });

  // map form fields and controls
  this.expense_id          = this.editExpense.controls["expense_id"];
  this.expense_title       = this.editExpense.controls["expense_title"];
  this.expense_description = this.editExpense.controls["expense_description"];
  this.expense_category    = this.editExpense.controls["expense_category"];
  this.expense_price_type  = this.editExpense.controls["expense_price_type"];
  this.expense_amount      = this.editExpense.controls["expense_amount"];

    
 
  // Expense Category Value Changes __________________________________________
  this.expense_category.valueChanges.subscribe((value: string) => {
    if (value) {
      // extra the object from array
      let getCategoryObject: any = _.filter(
        this._expenseCategorySelect,
        function(obj) {
          return obj.value == value;
        }
      );
      console.log("---- getCategoryObject ----");
      console.log(getCategoryObject);

      // this.displayCategory = getCategoryObject[0].label;

    } else {
      console.log('None');
      // this.displayCategory = "None";
    }
  });

   

  // Subscribe Expense Price Type Value Changes __________________________________________
  this.expense_price_type.valueChanges.subscribe((value: string) => {
    console.log("------ Expense Type Changed Value ------");
    console.log(value);

    // Calculate the price pack details
    this.calculatePrice.calculatePackPrice(
      this.editExpense.controls["expense_amount"].value,
      this.editExpense.controls["expense_price_type"].value
    );

    console.log(this.calculatePrice);

    // assign calculated values for display
    this.displaybase_price = this.calculatePrice.base_price;
    this.displaycgst = this.calculatePrice.cgst_amount;
    this.displaygst = this.calculatePrice.sgst_amount;
    this.displaytotal_tax = this.calculatePrice.total_tax;
    this.displaytotal = this.calculatePrice.total_amount;
  });

   // Subscribe Pack Price Value Changes __________________________________________
   this.expense_amount.valueChanges.subscribe((value: string) => {
    console.log("------ Expense Amount Changed Value ------");
    console.log(value);

    // Calculate the price pack details
    this.calculatePrice.calculatePackPrice(
      this.editExpense.controls["expense_amount"].value,
      this.editExpense.controls["expense_price_type"].value
    );

    console.log(this.calculatePrice);

    // assign calculated values for display
    this.displaybase_price = this.calculatePrice.base_price;
    this.displaycgst       = this.calculatePrice.cgst_amount;
    this.displaygst        = this.calculatePrice.sgst_amount;
    this.displaytotal_tax  = this.calculatePrice.total_tax;
    this.displaytotal      = this.calculatePrice.total_amount;
  });

  }
//  ~ End -constructor ____________________________________________________________________________________

// --  @details :  ngOnInit ###############################################################################
//  ~ Start -ngOnInit _____________________________________________________________________________________
ngOnInit() {
 // Initialize Loader
 this.showLoader = true;
      // initialize and execute jquery document ready    
      this.zone.run(() => {
       
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
      // this.ownerCompanyName = response.ownerDetails.owner_company_name;
      this.getResponseAPI_Input.records[0].expense_id = this.expense_id_param;
      this.getResponseAPI_Input.records[0].owner_id  =this._userProfileData.ownerDetails.owner_id;
      console.log(
        "%c  this.expense_id_param: >>> ",
        "color: green; font-weight: bold;",
        this.expense_id_param
      );
     
      // make call to get list of Packs for the owner
      //  ~ Start  -------------------------------------------------------------------------------------------------

      this.callHttpGet
        .makeRequest_getExpense(this.getResponseAPI_Input)
        .subscribe(result => {

            // UnZipping and uncompress for retrieving Pack List
            this.gzipService.makeRequest_uncompress(result).then(function(response) {

              console.log(
                "%c ---------------------------- *****  API RESPONSE ***** ---------------------------- ",
                "background: #ADF11A;color: black; font-weight: bold;"
           );
              console.log(response);
        
              // assign to local variable
              this._expenseList = response.expenseList;
              
              if(this._expenseList.length > 0){
 
                // assign values to form variables
                this.editExpense.controls["expense_id"].setValue(this._expenseList[0].expense_id);
                this.editExpense.controls["expense_title"].setValue(this._expenseList[0].title);
                this.editExpense.controls["expense_category"].setValue(this._expenseList[0].category_id);
                this.editExpense.controls["expense_description"].setValue(this._expenseList[0].description);
                this.editExpense.controls["expense_date"].setValue(this._expenseList[0].expense_date);
                this.editExpense.controls["expense_amount"].setValue(this._expenseList[0].amount);
                this.editExpense.controls["expense_price_type"].setValue(this._expenseList[0].price_type);
        
                // assign values to current variables
                this.displayCurrentExpenseTitle = this._expenseList[0].title;
                this.displayCurrentCategory     = this._expenseList[0].category;
                this.displayCurrentExpenseDate  = new Date(this._expenseList[0].expense_date);
                this.displayCurrenttotal        = this._expenseList[0].total_amount;
        
                // assign values to current variables
                this.displayCreatedBy  = _.capitalize(this._expenseList[0].created_by);
                this.displayCreatedOn  = this._expenseList[0].created_on;
                this.displayModifiedBy = _.capitalize(this._expenseList[0].modified_by);
                this.displayModifiedOn = this._expenseList[0].modified_on;
        
                //hide progress bar
                // this.showProgressBar = false;
        
                this.showLoader = false;
              } 
              else {
        
                
                console.log(
                  "%c ---------------------------- *****  NO RESPONSE ***** ---------------------------- ",
                  "background: #e57373 ;color: white; font-weight: bold;"
                 );
                 this.showLoader = false;
              }

                // Jquery Call
           $(document).ready(function() {
            M.updateTextFields();
            $('select').select();
            $('.datepicker').datepicker();
            $('.modal').modal({
              dismissible: false,
            });
            
          });
        
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
   console.log(this.editExpense);
   if (this.editExpense.valid) {
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
    console.log("postobj before assign", this.postRequestObject);

    //create JSON
    this.formJSONValue = JSON.parse(JSON.stringify(value));
    console.log("--------------- JSON Value ---------------");
    console.log(this.formJSONValue);

    // Assign Values from values to post request object
    this.postRequestObject.records[0].expense_id          = this.formJSONValue.expense_id;
    this.postRequestObject.records[0].expense_title       =  _.capitalize(this.formJSONValue.expense_title);
    this.postRequestObject.records[0].expense_category_id = this.formJSONValue.expense_category;
    this.postRequestObject.records[0].expense_date        = this.formJSONValue.expense_date;
    this.postRequestObject.records[0].expense_price_type  = this.formJSONValue.expense_price_type;
    this.postRequestObject.records[0].expense_amount      = this.formJSONValue.expense_amount;
    this.postRequestObject.records[0].expense_description = _.capitalize(this.formJSONValue.expense_description);
    this.postRequestObject.records[0].base_price          = this.calculatePrice.base_price;
    this.postRequestObject.records[0].cgst_amount         = this.calculatePrice.cgst_amount;
    this.postRequestObject.records[0].sgst_amount         = this.calculatePrice.sgst_amount;
    this.postRequestObject.records[0].total_tax           = this.calculatePrice.total_tax;
    this.postRequestObject.records[0].total_amount        = this.calculatePrice.total_amount;

    this.postRequestObject.records[0].owner_id       = this._userProfileData.ownerDetails.owner_id;
    this.postRequestObject.records[0].modified_by    = this._userProfileData.userDetails.user_name;
    this.postRequestObject.records[0].modified_by_id = this._userProfileData.userDetails.user_id;
    this.postRequestObject.records[0].comments       = this.userDetails.user_name + " modified the expense on " + this.currentDate ;

    if (
      this.formJSONValue.expense_price_type === "BPGST" ||
      this.formJSONValue.expense_price_type === "TPGST"
    ) {
      this.postRequestObject.records[0].gst_applied = "Y";
      console.log(
        "GST applied ",
        this.postRequestObject.records[0].gst_applied
      );
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
           .makeRequest_ManageExpense(this.postRequestObject)
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
    
    this.validateFields.validateAllFormFields(this.editExpense);
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


}
