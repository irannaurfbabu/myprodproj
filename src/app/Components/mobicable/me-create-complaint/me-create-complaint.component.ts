/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR CREATE AREA ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   30-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Render the Complaint data in tabular format with ability to :-
|      ** Ability to Create New Complaint
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 30-JAN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities

import { Component, OnInit,NgZone  } from "@angular/core";
import {ErrorStateMatcher} from '@angular/material/core';
import { PersistenceService } from "angular-persistence";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { NgProgressRouterModule } from "@ngx-progressbar/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl, FormGroupDirective, FormsModule, ReactiveFormsModule , NgForm 
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
import { NotificationsService } from 'angular2-notifications'; 
import { SimpleNotificationsModule } from 'angular2-notifications';
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';
import swal from "sweetalert2";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService        } from "../../../Service/me-call-http-get.service";
import { MeCallHttpPostService       } from "../../../Service/me-call-http-post.service";
import { MeUserProfileService        } from "../../../Service/me-user-profile.service";
import { MeValidateFormFieldsService } from "../../../Service/me-validate-form-fields.service";
import { StorageType                 } from "../../../Service/Interfaces/storage-type.enum";

import { MeComplaintInterface } from "../../../Service/Interfaces/me-complaint-interface";

declare var jQuery: any;
declare var $     : any;
declare var M     : any; 

//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start -----------------------------------------------
@Component({
  selector: 'app-me-create-complaint',
  templateUrl: './me-create-complaint.component.html',
  styleUrls: ['./me-create-complaint.component.css']
})
export class MeCreateComplaintComponent implements OnInit {
  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  --------------------------------------------------------------------------------------------------

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  createComplaint: FormGroup;
  
  //-- Create List of Fields
  customer_id          : AbstractControl;
  full_name            : AbstractControl;
  phone                : AbstractControl;
  complaint_type       : AbstractControl;
  complaint_description: AbstractControl;
  complaint_title_id       : AbstractControl;
  dmlType              : AbstractControl;
  recordType           : AbstractControl;
  complaint_status     : AbstractControl;

  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput        : any   = "";
  private customer_details     : any;
  private tempCustomernumber   : any;
  private postRequestObject    : any   = [];
  private complaint_details    : any;
  private getSubscriptionParams: any;
  
  ComplaintTitles    : any = [];
  ComplaintSummary   : any = [];
  CustomerDetailsList: any = [];
  displayCustomer    : any = [];
  customerDetailsObj  : any = [];
  customerNumberObj  : any;

  private _userProfileData       : any;
  private _userLogin             : any;
  private _ComplaintCustomresList: any = [];
  private _ComplaintTitlesList   : any = [];

  
  currentDate              = new Date().toString();
  showAlertMessage         : boolean = false;
  showAlertMessageNoRecords: boolean = false;
  flag                     : boolean = false;
  toggleContent            : boolean = false;
  selectedListRecord       : any     = "";
  togglePulseButton        : boolean = false;
  showLoader   : boolean = true;
  showNoRecords: boolean = false;
  showSearchLoader: boolean = false;


  public options = {
    timeOut: 10000,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 50,
    position: ['bottom', 'center'],
    maxStack: 1
    };
  
  // function to open left side navgivation bar
  _opened: boolean = false;


  // Tera DataTable Local Fields
  filteredData: any[] = [];
  filteredTotal: number = 0;

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 50;
  sortBy: string = 'stb_number';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  // Tera DataTable Set Column name/Label and other features.
  columns: ITdDataTableColumn[] = [
    { name: 'stb_number', label: 'STB Number',  filter: true, sortable: true },
    { name: 'stb_vc_number', label: 'VC Number', filter: true, sortable: true },
    { name: 'service_status', label: 'Service Status', filter: true, sortable: true },
    { name: 'stb_activation_date', label: 'STB Activation Date', filter: true, sortable: true },
    { name: 'base_price', label: 'Base Price', filter: true, sortable: true },
    { name: 'total_tax', label: 'Total Tax', filter: true, sortable: true },
    { name: 'total_amount', label: 'Total Amount', filter: true, sortable: true }
    ];  
 
  
  //  ~ End  ---------------------------------------------------------------------------------------------------- 

