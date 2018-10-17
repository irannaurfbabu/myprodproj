/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR EDIT Customer ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Render the area data in tabular format with ability to :-
|      ** Ability to Edit Existing Customer
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 30-JAN-2018    v0.1         - Created the New Component.
|   ++ 07-MAR-2018    v0.21        - Altering subscrition model
____________________________________________________________________________________________________________

*/
// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities
import { DatePipe } from '@angular/common';
import { Component, OnInit, Inject , NgZone } from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import { PersistenceService } from 'angular-persistence';
import { NgProgressModule, NgProgress } from '@ngx-progressbar/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgProgressRouterModule } from '@ngx-progressbar/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl, FormGroupDirective, FormsModule, ReactiveFormsModule , NgForm 
} from '@angular/forms';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatRippleModule,
  MatSnackBarModule,
  MatSortModule,
  MatSnackBar,
  MatAutocompleteModule,
  MatDatepickerModule
} from '@angular/material';
import { NotificationsService } from 'angular2-notifications';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { Observable } from 'rxjs/Observable';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import swal from 'sweetalert2';
// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from '../../../Service/me-call-http-get.service';
import { MeUserProfileService } from '../../../Service/me-user-profile.service';
import { MeValidateFormFieldsService } from '../../../Service/me-validate-form-fields.service';
import { StorageType } from '../../../Service/Interfaces/storage-type.enum';

import { MeAreaInterface } from '../../../Service/Interfaces/me-area-interface';
import { MePackInterface } from '../../../Service/Interfaces/me-pack-interface';
import { MeCallHttpPostService } from '../../../Service/me-call-http-post.service';
import { GetInputRecord } from '../../../Service/get-input-record';
import { MeCustomerInterface } from '../../../Service/Interfaces/me-customer-interface';
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';
import { MeToastNotificationService } from '../../../Service/me-toast-notification.service';
import { MeGzipService } from '../../../Service/me-gzip.service';
const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);

declare var jQuery: any;
declare var $: any;
declare var M: any;
declare var require: any;

//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start -----------------------------------------------

@Component({
  selector: 'app-me-edit-customer',
  templateUrl: './me-edit-customer.component.html',
  styleUrls: ['./me-edit-customer.component.css'],
  providers: [DatePipe]
})
export class MeEditCustomerComponent implements OnInit {

 // -- @details : Class variable declaration ###################################################################
  //  ~ Start  __________________________________________________________________________________________________

  // Class Form variables
  // All variables used in component template ( html file ) must be public
    // form variables

 // -- local private variables
  private customer_id_param: number                = 0;
  private pack_obj_exist   : any                   = '';
  private getRequestInput  : any                   = '';
  private postRequestObject: any                   = '';
  private count            : number                = 0;
  private _userProfileData : any;
  private _userLogin       : any;
  private _packList        : MePackInterface[]     = [];
  private _ResponsepackList: any[]                 = [];
  private _customersList   : MeCustomerInterface[] = [];
  private _areaList        : any                   = [];

  //generate Customer List 
  private getRequestInputObj : any = {
    user_id : null,
    owner_id: null,
    customer_number:null,
  };
  
  //To fetch Customer Id's 
  private postRequestCustomerIDObject: any =
  {
    records: [{
        owner_id: null,
        area_id: null,
    }]
  };
  // class variables
    customer_meta               : any;
    selectedPackName            : any;
    showPackList                : any[]             = [];    
    customer_obj             : any                   = '';
    showNoRecordsSubscription: boolean               = true;
    showNoRecordsPayments    : boolean               = true;
    showNoRecordsBasePackList: boolean               = false;
    showNoRecordsADDONList   : boolean               = false;
    showNoRecordsPack        : boolean               = false;
    index                    : any;
    index1                   : any;
    requestCustomerJson                     : any;
    CustomerIdList           : any;
    ExistingCustId           : any;
    customerId_obj             : any;

   

    //Calculation Variables
    base_price: number = 0;
    total_tax : number = 0;
    total_amount:number=0;

   //flags variables with default assign
    showAlertMessage: boolean = false;
    requirePack     : boolean = false;
    hasPack         : boolean = false;
    SMSFlag         : boolean = true;
    showNoCustomerIdList: boolean = true;
    showNoCustomerId    : boolean = false;
    showNoRecords       : boolean = false;
    CustomerActiveFlag  : boolean = false;
//flags variables withtout default assign
    isActive          : boolean;
    isInactive        : boolean;
    isPresentActive   : boolean;
    showLoader        : boolean;

  // function to open left side navgivation bar
  _opened: boolean = false;

 //Date Variables
 currentDate          : Date;
 minDate              : Date;
 maxDate              : Date;
 threeMonths          : Date;
 activationDateValue  : Date;

// pagination variables
  productsPerPage  = 5;
  selectedPage     = 1;
  productsPerPage1 = 5;
  selectedPage1    = 1;
 
  //filter           : any;
  currentpage      : any;
  filter1          : any;
  currentpage1     : any;
  temp1            : any;
  date             : string;
  LabelFlag        : string;
  EditSubIndex     :any;
  // sorting
  // sorting variables
  sortedData;
  key: string = 'customer_number'; // set default
  reverse: boolean = false;
  rownumber          :number=0;
  tempSubscriptionPackList: any[] =[];

// Autocomplete variables
  selectedItem: any = '';
  inputChanged: any = '';
  packname    : string;
  area_obj    : any = '';

  //Subscription Summary Variables
  SummaryRentTotal :number=0.0;
  SummaryTaxTotal :number=0.0;
  SummaryBillTotal :number=0.0;
  SummaryRecentActive :any;
  SummaryFirstActive :any;

  SummaryActive :number=0;
  SummarySuspended :number=0;
  SummaryDisconnected :number=0;
  SummaryBoxTotal :number=0;
  SummeryFreeBox  :number=0;


 // -- Create Form Group
 editCustomer_details: FormGroup;
 editCustomer_meta   : FormGroup;
 subscription_details: FormGroup;
 
// --  Customer Deta Fields
customer_number: AbstractControl;
  customer_id  : AbstractControl;
  first_name   : AbstractControl;
  last_name    : AbstractControl;
  phone        : AbstractControl;
  email        : AbstractControl;
  alias_name   : AbstractControl;
  address1     : AbstractControl;
  area_name    : AbstractControl;
  area_id      : AbstractControl;
  city         : AbstractControl;
  state        : AbstractControl;
  pincode      : AbstractControl;
  remarks      : AbstractControl;
  status       : AbstractControl;
  door_number  : AbstractControl;
// --  Customer Meta Fields
  agreement_number : AbstractControl;
  customer_category: AbstractControl;
  activation_date  : AbstractControl;
  reminder_date    : AbstractControl;
  GSTIN            : AbstractControl;
  subscribe_sms    : AbstractControl;

// --  Customer Subscription Fields
  subscriptionPackList: any[] = [];
  SubscriptionList    : any[] = [];
  showBasePackList    : any[] = [];
  showADDNCHNLPackList: any[] = [];
  
