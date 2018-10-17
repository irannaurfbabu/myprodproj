/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR CREATE AREA ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   04-FEB-2018 |   CREATED_BY  |   IRANNA
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Render the Complaint data in tabular format with ability to :-
|      ** Ability to Edit Complaint
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 04-FEB-2018    v1.0     - Created the New Component.
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

import { startWith } from "rxjs/operators/startWith";
import { map } from "rxjs/operators/map";
import { Observable } from "rxjs/Observable";

import swal from "sweetalert2";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";
import { MeCallHttpPostService } from "../../../Service/me-call-http-post.service";
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { MeValidateFormFieldsService } from "../../../Service/me-validate-form-fields.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { MeComplaintInterface } from "../../../Service/Interfaces/me-complaint-interface";
import { MeGzipService } from '../../../Service/me-gzip.service';
 
declare var jQuery: any;
declare var $     : any;
declare var M     : any;

//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start -----------------------------------------------
@Component({
  selector: 'app-me-edit-complaint',
  templateUrl: './me-edit-complaint.component.html',
  styleUrls: ['./me-edit-complaint.component.css']
})
export class MeEditComplaintComponent implements OnInit {

   // -- @details : Class variable declaration ###################################################################
  //  ~ Start  --------------------------------------------------------------------------------------------------

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  editComplaintSummary: FormGroup;
  AddComplaintStatus  : FormGroup;

  //-- Create List of Fields
  private complaint_type       : AbstractControl;
  private complaint_description: AbstractControl;
  private complaint_title_id       : AbstractControl;
  private dmlType              : AbstractControl;
  private recordType           : AbstractControl;
  private complaint_status     : AbstractControl;
  private complaint_comments   : AbstractControl;
  private assigned_to_name     : AbstractControl;

  
  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput      : any                    = "";
  private complaint_id_param   : number;
  private complaint_params     : any;
  private _complaintsList      : MeComplaintInterface[] = [];
  private complaint_summary    : any;
  private userParams           : any;
  private selectedItem         : any;
  private inputChanged         : any;
  private user_name            : String                 = '';
  private complaint_details    : any;
  private resultObj            : any;
  private postRequestObject    : any;
  private tempComplaintStatus  : any;
  private getSubscriptionParams: any;

  complaint_obj       : any = [];
  ComplaintTitles     : any = [];
  ComplaintSummary    : any = [];
  UsersDetailsList    : any = [];
  ComplaintDetailsList: any = [];
  selectedListRecord       : any     = "";
  tempComplaintTitles : any[] = [];
  
  private _userProfileData    : any;
  private _userLogin          : any;
  _SubscriptionList           : any = [];
  private _UsersDetails       : any = [];
  private _ComplaintTitlesList: any = [];
  private _ComplaintDetails   : any = [];