  // --  @details :  constructor #################################################################################
  //  ~ Start -constructor ---------------------------------------------------------------------------------------------------
  constructor(
    fb                                       : FormBuilder,
    public callHttpGet                       : MeCallHttpGetService,
    public callHttpPost                      : MeCallHttpPostService,
    public userProfileService                : MeUserProfileService,
    private createComplaintPersistenceService: PersistenceService,
    private validateFields                   : MeValidateFormFieldsService,
    public snackBar                          : MatSnackBar,
    private zone                             : NgZone,
    private router                           : Router,
    public _service                          : NotificationsService,
    private _dataTableService                : TdDataTableService
  ) {

    /*
       @details -  Intialize the form group with fields
          ++ The fields are set to default values - in below case to - null.
          ++ The fields are assigned validators
              ** Required Validator
      */

      this.createComplaint = fb.group({
        customer_id          : [''],
        full_name            : [''],
        phone                : [''],
        complaint_type       : [''],
        complaint_description: [''],
        complaint_title_id       : [''],
        dmlType              : ['I'],
        recordType           : ['N'],
        complaint_status     : ['REGISTERED']
       
      });

    // Assign form controls to private variables
    // Controls are used in me-create-complaint.component.html for accessing values and checking functionalities
    this.customer_id           = this.createComplaint.controls["customer_id"];
    this.full_name             = this.createComplaint.controls["full_name"];
    this.phone                 = this.createComplaint.controls["phone"];
    this.complaint_type        = this.createComplaint.controls["complaint_type"];
    this.complaint_description = this.createComplaint.controls["complaint_description"];
    this.complaint_title_id        = this.createComplaint.controls["complaint_title_id"];
    this.dmlType               = this.createComplaint.controls['dmlType'];
    this.recordType            = this.createComplaint.controls['recordType'];
    this.complaint_status      = this.createComplaint.controls['complaint_status'];
  
      
    // ------------------- ComplaintType Subscribe -- Start ----------------------------
      this.complaint_type.valueChanges.subscribe(
        (value: string) => {
          console.log('%c ------------------  Event Change Complaint Type ------------------','background: blue; color: white; display: block;');
          
          console.log('Complaint Type :', this.createComplaint.controls['complaint_type'].value);

          this.ComplaintTitles=[];
          this.createComplaint.controls["complaint_description"].setValue(null);

          for (let sub in this._ComplaintTitlesList) {
            if (this._ComplaintTitlesList[sub].complaint_type == this.createComplaint.controls['complaint_type'].value) {
              
              this.ComplaintTitles.push(this._ComplaintTitlesList[sub]);
              
            }
          }
          console.log( this.ComplaintTitles);
          // this._ComplaintTitlesList=[];
        }
      );
    // ------------------- ComplaintType Subscribe -- End ----------------------------

  }  
  //  ~ End -constructor  ---------------------------------------------------------------------------------------------------
  

  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start -ngOnInit  ---------------------------------------------------------------------------------------