  stb_id             : AbstractControl;
  stb_number         : AbstractControl;
  stb_vc_number      : AbstractControl;
  stb_model_number   : AbstractControl;
  service_status     : AbstractControl;
  stb_serial_number  : AbstractControl;
  subscription_name  : AbstractControl;
  stb_activation_date: AbstractControl;
  stb_pack_name      :  AbstractControl;
  record_type        : AbstractControl;
  rownum             : AbstractControl;
  stb_modified       : AbstractControl;
// --  Customer Payments Fields
payment_details: any[] = [];
stbVCNumberList     : any[] = [];

oldvc_numberObj    :any;

// filter observable variables
  filteredPacks: Observable<any[]>;
  filteredAreas: Observable<any[]>;

  postRequestCustomerObject: any =
  {
    records: [{
       
        owner_id: null,
        customer_number: null,
        subscription_id: null
     
    }]
  };

 //Url Variabes
 public id:any;
 public source:string;


  // Tera DataTable Local Fields
 filteredData: any[] = [];
 filteredTotal: number = 0;

 searchTerm: string = '';
 fromRow: number = 1;
 currentPage: number = 1;
 pageSize: number = 50;
 sortBy: string = 'stb_vc_number';
 selectedRows: any[] = [];
 sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

 // Tera DataTable Set Column name/Label and other features.
 columns: ITdDataTableColumn[] = [
  { name: 'subscription_name', label: 'Subscription Name', filter: true, sortable: true,width:150},
  { name: 'stb_number', label: 'STB#', filter: true, sortable: true,width:210},
   { name: 'stb_vc_number', label: 'VC#', filter: true, sortable: true,width:210},
   { name: 'service_status', label: 'Status', sortable: true,width:130 },
   { name: 'base_price', label: 'Rent',numeric: true, format: DECIMAL_FORMAT, sortable: true, filter: true,width:90},
   { name: 'total_tax', label: 'Tax',numeric: true, format: DECIMAL_FORMAT, sortable: true, filter: true,width:90},
   { name: 'total_amount', label: 'Total',numeric: true, format: DECIMAL_FORMAT, sortable: true, filter: true,width:90},
   { name: 'rownum', label: 'Action', sortable: false, width:120 }
   ];  
  
   private getRequestOwnerInputObj : any = {
    owner_id: null
   };
  
   getRequestOwnerInput            :any;
  
  showVCNumberExist:boolean=false;
  showSTBNumberExist:boolean=false;

  vc_numberObj:any;
  stb_numberobj:any;

  oldstbvc_numberObjList: any[] = [];
  oldstb_numberobjList: any[] = [];

  //  ~ End  ----------------------------------------------------------------------------------------------------