  flag      : boolean = false;
  showLoader: boolean;
  showNoRecords: boolean = false;
  currentDate = new Date().toString();
  customerNumberObj  : any;
  customerDetailsObj  : any = [];

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
    { name: 'stb_number', label         : 'STB Number',  filter        : true, sortable: true },
    { name: 'stb_vc_number', label      : 'VC Number', filter          : true, sortable: true },
    { name: 'service_status', label     : 'Service Status', filter     : true, sortable: true },
    { name: 'stb_activation_date', label: 'STB Activation Date', filter: true, sortable: true },
    { name: 'base_price', label         : 'Base Price', filter         : true, sortable: true },
    { name: 'total_tax', label          : 'Total Tax', filter          : true, sortable: true },
    { name: 'total_amount', label       : 'Total Amount', filter       : true, sortable: true }
    ];  
 

  //  ~ End  ---------------------------------------------------------------------------------------------------- 
  
  // --  @details :  constructor #################################################################################
  //  ~ Start -constructor ---------------------------------------------------------------------------------------
  constructor(
      fb                                       : FormBuilder,
      public callHttpGet                       : MeCallHttpGetService,
      public callHttpPost                      : MeCallHttpPostService,
      public userProfileService                : MeUserProfileService,
      private createComplaintPersistenceService: PersistenceService,
      private validateFields                   : MeValidateFormFieldsService,
      public snackBar                          : MatSnackBar,
      private zone                             : NgZone,
      private route                            : ActivatedRoute,
      public _service                          : NotificationsService,
      private router                           : Router,
      private _dataTableService                : TdDataTableService,
      private gzipService                       :MeGzipService,
  ) { 
      // set the show loader flag to true
      this.showLoader = true;

      /*
       @details -  Intialize the form group with fields
          ++ The fields are set to default values - in below case to - null.
          ++ The fields are assigned validators
              ** Required Validator
      */

      this.AddComplaintStatus = fb.group({
        complaint_comments: [''],
        complaint_status  : [''],
        assigned_to_name  : ['']
      });

      this.editComplaintSummary = fb.group({
        complaint_type       : [''],
        complaint_description: [''],
        complaint_title_id   : [''],
        dmlType              : ['U'],
        recordType           : ['E'],
        complaint_status     : ['']
      });

    // Assign form controls to private variables
    // Controls are used in me-edit-complaint.component.html for accessing values and checking functionalities
    this.complaint_type        = this.editComplaintSummary.controls["complaint_type"];
    this.complaint_description = this.editComplaintSummary.controls["complaint_description"];
    this.complaint_title_id    = this.editComplaintSummary.controls["complaint_title_id"];
    this.dmlType               = this.editComplaintSummary.controls['dmlTpe'];
    this.recordType            = this.editComplaintSummary.controls['recordType'];
    this.complaint_status      = this.editComplaintSummary.controls['complaint_status'];

    this.complaint_status   = this.AddComplaintStatus.controls['complaint_status'];
    this.complaint_comments = this.AddComplaintStatus.controls['complaint_comments'];
    this.assigned_to_name   = this.AddComplaintStatus.controls['assigned_to_name'];


  // ------------------- ComplaintType Subscribe -- ~Start ----------------------------
    // @details: Subscribe OnChange values of Complaint Type. 
      // ++ Set ComplaintTitles Based on ComplaintType.
    // ---------------------------------------------------------------------------------
    this.complaint_type.valueChanges.subscribe(
    (value: string) => {
      console.log('%c ------------- Event Change Complaint Type ------------------','background: blue; color: white; display: block;');
      
     console.log('Complaint Type :', this.editComplaintSummary.controls['complaint_type'].value);

     this.ComplaintTitles=[];
     this.editComplaintSummary.controls["complaint_description"].setValue(null);

      for (let sub in this._ComplaintTitlesList) {
        if (this._ComplaintTitlesList[sub].complaint_type == this.editComplaintSummary.controls['complaint_type'].value) {
          
          this.ComplaintTitles.push(this._ComplaintTitlesList[sub]);
          
        }
      }
      // console.log( this.ComplaintTitles);    
    
    }
  );

  // ------------------- ComplaintType Subscribe -- ~End ----------------------------

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


    // fetching Id from router ~ Start  -------------------------------------------------------------------------------------------------      
    
    this.complaint_id_param = +this.route.snapshot.params['id'];
    console.log("---- --- --- Display ID Received ---- --- ---");
    console.log(this.complaint_id_param);
   
      // fetching Id from router ~ End  -------------------------------------------------------------------------------------------------  


    
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

          
     
          this.userParams = {"owner_id":this._userProfileData.ownerDetails.owner_id};
      
  
        // make call to get Complaint details
        //  makeRequest_getComplaintDetails()~ Start  -----------------------------------------------------------------------
        
          console.log("---- --- --- JSON Request for Complaint Details ---- --- ---");
          this.complaint_params = {"complaint_params": {"complaint_id": this.complaint_id_param }};
          console.log(this.complaint_params);

          // get the Input JSON format for making http request.
          this.getRequestInput = this.callHttpGet.createGetRequestRecord(
            this.complaint_params
          );
          console.log(   
            "%c  Request Input : >>> ",
            "color: green; font-weight: bold;",
            this.getRequestInput
          );
          
    
    // subscribing to get CustomerDetails with request json
    this.callHttpGet.makeRequest_getComplaintDetails(this.getRequestInput).subscribe(response => {
      console.log(
        "%c Complaint Details List ***** -------------------------------------------------------------------------- ",
        "background: #ff5722;font-weight: bold;color: white; "
      );

      this._ComplaintDetails = response.complaintDetailsList;
      this.ComplaintDetailsList = this._ComplaintDetails;
      console.log(this.ComplaintDetailsList);
    
    });

  //  makeRequest_getComplaintDetails()~ End  -----------------------------------------------------------------------


  // make call to get Users List
  //  makeRequest_getUsersList()~ Start  -----------------------------------------------------------------------

    // get the Input JSON format for making http request.
    this.getRequestInput = this.callHttpGet.createGetRequestRecord(
      this.userParams
    );
    console.log(   
      "%c  Request Input : >>> ",
      "color: green; font-weight: bold;",
      this.getRequestInput
    );
    
    
    // subscribing to get CustomerDetails with request json
    this.callHttpGet.makeRequest_getUsersList(this.getRequestInput).subscribe(response => {
     
        // UnZipping and uncompress for retrieving  List
     this.gzipService.makeRequest_uncompress(response).then(function(result) {
      console.log(
        "%c Users Details List ***** -------------------------------------------------------------------------- ",
        "background: #ff5722;font-weight: bold;color: white; "
      );
      console.log('result',result);

      this._UsersDetails = result.usersList;
      console.log('this._UsersDetails',this.UsersDetailsList);

      for (let sub in this._UsersDetails) {
      
        this.UsersDetailsList.push(this._UsersDetails[sub].user_name);
  
      }
      
    }.bind(this)) 

    });

  //  makeRequest_getUsersList()~ End  -------------------------------------------------------------------------------------



  // make call for retrieving Complaints List
  //  ~ Start -retrieving Compliants List  ------------------------------------------------------------------------------------------

    // get the Input JSON format for making http request.
    this.getRequestInput = this.callHttpGet.createGetRequestRecord(
      this._userProfileData.ownerDetails
    );
    
    this.callHttpGet.makeRequest_GetComplaint(this.getRequestInput).subscribe(response => {
    
      // UnZipping and uncompress for retrieving Pack List
      this.gzipService.makeRequest_uncompress(response).then(function(result) {
 
        // Log Response - Remove Later
      console.warn(
        "%c ___________________________ Get Complaints Response ___________________________",
        "background: #4dd0e1;color: black; font-weight: bold;"
      );

      console.log(result.complaintsList);

      this._complaintsList = result.complaintsList;

      if (this._complaintsList.length > 0) {
        this.complaint_obj = this._complaintsList.find(
          obj => obj.complaint_id === this.complaint_id_param
        );

        if(this.complaint_obj) {
          console.log("-----------Set Values to form fields-Filtered Complaint---------------------");
          console.log(this.complaint_obj);
          
          this.customerNumberObj=this.complaint_obj.customer_number;

          // Set Values to form fields
          this.editComplaintSummary.controls["complaint_type"].setValue(this.complaint_obj.complaint_type);
          this.editComplaintSummary.controls["complaint_description"].setValue(this.complaint_obj.complaint_description);

          // set values to ComplaintSummary JSON for Post
          this.ComplaintSummary.complaint_type        = this.complaint_obj.complaint_type;
          this.ComplaintSummary.complaint_description = this.complaint_obj.complaint_description;
          this.ComplaintSummary.created_by            = this._userProfileData.userDetails.user_name;
          this.ComplaintSummary.complaint_status      = this.complaint_obj.complaint_status;
          this.ComplaintSummary.complaint_number      = this.complaint_obj.complaint_number;
          this.ComplaintSummary.complaintTitle        = this.complaint_obj.complaint_title;
          this.tempComplaintStatus                    = this.complaint_obj.complaint_status;
           
           
          $(document).ready(function(){
            M.updateTextFields();
            $('select').select(); 
          });


          // make call to get SubscriptionList details
          // makeRequest_GetSubscriptionList() ~ Start  -------------------------------------------------------------------------------------------------
            
            
            this.getSubscriptionParams =  {"owner_id": this._userProfileData.ownerDetails.owner_id, "customer_number": this.complaint_obj.customer_number};
        
            // get the Input JSON format for making http request.
            
              this.getRequestInput = this.callHttpGet.createGetRequestRecord(
                this.getSubscriptionParams
              );
              console.log(   
                "%c  Request Input : >>> ",
                "color: green; font-weight: bold;",
                this.getRequestInput
              );
        
            // Subscribing to get SubscriptionList
            this.callHttpGet.makeRequest_GetSubscriptionList(this.getRequestInput).subscribe(response => {
              console.log(
                "%c Subscription List ***** -------------------------------------------------------------------------- ",
                "background: #ff5722;font-weight: bold;color: white; "
              );

              this._SubscriptionList = response.subscription;
              console.log(this._SubscriptionList);

              // Check the Response Array List and Display the data in tabular Format
              // If the Response Array List is blank/no-records - display no reacords in the table - set showNoRecords flag true
            
              if (this._SubscriptionList.length > 0) {
                this.showLoader = false;
                
                // console.log('Subscription List:',this._SubscriptionList);
      
                this.filteredData = this._SubscriptionList;
                this.filteredTotal = this._SubscriptionList.length;
                
                this.filter();
                
              } else {
                this.showLoader    = false;
                this.showNoRecords = true;
              }
            
        
            });
        // makeRequest_GetSubscriptionList() ~ End  -------------------------------------------------------------------------------------------------

        }
      }
    }.bind(this)) 

        // make call to get Complaint Titles 
        // makeRequest_getComplaintTitles() ~ Start  ------------------------------------------------------------------------------------
            
          this.callHttpGet.makeRequest_getComplaintTitles().subscribe(response => {
            console.log(
              "%c Complaint Titles List ***** -------------------------------------------------------------------------- ",
              "background: #ff5722;font-weight: bold;color: white; "
            );

            this._ComplaintTitlesList = response.complaintTitles;
            console.log(this._ComplaintTitlesList);

            console.log('complaintType',this.complaint_obj.complaint_type);
            
            this.ComplaintTitles = this._ComplaintTitlesList.filter(obj => obj.complaint_type === this.complaint_obj.complaint_type);
            console.log(
              "*** --------------- Filtered Compliant List ---------------***"
            );
            console.log(this.ComplaintTitles);

            this.editComplaintSummary.controls['complaint_title_id'].setValue(this.complaint_obj.complaint_title_id);
          

            // assigning value to radio button(Complaint Title)
            for (let sub in this._ComplaintTitlesList) {

              if (this._ComplaintTitlesList[sub].complaint_title_id == this.complaint_obj.complaint_title_id) {
                
                this.tempComplaintTitles.push(this._ComplaintTitlesList[sub]);
                
                this.ComplaintSummary.complaintTitle = this.complaint_obj.complaint_title;
                
                this.listClick(event, this.tempComplaintTitles[0]);     
              }
              
            }
            
            // Close Loader
          this.showLoader = false;

          this.zone.run(() => {
            // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
            // https://angular.io/api/core/NgZone

            $(document).ready(function(){
            
              // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
              $('.modal').modal();
              $('.modal').modal({
                dismissible: false,
              });
              M.updateTextFields();
              $('select').select(); 
              $('input#input_text, textarea#textarea2').characterCounter();

            });
          });

        });    
        // makeRequest_getComplaintTitles() ~ End  ------------------------------------------------------------------------------------------
        
       
  });
  //  ~ End -retrieving Compliants List  ------------------------------------------------------------------------------------------


  
  

  
  });
  // ~ End  get user profile -------------------------------------------------------------------------------------------------      

  // initialize and execute jquery document ready    
  this.zone.run(() => {
    // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
    // https://angular.io/api/core/NgZone

    $(document).ready(function(){
    
      // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
      $('.modal').modal();
      
      $('select').select(); 
      $('input#input_text, textarea#textarea2').characterCounter();

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

  //   if(!this.editComplaintSummary.dirty){
  //      this._service.info('<strong>Note<strong>',
  //    ' You have made no changes to submit.',
  //   );
  // }


  if (this.editComplaintSummary.valid) {
    
    this.editComplaintSummary.value.created_by      = this._userProfileData.userDetails.user_name;
    this.editComplaintSummary.value.owner_id        = this._userProfileData.ownerDetails.owner_id;
    this.editComplaintSummary.value.modified_by     = this._userProfileData.userDetails.user_name;
    this.editComplaintSummary.value.logged_by       = this._userProfileData.userDetails.user_id;
    this.editComplaintSummary.value.active          = 'Y';
    this.editComplaintSummary.value.complaint_title = this.ComplaintSummary.complaintTitle;
    this.editComplaintSummary.value.complaint_id    = this.complaint_obj.complaint_id;
    this.editComplaintSummary.value.customer_number = this.complaint_obj.customer_number;
    this.editComplaintSummary.value.customer_id     = this.complaint_obj.customer_id;
    
    
    this.editComplaintSummary.value.complaint_status = this.tempComplaintStatus;
    this.editComplaintSummary.value.created_by_id    = this._userProfileData.userDetails.user_id;
          

    // this.complaint_details = {"complaint_details":this.ComplaintDetailsList};
    // this.complaint_summary = {"complaint_summary": this.editComplaintSummary.value};

    this.resultObj = {"complaint_details":this.ComplaintDetailsList,"complaint_summary": this.editComplaintSummary.value};

    console.log(
      "%c Submitted Complaint Details  ***** -------------------------------------------------------------------------- ",
      "background: #ff5722;font-weight: bold;color: white; "
    );
          
    // get the Input JSON format for making http request.
    this.getRequestInput = this.callHttpGet.createGetRequestRecord(
      this.resultObj
    );
    console.log(   
      "%c  Request Input : >>> ",
      "color: green; font-weight: bold;",
      this.getRequestInput
    );
          
    this.postRequestObject = this.getRequestInput;
    console.log('onsubmit',JSON.stringify(this.postRequestObject));

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
      this.callHttpPost.makeRequest_manageComplaints(this.postRequestObject).subscribe(response => {
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
    this.validateFields.validateAllFormFields(this.editComplaintSummary);
    this._service.warn('<strong>Warning<strong>',
    ' Please fill the required form fields',
  );
  }
}
    
//  ~ End -onSubmit  ---------------------------------------------------------------------------------------


  // --  @details :  Local Functions/Methods ########################################################
  //  ~ Start -Local Functions/Methods  -------------------------------------------------------------


  // @details : Complaint List Select Fuction ______________________________________________________________
  // Click Event Function to highlight selected list item - Start ------------------------------------------
  listClick(event, newValue) {
    console.log("------------*** New Value ***------------");
    console.log(newValue);
    this.selectedListRecord = newValue;
  }
  // Click Event Function to highlight selected list item - End ------------------------------------------


  // -------------editComplaintSummary() ~ Start  ------------------------------------
  // @Details : Function to Edit Complaint Summary.
  // ---------------------------------------------------------------------------------

  editComplaintDataSummary() {
    
    if (this.editComplaintSummary.valid) {
      this.flag                                   = true;
      this.ComplaintSummary.complaint_type        = this.editComplaintSummary.controls['complaint_type'].value;
      this.ComplaintSummary.complaint_description = this.editComplaintSummary.controls['complaint_description'].value;
      this.ComplaintSummary.created_by            = this._userProfileData.userDetails.user_name;

      for (let sub in this._ComplaintTitlesList) {
        if(this._ComplaintTitlesList[sub].complaint_title_id == this.editComplaintSummary.controls['complaint_title_id'].value) {

          this.ComplaintSummary.complaintTitle   = this._ComplaintTitlesList[sub].complaint_title;
        }
      }
      console.log(
        "%c Complaint Summary  ***** -------------------------------------------------------------------------- ",
        "background: #ff5722;font-weight: bold;color: white; "
      );
      console.log(this.editComplaintSummary);

      $(document).ready(function(){
        M.updateTextFields();
        $('select').select(); 
      
      });
  
      $('#addComplaintModal').modal('close');
    }
    else
    {
      this.validateFields.validateAllFormFields(this.editComplaintSummary);
      this._service.warn('<strong>Warning<strong>',
      ' Please fill the required form fields',
    );
    }
  }

  //  -------------editComplaintSummary() ~ End  --------------------------------------------------------------

  

  // ----------------resetModelFields() ~start--------------------------------------
  // @details : Function to reset field values.
  //  ++  Onclick of Add button resets all fields in ComplaintProgressDetails model.
  // -------------------------------------------------------------------------------
    resetModelFields()
    {

      this.AddComplaintStatus.reset();
      this.user_name = '';
      $(document).ready(function(){
        M.updateTextFields();
        $('select').select(); 
      });
      console.log('clicked');
    }
  // ----------------resetModelFields() ~end--------------------------------------



  // -------------editComplaintProgressDetails() ~ Start  ------------------------------------------------
  // @Details : Function to Add Complaint Progress Details.
  // ---------------------------------------------------------------------------------------------
  editComplaintProgressDetails() {
            
      if(this.AddComplaintStatus.valid) {
      
        console.log('Selected Item');
      
        // set ComplaintProgressDetails field values.
        this.AddComplaintStatus.value.recordType  = 'N';
        this.AddComplaintStatus.value.comments    = this.AddComplaintStatus.value.complaint_comments;
        this.AddComplaintStatus.value.created_by  = this._userProfileData.userDetails.user_name;
        this.AddComplaintStatus.value.assigned_on = this.currentDate;
        this.tempComplaintStatus = this.AddComplaintStatus.value.complaint_status;
    
        // set assignedTo value to ComlaintProgress from usersList.
        for (let sub in this._UsersDetails) {
          if(this._UsersDetails[sub].user_name == this.AddComplaintStatus.controls['assigned_to_name'].value) {
    
            this.AddComplaintStatus.value.assigned_to = this._UsersDetails[sub].user_id;
          
          }
        }
    
        this.ComplaintDetailsList.push(this.AddComplaintStatus.value);
        
        $(document).ready(function(){
          M.updateTextFields();
          $('select').select(); 
        
        });
    
        $('#addComplaintProgressModel').modal('close');
      }
      else {
        this.validateFields.validateAllFormFields(this.AddComplaintStatus);
        this._service.warn('<strong>Warning<strong>',
        ' Please fill the required form fields',
      );
      }
  }
  // -------------editComplaintProgressDetails() ~ Start  ------------------------------------



  // ------------------- Remove Record  -- Start ----------------------------
    removeComplaintDetail(index)
    {
      this.ComplaintDetailsList.splice(index, 1);
      console.log('Removed Index Is:');
      console.log(index,1);
    }
  // ------------------- Remove Record -- End ----------------------------


  // --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  receiveToggleSidebarObj($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this._opened = $event;

    // console.log("**** @@ Sidebar Open Object @@ ****");
    console.log(this._opened);

  }
  //  ~ End  ----------------------------------------------------------------------------------------------------



  // --  @details :  Class Functions for the TeraData Datatable ###################################################
  //  ~ Start_____________________________________________________________________________________________

  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    console.log('currentPage',this.currentPage);
    this.filter();
  }

  filter(): void {
    let newData: any[] = this._SubscriptionList;
    let excludedColumns: string[] = this.columns
    .filter((column: ITdDataTableColumn) => {
      return ((column.filter === undefined && column.hidden === true) ||
              (column.filter !== undefined && column.filter === false));
    }).map((column: ITdDataTableColumn) => {
      return column.name;
    });
    newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
    this.filteredTotal = newData.length;
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  //  ~ End_____________________________________________________________________________________________




  // --  @details :  receiveCustomerDetailsObject (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  receiveCustomerDetailsObject($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this.customerDetailsObj = $event;

    console.log("**** @@ Customer Object @@ ****");
    console.log(this.customerDetailsObj);
    

  }
  // receiveCustomerDetailsObject ~ End  ----------------------------------------------------------------------------------------------------




  //  ~ End -Local Functions/Methods  -------------------------------------------------------------





}
// -------------------  Component & Class Definition - End -----------------------------------------------