  ngOnInit() {

    //initialize loader
    this.showLoader    = true;
    this.showNoRecords = false;

    console.log(
      "%c ---------------------------- *****  Inside Create COmplaint component ngonInit ***** ---------------------------- ",
      "background: #dd2c00;color: white; font-weight: bold;"
    );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.createComplaintPersistenceService.get(
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


    // make call to get Complaint Titles 
    //  ~ Start  -------------------------------------------------------------------------------------------------
  
    this.callHttpGet.makeRequest_getComplaintTitles().subscribe(response => {
      console.log(
        "%c Complaint Titles List ***** -------------------------------------------------------------------------- ",
        "background: #ff5722;font-weight: bold;color: white; "
      );

      this._ComplaintTitlesList = response.complaintTitles;
      console.log(this._ComplaintTitlesList);

  });
  // ~ End ----------------------------------------------------------------------------------------------------------


    // initialize and execute jquery document ready    
    this.zone.run(() => {
      // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
      // https://angular.io/api/core/NgZone

      $(document).ready(function(){
      
        // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
        $('.modal').modal();
        
          $('.modal').modal({
            dismissible: false,
          });
      
        $('select').select(); 
        $('input#input_text, textarea#textarea2').characterCounter();

         // intialize input label
         M.updateTextFields();
      });
    });

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

    if (this.createComplaint.valid) {

      this.createComplaint.value.created_by      = this._userProfileData.userDetails.user_name;
      this.createComplaint.value.created_by_id   = this._userProfileData.userDetails.user_id;
      this.createComplaint.value.logged_by       = this._userProfileData.userDetails.user_id;
      this.createComplaint.value.owner_id        = this._userProfileData.ownerDetails.owner_id;
      this.createComplaint.value.customer_number = this.customerDetailsObj[0].customer_number;
      this.createComplaint.value.customer_id     = this.customerDetailsObj[0].customer_id;
      this.createComplaint.value.complaint_title = this.ComplaintSummary.complaintTitle;
      this.createComplaint.value.active          = this.customerDetailsObj[0].active;
      this.createComplaint.value.comments        = this._userProfileData.userDetails.user_name + " created complaint " + " on " + this.currentDate;
         
      this.createComplaint.value.dmlType               = 'I';
      this.createComplaint.value.recordType               = 'N';
      this.createComplaint.value.complaint_status               = 'REGISTERED';
 
      this.complaint_details = {"complaint_summary": this.createComplaint.value};
      
      // get the Input JSON format for making http request.
      this.getRequestInput = this.callHttpGet.createGetRequestRecord(
        this.complaint_details
      );
      console.log(   
        "%c  Request Input : >>> ",
        "color: green; font-weight: bold;",
        this.getRequestInput
      );

      this.postRequestObject = this.getRequestInput;

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
      .makeRequest_manageComplaints(this.postRequestObject)
      .subscribe(response => {
        // Log Response - Remove Later
        console.warn(
        "%c ___________________________ Manage Complaint Post Response ___________________________",
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
          this.router.navigateByUrl('/managecomplaint');
          
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
  
    }); // ~End -- subscribe------------------------------
  
    //  ~ End  --  post reqest call-------------------------------------------------------------------------
  
  } //  Check result of  confirmation button  - End ----------------------------------------------------------------------
  
  }); //  call sweet alert - End 

    } else {

      this.togglePulseButton = true;
      this.validateFields.validateAllFormFields(this.createComplaint);
      this._service.warn('<strong>Warning<strong>',
      ' Please fill the required form fields.');
    }
  }


  //  ~ End -onSubmit  ---------------------------------------------------------------------------------------


  // --  @details :  Local Functions/Methods ##############################################################
  //  ~ Start - Local Functions/Methods---------------------------------------------------------------------

 
 
 
  // @details : Complaint List Select Fuction ______________________________________________________________
  // Click Event Function to highlight selected list item - Start ------------------------------------------

  listClick(event, newValue) {
    console.log("------------*** New Value ***------------");
    console.log(newValue);
    this.selectedListRecord = newValue;
  }
  // Click Event Function to highlight selected list item - End ------------------------------------------


  // ------------------- searchcustomer() -- Start ----------------------------
  // @details: Function to fetch Customer Details.
  // --------------------------------------------------------------------------
    searchcustomer(){
    
      if( this.createComplaint.value.customer_id != '' || this.createComplaint.value.full_name != '' || this.createComplaint.value.phone != '' ) {
      
        this.showSearchLoader = true; 
        this.showAlertMessage = false; 
        // hide all buttons
        this.toggleContent = false;

        $(document).ready(function() {
          $('#searchCustomer').modal('close');
        });
        
        // Constructing Request JSON Format
        this.customer_details = {"customer_details":{"customer_id":this.createComplaint.value.customer_id,"full_name":this.createComplaint.value.full_name,"phone":this.createComplaint.value.phone,"owner_id": this._userProfileData.ownerDetails.owner_id}};
        console.log(JSON.stringify(this.customer_details));
    
        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this.customer_details
        );
        console.log(   
          "%c  Request Input : >>> ",
          "color: green; font-weight: bold;",
          this.getRequestInput
        );


        // make call to get customer details
        //  ~ Start  -------------------------------------------------------------------------------------------------
    
        // subscribing to get CustomerDetails with request json
        this.callHttpGet.makeRequest_getComplaintCustomersList(this.getRequestInput).subscribe(response => {
          console.log(
            "%c Customer List ***** -------------------------------------------------------------------------- ",
            "background: #ff5722;font-weight: bold;color: white; "
          );

          this._ComplaintCustomresList = response.complaintCustomersList;
          this.CustomerDetailsList = this._ComplaintCustomresList;
          console.log(this.CustomerDetailsList);
          // console.log(this._ComplaintCustomresList.slice());

  
          // checking length of CustomersList
          if(this.CustomerDetailsList.length == 0) {
            
            $(document).ready(function() {
              $('#searchCustomer').modal('close');
            });
              
            // show Alert Message
            this.showAlertMessageNoRecords = true;
            this.showSearchLoader = false;
            
          }
          else if(this.CustomerDetailsList.length == 1) {

            $(document).ready(function() {
              $('.modal').modal();
            });

            // clear data from customer summary
            this.displayCustomer=[];
            
            // hide Alert Message
            this.showAlertMessage = false; 
            this.showSearchLoader = false;

            // hide Alert Message
            this.showAlertMessageNoRecords = false;

            // show all buttons
            this.toggleContent = true;

            $('#searchCustomer').modal('close');
            this.displayCustomer.push(this.CustomerDetailsList[0]);
            this.customerNumberObj = this.displayCustomer[0].customer_number;
            // this.tempCustomernumber = this.displayCustomer[0].customer_number;
            // console.log(this.tempCustomernumber);
            
          }
          else if(this.CustomerDetailsList.length > 1) {
          
            $('#searchCustomer').modal('open');

            // hide Alert Message
            this.showAlertMessageNoRecords = false;
            this.showSearchLoader = false;
            
          }

        });

        

      }
      else if( this.createComplaint.value.customer_id === '' || this.createComplaint.value.full_name === '' || this.createComplaint.value.phone === '' ) {
        
        $(document).ready(function() {
        
          $('#searchCustomer').modal('close');
        });
        
        this.showAlertMessage = true; 

        // hide Alert Message
        this.showAlertMessageNoRecords = false;
        
      }

      // if already customer data present in customer summary remain show all buttons else hide buttons.
      if(this.displayCustomer != '' ) {
        // show all buttons
        this.toggleContent = true;
      } else {
        // hide all buttons
        this.toggleContent = false;
      }

  }
  // ------------------- searchcustomer() -- End ----------------------------
    
  //  --------------------selectedCustomer()--Start----------------------------
  // @deatils: onChange of radio button get the Custoner_number.

    selectedCustomer(customerNumber) {
      
      // assigning to temp variable
      this.tempCustomernumber = customerNumber;
    } 
  // ---------------------selectedCustomer()--End------------------------------


  //  -------------getcustomer() ~ Start  -------------------------------------
  // @details: Function to Customer Details by customer_number.
  //  ++  Call GetSubscriptionList Based on selected customer_number.
  // --------------------------------------------------------------------------

    getcustomer() {
      // hide Alert Message
      this.showAlertMessage = false; 

      
      // clear data from customer summary
      this.displayCustomer=[];

      for (let sub in this.CustomerDetailsList) {
        if(this.tempCustomernumber == this.CustomerDetailsList[sub].customer_number){

          // this.displayCustomer.push(this.CustomerDetailsList[sub]);
          this.customerNumberObj = this.CustomerDetailsList[sub].customer_number;

        }
      }

      // if already customer data present in customer summary remain show all buttons else hide buttons.
      if(this.customerNumberObj) {
        // show all buttons
        this.toggleContent = true;
      } else {
        // hide all buttons
        this.toggleContent = false;
      }

    }
    //  -------------getcustomer() ~ End  ------------------------------------------------------------

  //  -------------ClearComplaintValues() ~ Start  -------------------------------------
  // @details:Function to Function to clear the field values.

    ClearComplaintValues()
    {
      console.log('Enterd');
      this.createComplaint.reset();
    }
    //  -------------ClearComplaintValues() ~ End  -------------------------------------


  //  -------------addComplaintSummary() ~ Start  -------------------------------------
  // @details:Function to assign values form fields.

  addComplaintSummary() {
    
    if(this.createComplaint.valid) {
    
      this.flag                                   = true;
      this.ComplaintSummary.complaint_type        = this.createComplaint.controls['complaint_type'].value;
      this.ComplaintSummary.complaint_description = this.createComplaint.controls['complaint_description'].value;
      this.ComplaintSummary.complaintTitleId      = this.createComplaint.controls['complaint_title_id'].value;
      this.ComplaintSummary.created_by            = this._userProfileData.userDetails.user_name;
      this.ComplaintSummary.complaint_status      = 'REGISTERED';
      

      for (let sub in this._ComplaintTitlesList) {
        if(this._ComplaintTitlesList[sub].complaint_title_id == this.createComplaint.controls['complaint_title_id'].value) {

          this.ComplaintSummary.complaintTitle = this._ComplaintTitlesList[sub].complaint_title;

        }
      }
      console.log(
        "%c Complaint Summary  ***** -------------------------------------------------------------------------- ",
        "background: #ff5722;font-weight: bold;color: white; "
      );
      console.log(this.ComplaintSummary);

      $(document).ready(function() {
        $('#addComplaintModal').modal('close');
        $('.modal').modal({
          dismissible: false,
        });
      });
      
    }
    else {
      this.validateFields.validateAllFormFields(this.createComplaint);
      this._service.warn('<strong>Warning<strong>',
      ' Please fill the required form fields.');
    }
    
  }

//  -------------addComplaintSummary() ~ End  ------------------------------------


  // --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  receiveToggleSidebarObj($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this._opened = $event;

    // console.log("**** @@ Sidebar Open Object @@ ****");
    console.log(this._opened);

  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

  // --  @details :  receiveCustomerDetailsObject (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  receiveCustomerDetailsObject($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this.customerDetailsObj = $event;

    console.log("**** @@ Customer Object @@ ****");
    console.log(this.customerDetailsObj);
    

  }
  // receiveCustomerDetailsObject ~ End  ----------------------------------------------------------------------------------------------------


  //  ~ End - Local Functions/Methods---------------------------------------------------------------------


}
// -------------------  Component & Class Definition - End -----------------------------------------------