   // --  @details :  constructor #################################################################################
  //  ~ Start -constructor ---------------------------------------------------------------------------------------------------
  constructor( fb: FormBuilder,
    public callHttpGet                :MeCallHttpGetService,
    public callHttpPost               : MeCallHttpPostService,
    // public getRequestInput:GetInputRecord,
    public userProfileService         : MeUserProfileService,
    private CustomerPersistenceService: PersistenceService,
    private validateFields            : MeValidateFormFieldsService,
    public snackBar                   : MatSnackBar,
    private zone                      : NgZone,
    private dialog                    : MatDialog,
    private route                     : ActivatedRoute,
    private router                    : Router,
    private datePipe                  : DatePipe,
    private _dataTableService         : TdDataTableService,
    public notification               : MeToastNotificationService,
    private gzipService               :MeGzipService,


  ) { 
//insitializing date variables
this.currentDate = new Date();
this.threeMonths   = new Date();
this.threeMonths.setFullYear(this.threeMonths.getFullYear() - 50);
this.minDate     = this.threeMonths;
this.maxDate     = this.currentDate;

        // set the show loader flag to true
    this.showLoader = true;
    this.date = new Date().toISOString().slice(0, 16);
       /*
       @details -  Intialize the form group with fields
          ++ The fields are set to default values - in below case to - null.
          ++ The fields are assigned validators
              ** Required Validator
      */

    //  let param = this.router.parseUrl(this.router.url);
    //  console.log('param.queryParams.id',param.queryParams.id)

    this.route.queryParams.subscribe(params => {
      this.id = params["id"];
      this.source = params["Source"];
  });

  console.log('Id',this.id,'source',this.source);

      this.customer_id_param = +this.id;
      this.getRequestInputObj.customer_number=this.customer_id_param;

      console.log('---- --- --- Display ID Received ---- --- ---');
      console.log(this.customer_id_param);

      this.editCustomer_details = fb.group({
        customer_id    : [null, Validators.required],
        customer_number: [null,Validators.required],
        first_name     : [null, Validators.required],
        last_name      : [''],
        phone          : ['',Validators.minLength(10)],
        email          : [''],
        alias_name     : [],
        address1       : [''],
        area_name      : [null, Validators.required],
        area_id        : [null],
        city           : [null, Validators.required],
        state          : [null, Validators.required],
        pincode        : [null, Validators.required],
        remarks        : [''],
        status         : [null, Validators.required],
        door_number    : [''],
      });
      this.editCustomer_meta = fb.group({
        agreement_number : [''],
        customer_category: ['R'],
        activation_date  : [''],
         reminder_date   : [''],
        GSTIN            : [''],
        subscribe_sms    : ['Y'],

      }),
      this.subscription_details= fb.group({
        stb_id             : [null],
        stb_number         : [null],
        stb_vc_number      : [null, Validators.required],
        stb_model_number   : [''],
        service_status     : ['ACTIVE', Validators.required],
        stb_serial_number  : [''],
        subscription_name  : [''],
        stb_activation_date: [''],
        stb_pack_name      : ['BSPK'],
        record_type        : [''],
        rownum             : [''],
        stb_modified       : ['N'],
      }),

           // Assign form controls to private variables
    // Controls are used in me-edit-Customer.component.html for accessing values and checking functionalities
           this.customer_number = this.editCustomer_details.controls['customer_number'];
           this.customer_id     = this.editCustomer_details.controls['customer_id'];
           this.first_name      = this.editCustomer_details.controls['first_name'];
           this.last_name       = this.editCustomer_details.controls['last_name'];
           this.phone           = this.editCustomer_details.controls['phone'];
           this.email           = this.editCustomer_details.controls['email'];
           this.alias_name      = this.editCustomer_details.controls['alias_name'];
           this.address1        = this.editCustomer_details.controls['address1'];
           this.area_id         = this.editCustomer_details.controls['area_id'];
           this.area_name       = this.editCustomer_details.controls['area_name'];
           this.city            = this.editCustomer_details.controls['city'];
           this.state           = this.editCustomer_details.controls['state'];
           this.pincode         = this.editCustomer_details.controls['pincode'];
           this.remarks         = this.editCustomer_details.controls['remarks'];
          this.status           = this.editCustomer_details.controls['status'];
          this.door_number      = this.editCustomer_details.controls['door_number'];

      this.agreement_number    = this.editCustomer_meta.controls['agreement_number'];
      this.customer_category   = this.editCustomer_meta.controls['customer_category'];
      this.activation_date     = this.editCustomer_meta.controls['activation_date'];
      this.reminder_date       = this.editCustomer_meta.controls['reminder_date'];
      this.GSTIN               = this.editCustomer_meta.controls['GSTIN'];
      this.subscribe_sms       = this.editCustomer_meta.controls['subscribe_sms'];

      this.stb_id              = this.subscription_details.controls['stb_id'];
      this.stb_number          = this.subscription_details.controls['stb_number'];
      this.stb_vc_number       = this.subscription_details.controls['stb_vc_number'];
      this.stb_model_number    = this.subscription_details.controls['stb_model_number'];
      this.service_status      = this.subscription_details.controls['service_status'];
      this.stb_serial_number   = this.subscription_details.controls['stb_serial_number'];
      this.subscription_name   = this.subscription_details.controls['subscription_name'];
      this.stb_activation_date = this.subscription_details.controls['stb_activation_date'];
      this.stb_pack_name       = this.subscription_details.controls['stb_pack_name'];
      this.record_type         = this.subscription_details.controls['record_type'];
      this.rownum              = this.subscription_details.controls['rownum'];    
      this.stb_modified        = this.subscription_details.controls['stb_modified'];            

    

         //  get the Area object based on city selection/input
      // use the area object to populate state,city and pincode
    this.area_name.valueChanges.subscribe((value: string) => {
      console.log(
        '%c ------------------  Event Change City ------------------',
        'background: green; color: white; display: block;'
      );
      console.warn('*** Values before Calculation *** ');
      console.log('City Value:', value);
      console.log('City Records:', this._areaList);
      this.area_obj = this._areaList.find(obj => obj.area_name === value);
      console.log(this.area_obj);

      if (this.area_obj) {

        this.postRequestCustomerIDObject.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
        this.postRequestCustomerIDObject.records[0].area_id  = this.area_obj.area_id;

          //  ~ Start -retrieving CustomerId List  --------------------------------------------------------------------------
          this.callHttpGet.makeRequest_GetCustomerId(this.postRequestCustomerIDObject)
          .subscribe(response => {
            this.CustomerIdList=response.customerId;
            if(this.CustomerIdList.length != 0){
              this.showNoCustomerIdList=false;
            }
            console.log('this.CustomerIdList',this.CustomerIdList);
          });
        // Set the values to hiddenn fields
        this.editCustomer_details.controls['area_id'].setValue(this.area_obj.area_id);
        this.editCustomer_details.controls['city'].setValue(this.area_obj.city);
        this.editCustomer_details.controls['state'].setValue(this.area_obj.state);
        this.editCustomer_details.controls['pincode'].setValue(this.area_obj.pincode);
        $(document).ready(function() {
          M.updateTextFields();
        });
      } else {
        this.editCustomer_details.controls['area_id'].setValue(null);
        this.editCustomer_details.controls['city'].markAsTouched({ onlySelf: true });
        this.editCustomer_details.controls['state'].markAsTouched({ onlySelf: true });
        this.editCustomer_details.controls['pincode'].markAsTouched({ onlySelf: true });
      
      }
    });

  // -- Area Name Value Change end -------------------------- ~end ---------------

    // -- STB Pack Name Value Change  -------------------------- ~Start ---------------

    this.stb_pack_name.valueChanges.subscribe(
      (value: string) => {
        this.selectedPackName='';
      }  );
        // -- STB Pack Name Value Change  -------------------------- ~end ---------------

    // -- Customer Id Value Change  -------------------------- ~Start ---------------

      this.customer_id.valueChanges.subscribe((value: string) => {

        this.customerId_obj=this._customersList.find(
          obj => obj.customer_id === value
        );

        if(this.customerId_obj && this.customerId_obj.customer_id.toLowerCase() != this.ExistingCustId.toLowerCase()){
        console.log(this.customerId_obj.customer_id.toLowerCase(),this.ExistingCustId.toLowerCase());
          console.log('same',this.customerId_obj);
          this.showNoCustomerId=true;
          console.log('same',this.showNoCustomerId);
        }else{
          this.showNoCustomerId=false;

        }

      } );
    // --  Customer Id Value Change -------------------------- ~end ---------------

          // -- STB VCNumber Value Change  -------------------------- ~Start ---------------
          this.stb_vc_number.valueChanges.subscribe((value: string) =>{

            console.log('oldVC numb',this.oldstbvc_numberObjList);

            this.vc_numberObj =this.stbVCNumberList.find(
              obj => obj.stb_vc_number === value 
            );
      
            console.log('this.vc_numberObj',this.vc_numberObj);
            console.log('this.oldstbvc_numberObjList',this.oldstbvc_numberObjList);

            if( this.vc_numberObj){
              this.oldvc_numberObj =this.oldstbvc_numberObjList.find(
                obj => obj.stb_vc_number === this.vc_numberObj.stb_vc_number 
              );

              console.log('oldvc_numberObj',this.oldvc_numberObj);
              if(this.oldvc_numberObj){
                
                if(this.oldvc_numberObj.stb_id == this.subscription_details.value.stb_id){
                  this.showVCNumberExist =false;
                }else{
                  this.showVCNumberExist =true;
                }

                
              }else{
                this.showVCNumberExist =true;
              }

              
            }else{
              this.showVCNumberExist =false;
            }
          })
      
      
            // -- STB VCNumber Value Change  -------------------------- ~Start ---------------
      
                  // -- STB VCNumber Value Change  -------------------------- ~Start ---------------
          this.stb_number.valueChanges.subscribe((value: string) =>{
            console.log('oldSTB numb',this.oldstb_numberobjList);

            this.stb_numberobj =this.stbVCNumberList.find(
              obj => obj.stb_number === value
            );
      
            if( this.stb_numberobj){
              this.showSTBNumberExist =true;
            }else{
              this.showSTBNumberExist =false;
            }

            if( this.stb_numberobj){

              let oldstb_numberObj =this.oldstbvc_numberObjList.find(
                obj => obj.stb_number === this.stb_numberobj.stb_number 
              );

              console.log('oldstb_numberObj',oldstb_numberObj);
              if(oldstb_numberObj){

                if(oldstb_numberObj.stb_id == this.subscription_details.value.stb_id){
                  this.showSTBNumberExist =false;
                }else{
                  this.showSTBNumberExist =true;
                }

              }else{
                this.showSTBNumberExist =true;
              }

            }else{
              this.showSTBNumberExist =false;
            }

          })
      
      
            // -- STB VCNumber Value Change  -------------------------- ~Start ---------------


        // --  stb Pack Name Value Change -------------------------- ~start ---------------
    this.stb_pack_name.valueChanges.subscribe((value: string) => {
      console.log(value);
      this.showPackList=[];

           for (let sub in this._packList) 
           {
                            if(this._packList[sub].pack_type == 'BSPK' && value == 'BSPK')
                            {
                               console.log( this._packList[sub].pack_name);
                               this.showPackList.push(this._packList[sub].pack_name);
                            } else
                             if(this._packList[sub].pack_type == 'ADDN' && value == 'ADDN'  )
                             {
                             this.showPackList.push(this._packList[sub].pack_name);
                            }else
                            if(this._packList[sub].pack_type == 'CHNL' && value == 'CHNL' )
                            {
                              this.showPackList.push(this._packList[sub].pack_name);
                            }
            }
         });
    }
        // --  stb Pack Name Value Change -------------------------- ~start ---------------

       // -- constructor -------------------------- ~end ---------------

//  ~ Start -ngOnInit  ---------------------------------------------------------------------------------------
  ngOnInit() {
    // Initialize Loader
    this.showLoader = true;
  // initialize and execute jquery document ready
this.zone.run(() => {
  $(document).ready(function() {
    M.updateTextFields();
    $('select').select();
    $('.datepicker').datepicker();
    $('.modal').modal({
      dismissible: false,
    });
});

});

// Fetch the User Login Details Stored in the Cache
this._userLogin = this.CustomerPersistenceService.get(
  'userLogin',
  StorageType.SESSION
);
 // make call to get user profile details
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.userProfileService
    .makeRequest_UserProfile(this._userLogin)
    .subscribe(response => {
    this._userProfileData = response;

  
   // assign values to customer request object
   this.getRequestInputObj.owner_id = this._userProfileData.ownerDetails.owner_id;
   this.getRequestInputObj.user_id = this._userProfileData.userDetails.user_id;

   // get the Input JSON format for making http request.
   this.getRequestInput = this.callHttpGet.createGetRequestRecord(
     this.getRequestInputObj
     );
     console.log(
     "%c  Request Input : >>> ",
     "color: green; font-weight: bold;",
     this.getRequestInput
     );

     this.getRequestOwnerInputObj.owner_id =this._userProfileData.ownerDetails.owner_id;


    // get the Input JSON format for making http request.
    this.getRequestOwnerInput = this.callHttpGet.createGetRequestRecord(
      this.getRequestOwnerInputObj
    );



   // make call for retrieving Area List
        //  ~ Start -retrieving Area List  ------------------------------------------------------------------------------------------
        this.callHttpGet
          .makeRequest_ManageCustomer(this.getRequestInput)
          .subscribe(response => {

          // UnZipping and uncompress for retrieving  List
          this.gzipService.makeRequest_uncompress(response).then(function(result) {
        
              this._customersList = result.customersList; 
              // this.customer_obj = customers; 
              console.log('customers',result.customersList);
            // If the Response Array List is blank/no-records - display no reacords in the table - set showNoRecords flag true
            if (this._customersList.length > 0) {
              this.customer_obj = this._customersList.find(
                obj => obj.customer_number === this.customer_id_param
              );

              console.log();

              if(this.customer_obj) {

                // Set Values to form editCustomer_details fields
                this.editCustomer_details.controls['customer_number'].setValue(this.customer_obj.customer_number);
              this.ExistingCustId=this.customer_obj.customer_id;
                this.editCustomer_details.controls['customer_id'].setValue(this.customer_obj.customer_id);
                this.editCustomer_details.controls['first_name'].setValue(this.customer_obj.first_name);
                this.editCustomer_details.controls['last_name'].setValue(this.customer_obj.last_name);
                this.editCustomer_details.controls['phone'].setValue(this.customer_obj.phone);
                this.editCustomer_details.controls['email'].setValue(this.customer_obj.email);
                this.editCustomer_details.controls['alias_name'].setValue(this.customer_obj.alias_name);
                this.editCustomer_details.controls['address1'].setValue(this.customer_obj.address1);
                this.editCustomer_details.controls['area_id'].setValue(this.customer_obj.area_id);
                this.editCustomer_details.controls['area_name'].setValue(this.customer_obj.area_name);
                this.editCustomer_details.controls['city'].setValue(this.customer_obj.city);
                this.editCustomer_details.controls['state'].setValue(this.customer_obj.state);
                this.editCustomer_details.controls['pincode'].setValue(this.customer_obj.pincode);
                this.editCustomer_details.controls['remarks'].setValue(this.customer_obj.remarks);
                this.editCustomer_details.controls['door_number'].setValue(this.customer_obj.door_number);

                console.log('Inside NgINIT',this.customer_obj);

                this.postRequestCustomerIDObject.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
                this.postRequestCustomerIDObject.records[0].area_id  = this.customer_obj.area_id;
        
                  //  ~ Start -retrieving CustomerId List  --------------------------------------------------------------------------
                  this.callHttpGet.makeRequest_GetCustomerId(this.postRequestCustomerIDObject)
                  .subscribe(response => {
                    this.CustomerIdList=response.customerId;
                    if(this.CustomerIdList.length != 0){
                      this.showNoCustomerIdList=false;
                    }
                    console.log('this.CustomerIdList',this.CustomerIdList);
                  });

         // set status flag
         if (this.customer_obj.active === 'Y') {

          this.editCustomer_details.controls['status'].setValue(true);
          this.isActive   = true;
          this.isInactive = false;
          this.isPresentActive = true;

        } else if (this.customer_obj.active === 'N') {

          this.editCustomer_details.controls['status'].setValue(false);
          this.isActive   = false;
          this.isInactive = true;
          this.isPresentActive = false;

        }
        // Assign ownerId and customer number to call
          this.postRequestCustomerObject.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
          this.postRequestCustomerObject.records[0].customer_number = this.customer_obj.customer_number;
          console.log('this.postRequestCustomerObject',this.postRequestCustomerObject);



        // make call for retrieving CustomerMeta List
        //  ~ Start -retrieving CustomerMeta List  --------------------------------------------------------------------------
        this.callHttpGet.makeRequest_GetCustomerMeta(this.postRequestCustomerObject)
          .subscribe(response => {
            
            this.customer_meta = response.customer_meta;
            console.log(response.customer_meta);
            // Assign Values
            this.editCustomer_meta.controls['agreement_number'].setValue(this.customer_meta.agreement_number);
           this.editCustomer_meta.controls['customer_category'].setValue(this.customer_meta.customer_category);
           console.log('activation_date',this.customer_meta.activation_date);
           if(this.customer_meta.activation_date!= null){
            
            this.editCustomer_meta.controls['activation_date'].setValue(this.customer_meta.activation_date);
           }else{
            console.log('currentDate',this.currentDate);
            this.editCustomer_meta.controls['activation_date'].setValue(this.currentDate);
           }
           this.editCustomer_meta.controls['reminder_date'].setValue(this.customer_meta.reminder_date);
           this.editCustomer_meta.controls['GSTIN'].setValue(this.customer_meta.GSTIN);
           this.editCustomer_meta.controls['subscribe_sms'].setValue(this.customer_meta.subscribe_sms);
            if(this.customer_meta.subscribe_sms=='Y'){
              this.SMSFlag=true;
            }else{
              this.SMSFlag=false;
            }
           this.showLoader = false;
          // Jquery Call
           $(document).ready(function() {
            M.updateTextFields();
            $('select').select();
            $('.datepicker').datepicker();
            $('.modal').modal({
              dismissible: false,
            });
            
          });
        });
 // ~ End  -------------------------------------------------------------------------------------------------

         // make call for retrieving CustomerSubscription List
            this.callHttpGet.makeRequest_GetCustomerSubscription(this.postRequestCustomerObject)
            .subscribe(response => {
            this.SubscriptionList = response.subscription;
            console.log(this.SubscriptionList);
            if (this.SubscriptionList.length < 0) {
            this.showNoRecordsSubscription = true;
            }else{
            this.showNoRecordsSubscription = false;
            for (let sub in this.SubscriptionList) 
            {
                     if(true)
                     {
                      this.SubscriptionList[sub].stb_modified='N';

                      console.log('sub', this.SubscriptionList[sub]);

                       this.SubscriptionList[sub].rownum=sub;
                       this.rownumber= +this.SubscriptionList[sub].rownum;
                       this.oldstbvc_numberObjList.push(this.SubscriptionList[sub]);
                       this.oldstb_numberobjList.push(this.SubscriptionList[sub].stb_number);

                      this.postRequestCustomerObject.records[0].subscription_id =
                      this.SubscriptionList[sub].subscription_id;
                             
                      // make call for retrieving SubscriptionPacks List
                      this.callHttpGet.makeRequest_GetSubscriptionPacks(this.postRequestCustomerObject)
                      .subscribe(response => {
                        this.temp1=this.SubscriptionList[sub];
                       this.subscriptionPackList = response.SubscriptionPacks;
                       this.index1=sub;
                       this.temp1.record_type='E';
                       console.log('this.subscriptionPackList');
                       console.log(this.subscriptionPackList);
                       this.temp1.pack_details=this.subscriptionPackList;
                       this.SubscriptionList.splice(this.index1, 1 , this.temp1);
                       console.log(this.temp1);
                      
                       console.log(this.SubscriptionList);
                        //this.stb_id=this.SubscriptionList.stb_number;
                       if (this.SubscriptionList.length > 0) {
                        this.showLoader = false;
                        
                        console.log('Subscription List:',this.SubscriptionList);
              
                        this.filteredData = this.SubscriptionList;
                        this.filteredTotal = this.SubscriptionList.length;
                        
                        this.filter();
                        
                      } else {
                        this.showLoader    = false;
                        this.showNoRecords = true;
                      }

                     });
                     }
     }
      this.SummaryCalculation();
    }
  $(document).ready(function() {
    M.updateTextFields();
    $('.modal').modal({
      dismissible: false,
    });
});


});

}

// ~ End  -------------------------------------------------------------------------------------------------
  
         
    // make call to get ManagePack details
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.callHttpGet.makeRequest_ManagePack(this.getRequestInput).subscribe(response => {
      
     // UnZipping and uncompress for retrieving  List
     this.gzipService.makeRequest_uncompress(response).then(function(result) {
 
   
      console.log(
        '%c City List ***** -------------------------------------------------------------------------- ',
        'background: #ff5722;font-weight: bold;color: white; '
      );

      this._ResponsepackList = result.packList;
      for (let sub in this._ResponsepackList) 
      {
                       if(this._ResponsepackList[sub].active == 'Y')
                       {
                          this._packList.push(this._ResponsepackList[sub]);
                       }
       }
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
    // ~ End  -------------------------------------------------------------------------------------------------
     // make call to get GetArea details
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.callHttpGet.makeRequest_GetArea(this.getRequestInput).subscribe(response => {
       // UnZipping and uncompress for retrieving  List
       this.gzipService.makeRequest_uncompress(response).then(function(result) {
 
      console.log(
        '%c City List ***** -------------------------------------------------------------------------- ',
        'background: #ff5722;font-weight: bold;color: white; '
      );

      this._areaList = result.areaList;
      console.log(this._areaList);
      console.log(this._areaList.slice());
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
    // ~ End  -------------------------------------------------------------------------------------------------
  }
}.bind(this)) 
   // Close Loader
          });// ~ End -retrieving Customer List---------------------------------------------

            // make call to get VC number details
  //  ~ Start  -------------------------------------------------------------------------------------------------
  
this.callHttpGet.makeRequest_getStbVcNumberList(this.getRequestOwnerInput).subscribe(response =>{
  console.log('response getStbVcNumberList',response);
  this.stbVCNumberList=response.StbVcDetails;
  console.log('response getStbVcNumberList',this.stbVCNumberList);
})


  // ~ End  -------------------------------------------------------------------------------------------------
    });

    $(document).ready(function() {
      M.updateTextFields();
      $('select').select();
      $('.datepicker').datepicker();
      $('.modal').modal({
        dismissible: false,
      });
  });
  }

 // ~ End  -()NgInit------------------------------------------------------------------------------------------------

// -- onSubmit -------------------------- ~start ---------------
onSubmit(value: string): void {

  /* @details - Check for fields validity
     ++ Check the editArea validity
       ** If the form state is invalid call validateAllFormFields service
       ** If the form state is valid call http service
  */
// Checking Status
this.payment_details=[];

console.log('this.subscription_details',this.subscription_details);
console.log('this.payment_details',this.payment_details);


console.log(!this.editCustomer_details.dirty ,!this.subscription_details.dirty,!this.editCustomer_meta.dirty);
if(!this.editCustomer_details.dirty && !this.subscription_details.dirty && !this.editCustomer_meta.dirty) {
  console.log(this.editCustomer_details.dirty);
  this.notification.ShowPreDefinedMessage('I', 'CMN-002');
}else{
console.log('customer_meta:',this.editCustomer_meta,'customer_detail',this.editCustomer_details,
'subscription_details:',this.SubscriptionList,"payment_details:",this.payment_details);

console.log('SubscriptionLength',this.SubscriptionList.length);

if(this.SMSFlag){
  this.editCustomer_meta.controls['subscribe_sms'].setValue('Y');
  }else{
    this.editCustomer_meta.controls['subscribe_sms'].setValue('N');
  }

  // if(this.editCustomer_details.value.status) {
  //   console.log('true');
  // this.editCustomer_details.value.active='Y';
  //   this.editCustomer_details.value.dmlType='U';
  // }
  // else if(!this.editCustomer_details.value.status) {
  //   console.log('false');
  //     this.editCustomer_details.value.active='N';
  //   this.editCustomer_details.value.dmlType='D';
  // }

  for(let index in this.SubscriptionList){

    if(this.SubscriptionList[index].service_status == 'ACTIVE'){
      this.CustomerActiveFlag=true;
    }

  }

  if(this.CustomerActiveFlag){
    this.editCustomer_details.value.active='Y';
    this.editCustomer_details.value.dmlType='U';
  }else{
    this.editCustomer_details.value.active='N';
    this.editCustomer_details.value.dmlType='U';
  }

// Assining values
  this.editCustomer_details.value.owner_id       = this._userProfileData.ownerDetails.owner_id;
  this.editCustomer_details.value.created_by     = this._userProfileData.userDetails.user_name;
  this.editCustomer_details.value.recordType     = 'E';
  this.editCustomer_details.value.modified_by_id = this._userProfileData.userDetails.user_id;
  this.editCustomer_details.value.modified_by    = this._userProfileData.userDetails.user_name;
  // Assining UserId values


  //     if(!this.editCustomer_details.dirty){
  //       this._service.warn('<strong>Warning<strong>',
  //       ' Please fill the required form fields.');
  //  }

    //  else 
     if (this.editCustomer_details.valid && this.SubscriptionList.length != 0 && !this.showNoCustomerId) {
    this.requestCustomerJson={'customer_meta':this.editCustomer_meta.value,'customer_details':this.editCustomer_details.value,
    'subscription_details':this.SubscriptionList,"payment_details":this.payment_details};
    console.log(this.editCustomer_details.value);


   
      console.log(this.SubscriptionList.length);
    console.log('Submitted Values: ', JSON.stringify(value));
   this.postRequestObject=this.callHttpGet.createGetRequestRecord(this.requestCustomerJson);
   
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

   this.callHttpPost.makeRequest_ManageCustomer(this.postRequestObject).subscribe(response => {
     this._userProfileData = response;
     // Log Response -  Later
  console.warn(
    '%c ___________________________ Manage Area Post Response ___________________________',
    'background: #4dd0e1;color: black; font-weight: bold;'
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
    
    } // Check reponse for success or failure - end
   });
    //  ~ End  --  post reqest call-------------------------------------------------------------------------
  
  } //  Check result of  confirmation button  - End ----------------------------------------------------------------------
  
  }); //  call sweet alert - End 
  } else {
    this.validateFields.validateAllFormFields(this.editCustomer_details);
    this.validateFields.validateAllFormFields(this.editCustomer_meta);


    if(this.showNoCustomerId){
      console.log('this.showNoCustomerId inside',this.showNoCustomerId);
      this.notification.ShowCustomMessage('w','Customer ID Already Exist');
    }else{
    this.notification.ShowPreDefinedMessage('w','CMN-001');
  }
    
  }

}
  }
  // -- onSubmit -------------------------- ~end ---------------
  

  
 // --  @details :  Class Functions for the Component #######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  //  Pagination functions for  the table
  //  Pagination() -- Start ------------------------------------------------------------------------------------

// Page Change Call
changePage(newPage: number) {
  console.log(newPage);
  this.selectedPage = newPage;
}

   // Change Number of Records Per Page.
   changePageSize(newSize: number) {
    this.productsPerPage = Number(newSize);
    this.changePage(1);
  }
// onSelect function call.
 onSelect(item: any) {
  this.selectedItem = item;
 console.log(this.selectedItem);
}
 // ~ End  -()Pagination------------------------------------------------------------------------------------------------

 // --  @details :  Setting SMS Flag Functions for the Component #######################################################
 /*@details -  setting an sms flag */
//  ~ Start  -------------------------------------------------------------------------------------------------
 setSmsStatus(){
  this.SMSFlag=!this.SMSFlag;
}
 // ~ End  -()setSmsStatus------------------------------------------------------------------------------------------------

// function to set status active or inactive 
setStatus() {
  console.log('-------------- Status Clicked --------------');
  this.isActive   = !this.isActive ;
  this.isInactive = !this.isInactive ;
console.log(this.editCustomer_details.value.status);
}
 // ~ End  -()setStatus------------------------------------------------------------------------------------------------

// --  @details :  getAreaList Functions for the Component #######################################################
 /*@details -  Retriving the list of Areas*/
//  ~ Start  -------------------------------------------------------------------------------------------------
getAreaList(){
  this.filteredAreas = this.area_name.valueChanges.pipe(
    startWith(''),
    map(
      areaValue =>
      areaValue ? this.filterAreas(areaValue) : this._areaList.slice()
    )
  );
}
// --  @details :  getAreaList Functions for the Component #######################################################
 /*@details -  Filtering the list of Areas*/
//  ~ Start  -------------------------------------------------------------------------------------------------
filterAreas(area_value: string) {
  console.log(
    '"%c filterCities ***** -------------------------------------------------------------------------- "',
    ' "background: #4caf50;font-weight: bold;color: white; "'
  );
  console.log(area_value.toLowerCase());

  return this._areaList.filter(
    area =>
    area.area_name.toLowerCase().indexOf(area_value.toLowerCase()) === 0
  );
}
 // -- filterAreas -------------------------- ~End ---------------

// --  @details :  getAreaList Functions for the Component #######################################################
 /*@details -  Filtering the list of Packs*/
//  ~ Start  -------------------------------------------------------------------------------------------------
filterPacks(packvalue: string) {
  console.log('packvalue');
  console.log(packvalue.toLowerCase());
  console.log(
    '"%c filterCities ***** -------------------------------------------------------------------------- "',
     ' "background: #4caf50;font-weight: bold;color: white; "'
  );
  console.log(packvalue.toLowerCase());

  return this._packList.filter(
    pack =>
      pack.pack_name.toLowerCase().indexOf(packvalue.toLowerCase()) === 0
  );
}
 // -- filterPacks -------------------------- ~End ---------------

 // -- resetsubscription -------------------------- ~Start ---------------
 /*
       @details -  Resetting the form group values to empty
      */
 resetsubscription() {
  console.log('Inside resetsubscription');
      this.LabelFlag= 'Add';
      this.base_price=0;
      this.total_tax=0;
      this.total_amount=0;
      this.count=0;
      this.subscription_details.reset();
      console.log(this.subscription_details.value);
      
      this.packname = '';
      this.subscriptionPackList=[];
      this.showADDNCHNLPackList=[];
      this.showBasePackList=[];
      this.hasPack=false;
      this.showAlertMessage=false;
      this.requirePack=false;
      this.tempSubscriptionPackList=[];
      this.subscription_details.controls['service_status'].setValue('ACTIVE');
      this.subscription_details.controls['stb_pack_name'].setValue('BSPK');
      this.subscription_details.controls['stb_activation_date'].setValue(this.currentDate);
      console.log(this.subscription_details.value);
      this.showNoRecordsPack=true;
      this.showVCNumberExist=false;
      this.showSTBNumberExist=false;
}
  // -- resetsubscription -------------------------- ~end ---------------
   // -- removePack -------------------------- ~start ---------------
/*
       @details -  removing base pack from subscription
*/
removePack(pack_id,index,pack_type){
  console.log(pack_id);
  this.base_price=0;
  this.total_tax=0;
  this.total_amount=0;
  this.index1=null;
  if(pack_type == "BSPK"){
        this.count=0;
        this.subscription_details.controls['subscription_name'].setValue(null);

  }
//  this.tempSubscriptionPackList.splice(this.index,1);
this.tempSubscriptionPackList=this.tempSubscriptionPackList.filter(obj => obj.pack_id !== pack_id);
        // this.subscriptionPackList.splice(this.index,1);
console.log('tempSubscription',this.tempSubscriptionPackList); 
console.log('Subscriptionpack',this.subscriptionPackList);

    // this.showBasePackList.splice(index,1);

    if(this.tempSubscriptionPackList.length==0){
      this.showNoRecordsPack=true;
    }

  for (let sub in  this.tempSubscriptionPackList) {

    if(true)
    {
    console.log('this.abc.packList[sub]');
    console.log(this.subscriptionPackList[sub]);
    // this.brand2=this.abc.areaList[sub].area_id ;

    this.base_price = this.base_price + this.tempSubscriptionPackList[sub].base_price;
    this.total_tax= this.total_tax + this.tempSubscriptionPackList[sub].total_tax;
    this.total_amount =  this.total_amount + this.tempSubscriptionPackList[sub].total_amount;

    }
 }
}
  // -- removePack -------------------------- ~end ---------------



// -- AddPack -------------------------- ~start ---------------
/*
       @details -  Adding packs to an array
*/
AddPack() {
  console.log(this.selectedPackName);
  this.hasPack=false;
  this.pack_obj_exist= null;
  this.showAlertMessage = false;
  this.requirePack=false;

  // checking if pack is already exist
    this.pack_obj_exist= this.tempSubscriptionPackList.find(
    obj=> obj.pack_name == this.selectedPackName
    );

  if(this.pack_obj_exist) {
    this.selectedPackName=' ';
    this.hasPack = true;
    return false;
  }

  for (let sub in this._packList) 
      {
                       if(this._packList[sub].pack_name == this.selectedPackName)
                       {
                        if(this._packList[sub].pack_type=='BSPK')
                        {
                              if(this.count>=1)
                              {
                                this.showAlertMessage = true;
                                this.selectedPackName=' ';
                                return false;
                                }else{  
                                    this.requirePack=false;
                                    this.subscription_details.controls['subscription_name'].setValue(this._packList[sub].pack_name);
                                    ++this.count;
                                    // this.subscriptionPackList.push(this._packList[sub]);
                                    this.tempSubscriptionPackList.push(this._packList[sub]);
                                    console.log('this.showBasePackList',this.tempSubscriptionPackList);
                                    this.showBasePackList.push(this._packList[sub]);
                                    this.showNoRecordsBasePackList=false;
                                    this.showNoRecordsPack=false;
                                    console.log(this.showBasePackList);
                                    this.base_price =this.base_price + this._packList[sub].base_price;
                                    this.total_tax=this.total_tax + this._packList[sub].total_tax;
                                    this.total_amount=this.total_amount + this._packList[sub].total_amount;
                                    console.log(this.base_price,this.total_tax,this.total_amount);
                                    this.selectedPackName=' ';
                                  
                                    console.log(this.packname);
                                  }

                                }else{
                                  // this.subscriptionPackList.push(this._packList[sub]);
                                  this.base_price =this.base_price + this._packList[sub].base_price;
                                  this.total_tax=this.total_tax + this._packList[sub].total_tax;
                                  this.total_amount=this.total_amount + this._packList[sub].total_amount;
                                  console.log(this.base_price,this.total_tax,this.total_amount);
                                  this.selectedPackName=' ';
                                  this.tempSubscriptionPackList.push(this._packList[sub]);
                                  // this.tempSubscriptionPackList=this.subscriptionPackList;
                                 console.log(this.packname);
                                 this.showNoRecordsPack=false;
                                }
               }
       }
}
  // -- AddPack -------------------------- ~end ---------------

  
    // -- AddSubscription -------------------------- ~start ---------------
     /*
       @details -  Inserting subscription details to an array
*/
    AddSubscription(){

      if(this.tempSubscriptionPackList.length<=0 || this.count==0){
        this.requirePack=true;
      }
      if(this.subscription_details.valid && !this.requirePack )
      {
            $('#modal-subscription').modal('close');
          this.subscriptionPackList=this.tempSubscriptionPackList;
          this.rownumber +=1;
          console.log(this.subscription_details.value);
          this.subscription_details.value.rownum=this.rownumber;
          this.subscription_details.value.base_price = this.base_price;
          this.subscription_details.value.total_tax = this.total_tax;
          this.subscription_details.value.total_amount = this.total_amount;
          this.subscription_details.value.pack_details = this.subscriptionPackList;
          if( this.subscription_details.value.record_type != 'E'){
            this.subscription_details.value.record_type = 'N';

          }

          this.SubscriptionList.push(this.subscription_details.value);
          console.log(this.SubscriptionList);
          if (this.SubscriptionList.length > 0) {
            this.showLoader = false;
            
            // console.log('Subscription List:',this._SubscriptionList);
  
            this.filteredData = this.SubscriptionList;
            this.filteredTotal = this.SubscriptionList.length;
            
            this.filter();
            
          } else {
            this.showLoader    = false;
            this.showNoRecords = true;
          }
          this.SummaryCalculation();
    }else{
      this.validateFields.validateAllFormFields( this.subscription_details);
      this.notification.ShowPreDefinedMessage('w', 'CMN-001');
     }
}
    // -- AddSubscription -------------------------- ~End ---------------

/// -- updateSubscription -------------------------- ~start ---------------
  /*
       @details -  setting the form group values before Edit Subscription 
  */
  updateSubscription(indexnum){

    this.subscriptionPackList=[];
    this.tempSubscriptionPackList=[];
    this.showADDNCHNLPackList=[];
    this.showBasePackList=[];
    this.LabelFlag= 'Edit';
    this.requirePack=false;
    this.subscription_details.reset();
   console.log(this.EditSubIndex);
    for (let sub in this.SubscriptionList) 
    { 
                     if(this.SubscriptionList[sub].rownum == indexnum.row.rownum)
                     {
                      console.log('inside fn',indexnum,this.SubscriptionList[sub].stb_number);
                      if(this.SubscriptionList[sub].record_type == 'E'){
                        this.subscription_details.controls['stb_id'].setValue(this.SubscriptionList[sub].stb_id);

                      }
                        this.index=sub;
                        console.log(this.SubscriptionList[sub]);

                        this.subscription_details.controls['stb_number'].setValue(this.SubscriptionList[sub].stb_number);
                        this.subscription_details.controls['stb_vc_number'].setValue(this.SubscriptionList[sub].stb_vc_number);
                        this.subscription_details.controls['stb_model_number'].setValue(this.SubscriptionList[sub].stb_model_number);
                        this.subscription_details.controls['stb_serial_number'].setValue(this.SubscriptionList[sub].stb_serial_number);
                      // this.oldstb_numberobj=this.SubscriptionList[sub].stb_number;
                      // this.oldvc_numberObj=this.SubscriptionList[sub].stb_vc_number;

                      //setting activation date 
                        if(this.SubscriptionList[sub].stb_activation_date  !=  null){
            
                          this.activationDateValue = new Date(this.SubscriptionList[sub].stb_activation_date);
                          console.log('this.SubscriptionList[sub].stb_activation_date',this.SubscriptionList[sub].stb_activation_date);
                          }else{
                            this.activationDateValue=this.currentDate;
                         }


                        
                     console.log('this.activationDateValue',this.activationDateValue);
                         this.subscription_details.controls['subscription_name'].setValue(this.SubscriptionList[sub].subscription_name);
                         this.subscription_details.controls['stb_activation_date'].setValue(this.activationDateValue);
                         this.subscription_details.controls['record_type'].setValue(this.SubscriptionList[sub].record_type);
                         this.subscription_details.controls['rownum'].setValue( this.SubscriptionList[sub].rownum);

                        this.subscription_details.controls['service_status'].setValue(this.SubscriptionList[sub].service_status);
                        this.base_price = this.SubscriptionList[sub].base_price;
                        this.total_tax = this.SubscriptionList[sub].total_tax;
                        this.total_amount = this.SubscriptionList[sub].total_amount;
                        this.subscriptionPackList = this.SubscriptionList[sub].pack_details;
                        this.tempSubscriptionPackList=this.subscriptionPackList;

                        console.log(this.subscription_details);
                        for (let sub in this.subscriptionPackList) 
                        {
                          if(this.subscriptionPackList[sub].pack_type=='BSPK')
                          { 
                            this.count=1;
                          }
                        }
                        if(this.subscriptionPackList.length ==0){
                          this.showNoRecordsPack=true;
                        } else{
                          this.showNoRecordsPack=false;
                        }
                     }

                }
                console.log('count Basepack',this.count);
                console.log('subscription_details',this.subscription_details.value);
   // Jquery initialization
    this.zone.run(() => {
      $(document).ready(function() {
        $('select').select();
        $('.datepicker').datepicker();
        M.updateTextFields();
      });
    });
  }
    // -- updateSubscription -------------------------- ~End ---------------


 // -- EditAddSubscription -------------------------- ~start ---------------
     /*
       @details -  Editing the subscription form group Values 
      */
  
    EditAddSubscription() {
      console.log('this.subscription_details',this.subscription_details);
    if(this.tempSubscriptionPackList.length<=0 || this.count==0)
    {
      this.requirePack=true;
    }

      // Setting Stb_modified value 
      if(this.subscription_details.controls['stb_vc_number'].dirty || this.subscription_details.controls['stb_model_number'].dirty ||
      this.subscription_details.controls['service_status'].dirty || this.subscription_details.controls['stb_serial_number'].dirty ||
      this.subscription_details.controls['stb_activation_date'].dirty || this.subscription_details.controls['stb_number'].dirty)
      {
        console.log('vc',this.subscription_details.controls['stb_vc_number'].dirty);
        this.subscription_details.controls['stb_modified'].setValue('Y');
      }else
      {
        this.subscription_details.controls['stb_modified'].setValue('N');
      }

    if(this.subscription_details.valid && !this.requirePack)
    {
      console.log(this.subscription_details);
    $('#modal-subscription').modal('close');
    this.subscriptionPackList=this.tempSubscriptionPackList;
    this.subscription_details.value.base_price = this.base_price;
    this.subscription_details.value.total_tax = this.total_tax;
    this.subscription_details.value.total_amount = this.total_amount;
    this.subscription_details.value.pack_details = this.subscriptionPackList;
    this.SubscriptionList.splice(this.index, 1 , this.subscription_details.value);

    // this.SubscriptionList.push(this.subscription_details.value);
    console.log('this.SubscriptionList');
    console.log(this.SubscriptionList);
    this.SummaryCalculation();

    if(this.subscription_details.value.service_status == 'ACTIVE' ){
      this.subscription_details.value.active= 'Y'
    }else{
      this.subscription_details.value.active= 'N'
    }

  }else{
    this.validateFields.validateAllFormFields( this.subscription_details);
    this.notification.ShowPreDefinedMessage('w', 'CMN-001');
    }
    this.filter();
  }
    // -- EditAddSubscription -------------------------- ~End ---------------

// --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  
  //To display subscription Summary variables we are assign and calculating the values 
  SummaryCalculation()
  {  
   //Initialize the default variables
    this.SummaryRentTotal=0;
    this.SummaryTaxTotal=0;
    this.SummaryBillTotal=0;
    this.SummaryActive=0;
    this.SummarySuspended=0;
    this.SummaryDisconnected=0;
    this.SummaryBoxTotal=0;
    this.SummeryFreeBox=0;


    this.SummaryRecentActive='';
    this.SummaryFirstActive='';

    var index;
    
      //Calculate the Subscription Summary variables
        for (let sub in this.SubscriptionList) 
        {
          if(this.SubscriptionList[sub].service_status == 'ACTIVE')//Calculate only service status is ACTIVE
          {
            
            this.SummaryRentTotal+=this.SubscriptionList[sub].base_price;
            this.SummaryTaxTotal+=this.SubscriptionList[sub].total_tax;
            this.SummaryBillTotal+=this.SubscriptionList[sub].total_amount;
           }
            this.SummaryBoxTotal +=1;
            if(this.SubscriptionList[sub].service_status == 'ACTIVE'){
              this.SummaryActive =  (this.SummaryActive*1) + 1;
             }else if(this.SubscriptionList[sub].service_status == 'SUSPENDED'){
              this.SummarySuspended =  (this.SummarySuspended*1) + 1;
             }else if(this.SubscriptionList[sub].service_status == 'DISCONNECTED'){
              this.SummaryDisconnected = (this.SummaryDisconnected*1) + 1;
             }else if(this.SubscriptionList[sub].service_status == 'FREEBOX'){
              this.SummeryFreeBox = (this.SummeryFreeBox*1) + 1;
             }
          
        }
       
 }
     //  ~ End  ----------------------------------------------------------------------------------------------------


 

  
  // --  @details :  Class Functions for the Component ###################################################
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
    let newData: any[] = this.SubscriptionList;
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

  showAlert(event: any): void {
    console.log('selected',event);
    console.log('selected',event.index);
    this.EditSubIndex=event.index;
    console.log('row',event.row);
    let row: any = event.row;
    console.log('row',event.row);
    // .. do something with event.row
  }

    //  ~ End_____________________________________________________________________________________________

// --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  receiveToggleSidebarObj($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this._opened = $event;

    // console.log("**** @@ Sidebar Open Object @@ ****");
    console.log(this._opened);

  }
  //  ~ End  ----------------------------------------------------------------------------------------------------
  
  cancelButtonLink(){
    this.router.navigate([this.source]);
  }

}
