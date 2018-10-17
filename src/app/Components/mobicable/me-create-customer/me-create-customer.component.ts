/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR CREATE Customer ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Render the area data in tabular format with ability to :-
|      ** Ability to Create New Customer
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 30-JAN-2018    v0.1     - Created the New Component.
|   ++ 07-MAR-2018    v0.21        - Altering subscrition model
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities

import { Component, OnInit, Inject , NgZone,ElementRef, ViewChild } from '@angular/core';
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
  MatAutocompleteModule,
  MatTooltipModule
} from "@angular/material";
import { startWith } from "rxjs/operators/startWith";
import { map } from "rxjs/operators/map";
import { Observable } from "rxjs/Observable";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import swal from "sweetalert2";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { MeValidateFormFieldsService } from "../../../Service/me-validate-form-fields.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';

import { MeAreaInterface } from "../../../Service/Interfaces/me-area-interface";
import { MePackInterface } from '../../../Service/Interfaces/me-pack-interface';
import { MeCallHttpPostService } from '../../../Service/me-call-http-post.service';
import { GetInputRecord } from '../../../Service/get-input-record';
import { MeToastNotificationService } from '../../../Service/me-toast-notification.service';
import { DEFAULT_TEMPLATE } from '../../common/me-pagination/template';
import { MeCustomerInterface } from '../../../Service/Interfaces/me-customer-interface';
import { MeGzipService } from '../../../Service/me-gzip.service';
const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);

declare var jQuery: any;
declare var $: any;
declare var M: any;
declare var instance: any;
declare var require: any;

//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start -----------------------------------------------

@Component({
  selector: 'app-me-create-customer',
  templateUrl: './me-create-customer.component.html',
  styleUrls: ['./me-create-customer.component.css']
})
export class MeCreateCustomerComponent implements OnInit  {

  @ViewChild("myElem") MyProp: ElementRef;

    // -- @details : Class variable declaration ###################################################################
  //  ~ Start  __________________________________________________________________________________________________

  // Class Form variables
  // All variables used in component template ( html file ) must be public
    // form variables

 // -- local private variables
 private _customersList   : MeCustomerInterface[] = [];
 private count:number=0;
 private _userProfileData         : any;
 private _userLogin               : any;
 private _packList                : MePackInterface[] = [];
 private _ResponsepackList         : any[]             = [];
 private _areaList                : any               = [];
 private payment_obj_exist        : any     = '';
 
 // class variables
 private area_obj         : any = "";
 private index            : any;
 private index1           : any;
 private postRequestObject: any = "";
 private temp             : any;
 private pack_obj_exist   : any = "";
 private Addcharges_obj_exist:any = "";

 private postRequestCustomerIDObject: any =
 {
   records: [{
       owner_id: null,
       area_id: null,
   }]
 };

 private getRequestInputObj : any = {
  user_id : null,
  owner_id: null
 };

 private getRequestOwnerInputObj : any = {
  owner_id: null
 };

 getRequestOwnerInput            :any;

 private 
  // -- local  variables
    payment_details          : any[]             = [];
    getRequestInput          : any               = "";
    showPackList             : any[]             = [];
    selectedPackName         : any;
    showNoCustomerIdList     : boolean           = true;
    showNoCustomerId         : boolean           = false;
    showNoRecordsSubscription: boolean           = true;
    showNoRecordsPayments    : boolean           = true;
    showNoRecordsPack        : boolean           = true;
    base_price               : number            = 0;
    total_tax                : number            = 0;
    total_amount             : number            = 0;
    hasPack                  : boolean           = false;
    showAlertMessage         : boolean           = false;
    requirePack              : boolean           = false;
    showNoRecordsBasePackList: boolean           = false;
    showNoRecordsADDONList   : boolean           = false;
    SMSFlag                  : boolean           = true;
    hasPayment               : boolean           = false;
    LabelPaymentType         : any;
    CustomerIdList           : any;
    customerId_obj           : any;

    // pagination variables
    productsPerPage  = 5;
    selectedPage     = 1;

    //filter           : any;
    currentpage      : any;
    productsPerPage1 = 5;
    selectedPage1    = 1;
    filter1          : any;
    currentpage1     : any;
    LabelFlag        : string;
    rownumber          :number=0;
    PaymentAddCharges  :boolean=false;

    //Subscription Summary Variables
      summeryRentTotal :number=0.0;
      summeryTaxTotal :number=0.0;
      summeryBillTotal :number=0.0;
      summeryRecentActive :any;
      summeryFirstActive :any;
      summeryActive :number=0;
      summerySuspended :number=0;
      summeryDisconnected :number=0;
      summeryBoxTotal :number=0;
      summeryFreeBox  :number=0;
    // sorting
    // sorting variables
    key    : string  = 'customer_number'; // set default
    reverse: boolean = false;

    // Autocomplete variables
    selectedItem: any = '';
    inputChanged: any = '';
    packname    : string;
    default    : string;

  
    
   // -- Create Form Group
   customer_details    : FormGroup;
   customer_meta       : FormGroup;
   subscription_details: FormGroup;
   paymentDetails      : FormGroup;
 

// --  Customer Deta Fields
  customer_id: AbstractControl;
  first_name : AbstractControl;
  last_name  : AbstractControl;
  phone      : AbstractControl;
  email      : AbstractControl;
  alias_name : AbstractControl;
  address1   : AbstractControl;
  area_name  : AbstractControl;
  area_id    : AbstractControl;
  city       : AbstractControl;
  state      : AbstractControl;
  pincode    : AbstractControl;
  remarks    : AbstractControl;
  door_number: AbstractControl;

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
  stbVCNumberList     : any[] = [];
  tempSubscriptionPackList: any[] =[];

  stb_number          : AbstractControl;
  stb_vc_number       : AbstractControl;
  stb_model_number    : AbstractControl;
  service_status      : AbstractControl;
  stb_serial_number   : AbstractControl;
  subscription_name   : AbstractControl;
  stb_activation_date : AbstractControl;
  stb_pack_name       : AbstractControl;
  rownum              : AbstractControl;
// --  Customer Payments Fields

  payment_type   : AbstractControl;
  payment_amount : AbstractControl;
  payment_remarks: AbstractControl;
  payment_user_id: AbstractControl;

  //Date Variables
  currentDate          : Date;
  minDate              : Date;
  maxDate              : Date;
  threeMonths          : Date;

//   payment_owner_id: AbstractControl;

  filteredPacks: Observable<any[]>;
  filteredAreas: Observable<any[]>;



 //Loader Variables
  showLoader   : boolean = true;
  showNoRecords: boolean = true;
  IsformValid: any;
  // Tera DataTable Local Fields
 filteredData: any[] = [];
 filteredTotal: number = 0;

 searchTerm: string = '';
 fromRow: number = 1;
 currentPage: number = 1;
 pageSize: number = 50;
 sortBy: string = 'subscription_name';
 selectedRows: any[] = [];
 sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

 showVCNumberExist:boolean=false;
 showSTBNumberExist:boolean=false;
 vc_numberObj:any;
stb_numberobj:any;
 // Tera DataTable Set Column name/Label and other features.
  // Tera DataTable Set Column name/Label and other features.
  columns: ITdDataTableColumn[] = [
    { name: 'subscription_name', label: 'Subscription Name', filter: true, sortable: true,width:220},
    { name: 'stb_number', label: 'STB#', filter: true, sortable: true,width:220},
     { name: 'stb_vc_number', label: 'VC#', filter: true, sortable: true,width:220},
     { name: 'service_status', label: 'Status', sortable: true,width:150 },
     { name: 'base_price', label: 'Rent',numeric: true, format: DECIMAL_FORMAT, sortable: true, filter: true,width:90},
     { name: 'total_tax', label: 'Tax',numeric: true, format: DECIMAL_FORMAT, sortable: true, filter: true,width:90},
     { name: 'total_amount', label: 'Total',numeric: true, format: DECIMAL_FORMAT, sortable: true, filter: true,width:90},
     { name: 'rownum', label: 'Action', sortable: false, width:120 }
     ];  
  
 
  // function to open left side navgivation bar
  _opened: boolean = false;


  private addChargesPostRequestObject: any = {
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



  //  ~ End  ----------------------------------------------------------------------------------------------------

  // --  @details :  constructor #################################################################################
  //  ~ Start -constructor ---------------------------------------------------------------------------------------------------
  constructor(
    fb: FormBuilder,
    public callHttpGet                : MeCallHttpGetService,
    public callHttpPost               : MeCallHttpPostService,
    // public getRequestInput:GetInputRecord,
    public userProfileService         : MeUserProfileService,
    private CustomerPersistenceService: PersistenceService,
    private validateFields            : MeValidateFormFieldsService,
    public snackBar                   : MatSnackBar,
    private zone                      : NgZone,
    private dialog                    : MatDialog,
    private router                    : Router,
    private _dataTableService         : TdDataTableService,
    public notification               : MeToastNotificationService,
    private gzipService               : MeGzipService,


  ) {
     /*
       @details -  Intialize the form group with fields
          ++ The fields are set to default values - in below case to - null.
          ++ The fields are assigned validators
              ** Required Validator
      */

//insitializing date variables
this.currentDate = new Date();
this.threeMonths   = new Date();
this.threeMonths.setFullYear(this.threeMonths.getFullYear() - 50);
this.minDate     = this.threeMonths;
this.maxDate     = this.currentDate;

      this.customer_details = fb.group({
        customer_id: [null, Validators.required],
        first_name : [null, Validators.required],
        last_name  : [''],
        phone      : ['',Validators.minLength(10)],
        email      : [''],
        alias_name : [''],
        address1   : [''],
        area_name  : [null, Validators.required],
        area_id    : [null],
        city       : [null, Validators.required],
        state      : [null, Validators.required],
        pincode    : [null, Validators.required],
        remarks    : [''],
        door_number: [''],

      });

         this.customer_meta = fb.group({
          agreement_number : [''],
          customer_category: ['R'],
          activation_date  : [''],
           reminder_date   : [''],
          GSTIN            : [''],
          subscribe_sms    : ['Y'],
        }),

        this.subscription_details= fb.group({
          stb_number       : [null],
          stb_vc_number    : [null, Validators.required],
          stb_model_number : [''],
          service_status   : ['ACTIVE', Validators.required],
          stb_serial_number: [''],
          subscription_name: [''],
          stb_activation_date:[this.currentDate],
          stb_pack_name   :[''],
          rownum          : ['']
        }),

      
      this.paymentDetails = fb.group({
        payment_type   : ['ADDCHRG', Validators.required],
          payment_amount : ['', Validators.required],
          payment_remarks: [''],
          payment_user_id: [''],
        }),
    
    // Assign form controls to public variables
    // Controls are used in me-create-Customer.component.html for accessing values and checking functionalities
      this.customer_id = this.customer_details.controls['customer_id'];
      this.first_name  = this.customer_details.controls['first_name'];
      this.last_name   = this.customer_details.controls['last_name'];
      this.phone       = this.customer_details.controls['phone'];
      this.email       = this.customer_details.controls['email'];
      this.alias_name  = this.customer_details.controls['alias_name'];
      this.address1    = this.customer_details.controls['address1'];
      this.area_id     = this.customer_details.controls['area_id'];
      this.area_name   = this.customer_details.controls['area_name'];
      this.city        = this.customer_details.controls['city'];
      this.state       = this.customer_details.controls['state'];
      this.pincode     = this.customer_details.controls['pincode'];
      this.remarks     = this.customer_details.controls['remarks'];
      this.door_number = this.customer_details.controls['door_number'];


    // Customer Meta values
      this.agreement_number  = this.customer_meta.controls['agreement_number'];
      this.customer_category = this.customer_meta.controls['customer_category'];
      this.activation_date   = this.customer_meta.controls['activation_date'];
      this.reminder_date     = this.customer_meta.controls['reminder_date'];
      this.GSTIN             = this.customer_meta.controls['GSTIN'];
      this.subscribe_sms     = this.customer_meta.controls['subscribe_sms'];

     // Subscription values
      this.stb_number          = this.subscription_details.controls['stb_number'];
      this.stb_vc_number       = this.subscription_details.controls['stb_vc_number'];
      this.stb_model_number    = this.subscription_details.controls['stb_model_number'];
      this.service_status      = this.subscription_details.controls['service_status'];
      this.stb_serial_number   = this.subscription_details.controls['stb_serial_number'];
      this.subscription_name   = this.subscription_details.controls['subscription_name'];
      this.stb_activation_date = this.subscription_details.controls['stb_activation_date'];
      this.stb_pack_name       = this.subscription_details.controls['stb_pack_name'];
      this.rownum              = this.subscription_details.controls['rownum'];                     
  
      // Payment values
      this.payment_type=this.paymentDetails.controls['payment_type'];
      this.payment_amount=this.paymentDetails.controls['payment_amount'];
      this.payment_remarks=this.paymentDetails.controls['payment_remarks'];
      this.payment_user_id=this.paymentDetails.controls['payment_user_id'];

  //subscribe for stb pack name value channge
    this.stb_pack_name.valueChanges.subscribe(
      (value: string) => {
        this.selectedPackName='';
      }  );

      // -- area_name  Value Change  -------------------------- ~Start ---------------

     //  get the Area object based on city selection/input
   // use the area object to populate state,city and pincode
    this.area_name.valueChanges.subscribe((value: string) => {
      console.log(
        "%c ------------------  Event Change City ------------------",
        "background: green; color: white; display: block;"
      );
      console.warn("*** Values before Calculation *** ");
      console.log("City Value:", value);
      console.log("City Records:", this._areaList);
      this.area_obj = this._areaList.find(obj => obj.area_name === value);
      console.log(this.area_obj);

      if (this.area_obj) {
        this.postRequestCustomerIDObject.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
        this.postRequestCustomerIDObject.records[0].area_id  = this.area_obj.area_id;

          //  ~ Start -retrieving CustomerMeta List  --------------------------------------------------------------------------
          this.callHttpGet.makeRequest_GetCustomerId(this.postRequestCustomerIDObject)
          .subscribe(response => {
            this.CustomerIdList=response.customerId;
            if(this.CustomerIdList.length != 0){
              this.showNoCustomerIdList=false;
            }
            console.log('this.CustomerIdList',this.CustomerIdList);
          });
        // Set the values to hiddenn fields
        this.customer_details.controls["area_id"].setValue(this.area_obj.area_id);
        this.customer_details.controls["city"].setValue(this.area_obj.city);
        this.customer_details.controls["state"].setValue(this.area_obj.state);
        this.customer_details.controls["pincode"].setValue(this.area_obj.pincode);
        $(document).ready(function() {
          M.updateTextFields();
        });
      } else {
        this.customer_details.controls["area_id"].setValue(null);
        this.customer_details.controls["city"].markAsTouched({ onlySelf: true });
        this.customer_details.controls["state"].markAsTouched({ onlySelf: true });
        this.customer_details.controls["pincode"].markAsTouched({ onlySelf: true });
      
      }
    //  this.customer_details.controls['customer_id'].setValue(value.slice(0, 3));

    });
      // -- area_name  Value Change  -------------------------- ~Start ---------------

       //  get the payment_type List
      // use the payment_type object to check Add Charges or not
      this.payment_type.valueChanges.subscribe((value: string)=>{
        if(value == 'ADDCHRG'){
          this.PaymentAddCharges=true;
        }else{
          this.PaymentAddCharges=false;
        }
      })
          // -- payment_type  Value Change  -------------------------- ~Start ---------------


       //  get the Pack List
      // use the area object to populate state,city and pincode
      this.stb_pack_name.valueChanges.subscribe((value: string) => {
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
       console.log(this.showPackList);

    });

    // -- Customer Id Value Change  -------------------------- ~Start ---------------

    this.customer_id.valueChanges.subscribe((value: string) => {
      console.log('customer_id',this.showNoCustomerId);
      console.log('customer_id',this._customersList);
      this.customerId_obj=this._customersList.find(
        obj => obj.customer_id === value
      );

      if(this.customerId_obj ){
        this.showNoCustomerId=true;
        console.log('same',this.showNoCustomerId);
      }else{
        this.showNoCustomerId=false;
      }

    } );
  // --  Customer Id Value Change -------------------------- ~end ---------------

      // -- STB VCNumber Value Change  -------------------------- ~Start ---------------
    this.stb_vc_number.valueChanges.subscribe((value: string) =>{
      this.vc_numberObj =this.stbVCNumberList.find(
        obj => obj.stb_vc_number === value
      );

      if( this.vc_numberObj){
        this.showVCNumberExist =true;
      }else{
        this.showVCNumberExist =false;
      }
    })


      // -- STB VCNumber Value Change  -------------------------- ~Start ---------------

            // -- STB VCNumber Value Change  -------------------------- ~Start ---------------
    this.stb_number.valueChanges.subscribe((value: string) =>{
      this.stb_numberobj =this.stbVCNumberList.find(
        obj => obj.stb_number === value
      );

      if( this.stb_numberobj){
        this.showSTBNumberExist =true;
      }else{
        this.showSTBNumberExist =false;
      }
    })


      // -- STB VCNumber Value Change  -------------------------- ~Start ---------------

   }
   // -- constructor -------------------------- ~end ---------------

//  ~ Start -ngOnInit  ---------------------------------------------------------------------------------------
ngOnInit() {
  // initialize and execute jquery document ready
  this.zone.run(() => {
  $(document).ready(function() {
    M.updateTextFields();
    $('select').select();
    $('.modal').modal({
      dismissible: false,
    });
  $('.datepicker').datepicker();
});
});

// this.MyProp.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });


// Fetch the User Login Details Stored in the Cache
this._userLogin = this.CustomerPersistenceService.get(
"userLogin",
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

this.getRequestOwnerInputObj.owner_id =this._userProfileData.ownerDetails.owner_id;


 // get the Input JSON format for making http request.
 this.getRequestOwnerInput = this.callHttpGet.createGetRequestRecord(
  this.getRequestOwnerInputObj
);

  //  ~ Start -retrieving Area List  ------------------------------------------------------------------------------------------
  this.callHttpGet
  .makeRequest_ManageCustomer(this.getRequestInput)
  .subscribe(response => {

     // UnZipping and uncompress for retrieving  List
     this.gzipService.makeRequest_uncompress(response).then(function(result) {
        
    this._customersList = result.customersList;
  }.bind(this)) 

  });
  // ~ End -retrieving Customer List---------------------------------------------

// make call to get Pack details
  //  ~ Start  -------------------------------------------------------------------------------------------------
  this.callHttpGet.makeRequest_ManagePack(this.getRequestInput).subscribe(response => {
    
    
  // UnZipping and uncompress for retrieving  List
  this.gzipService.makeRequest_uncompress(response).then(function(result) {
 
    console.log(
      "%c Pack List ***** -------------------------------------------------------------------------- ",
      "background: #ff5722;font-weight: bold;color: white; "
    );

    this._ResponsepackList = result.packList;

    for (let sub in this._ResponsepackList) 
    {
                     if(this._ResponsepackList[sub].active == 'Y')
                     {
                        
                        this._packList.push(this._ResponsepackList[sub]);
                     }
     }
    }.bind(this)) 

  });
  // ~ End  -------------------------------------------------------------------------------------------------

  // make call to get Pack details
  //  ~ Start  -------------------------------------------------------------------------------------------------
  this.callHttpGet.makeRequest_GetArea(this.getRequestInput).subscribe(response => {
   
   // UnZipping and uncompress for retrieving  List
   this.gzipService.makeRequest_uncompress(response).then(function(result) {
 

    console.log(
      "%c City List ***** -------------------------------------------------------------------------- ",
      "background: #ff5722;font-weight: bold;color: white; "
    );

    this._areaList = result.areaList;
  }.bind(this)) 
  console.log('this._areaList',this._areaList);

  });
  // ~ End  -------------------------------------------------------------------------------------------------

  // make call to get VC number details
  //  ~ Start  -------------------------------------------------------------------------------------------------
  
this.callHttpGet.makeRequest_getStbVcNumberList(this.getRequestOwnerInput).subscribe(response =>{
  console.log('response getStbVcNumberList',response);
  this.stbVCNumberList=response.StbVcDetails;
  console.log('response getStbVcNumberList',this.stbVCNumberList);
})

  // ~ End  -------------------------------------------------------------------------------------------------


});
    //  ~ End  -------------------------------------------------------------------------------------------------

}
// -- onNgInit -------------------------- ~end ---------------

// -- onSubmit -------------------------- ~start ---------------
onSubmit(value: string): void {

  /* @details - Check for fields validity
     ++ Check the editArea validity
       ** If the form state is invalid call validateAllFormFields service
       ** If the form state is valid call http service
  */


// Assining values
console.log('this.payment_details',this.payment_details);



console.log('this.Addcharges_obj_exist',this.Addcharges_obj_exist);

//initializing customer details values
// if(this.SMSFlag){
// this.customer_meta.controls['subscribe_sms'].setValue('Y');
// }else{
//   this.customer_meta.controls['subscribe_sms'].setValue('N');
// }

//initializing customer details values
  this.customer_details.value.active        = "Y";
  this.customer_details.value.dmlType       = "I";
  this.customer_details.value.owner_id      = this._userProfileData.ownerDetails.owner_id;
  this.customer_details.value.created_by    = this._userProfileData.userDetails.user_name;
  this.customer_details.value.created_by_id = this._userProfileData.userDetails.user_id;

  this.customer_details.value.recordType = "N";
 
  // this.instalFeeDetails.controls['payment_user_id'].setValue(this._userProfileData.userDetails.user_id);
  // this.openBalDetils.controls['payment_user_id'].setValue(this._userProfileData.userDetails.user_id);
  // this.STBFEEDetails.controls['payment_user_id'].setValue(this._userProfileData.userDetails.user_id);
  // this.payment_details.push(this.instalFeeDetails.value);
  // this.payment_details.push(this.openBalDetils.value);
  // this.payment_details.push(this.STBFEEDetails.value);
      
  if (this.customer_details.valid && this.customer_meta.valid && this.SubscriptionList.length != 0 ) {


 

 
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
  swal.showLoading();
  }
  });
  
  
  
    // checking if payments is empty assign default on opening balance
  if(this.payment_details.length == 0){

    this.paymentDetails.controls['payment_type'].setValue('ADDCHRG');
    this.paymentDetails.controls['payment_amount'].setValue(0.0);
    this.paymentDetails.controls['payment_remarks'].setValue('Arrears');
    this.paymentDetails.controls['payment_user_id'].setValue(this._userProfileData.userDetails.user_id);
    this.payment_details.push(this.paymentDetails.value);
  }

 
  console.log("Submitted Values: ", this.SubscriptionList.length);

    // Constructing PostRequest Json and storing in temp
   this.temp={"customer_meta":this.customer_meta.value,"customer_details":this.customer_details.value,
   "subscription_details":this.SubscriptionList,"payment_details":this.payment_details};
 
     // Adding requested Json to records array using service
   this.postRequestObject=this.callHttpGet.createGetRequestRecord(this.temp);
  console.log(this.postRequestObject);


  // make post reqest call to send area form data to DB
  //  ~ Start  --  post reqest call-------------------------------------------------------------------------
  this.callHttpPost
  .makeRequest_ManageCustomer(this.postRequestObject)
  .subscribe(response => {
  // Log Response - Remove Later

  this.Addcharges_obj_exist = this.payment_details.find(
    obj => obj.payment_type === 'ADDCHRG'
  );

if(response.p_out_mssg_flg = 'S'){
 if(this.Addcharges_obj_exist)
  {
    this.addChargesPostRequestObject.records[0].customer_details.customer_number  = response.L_LAST_CUST_ID;
      this.addChargesPostRequestObject.records[0].customer_details.customer_id     = this.customer_details.value.customer_id;
      this.addChargesPostRequestObject.records[0].customer_details.user_id         = this._userProfileData.userDetails.user_id;
      this.addChargesPostRequestObject.records[0].customer_details.user_name       = this._userProfileData.userDetails.user_name;
      this.addChargesPostRequestObject.records[0].customer_details.owner_id        = this._userProfileData.ownerDetails.owner_id;
      this.addChargesPostRequestObject.records[0].customer_details.comments        = 
        this._userProfileData.userDetails.user_name + " added charges Rs.  " +
        this.Addcharges_obj_exist.payment_amount + " on " + this.currentDate;

      this.addChargesPostRequestObject.records[0].payment_details.payment_amount   = this.Addcharges_obj_exist.payment_amount;
      this.addChargesPostRequestObject.records[0].payment_details.payment_remarks  = this.Addcharges_obj_exist.payment_remarks;
      this.addChargesPostRequestObject.records[0].payment_details.payment_type     = 'Arrears';
      this.addChargesPostRequestObject.records[0].payment_details.payment_action   = "ADDCHRG";
      this.addChargesPostRequestObject.records[0].payment_details.payment_mode     = "NONE";
      this.addChargesPostRequestObject.records[0].payment_details.created_by       = this._userProfileData.userDetails.user_name;
      this.addChargesPostRequestObject.records[0].payment_details.created_by_id    = this._userProfileData.userDetails.user_id;

      // this.addChargesPostRequestObject.records[0].bill_details.bill_id             = null;

      this.callHttpPost.makeRequest_ManagePayments(this.addChargesPostRequestObject).subscribe(response=>{
        console.log('makeRequest_ManagePayments',response);
      })


  }

}

  console.warn(
  "%c ___________________________ Manage Area Post Response ___________________________",
  "background: #4dd0e1;color: black; font-weight: bold;"
  );
  // swal.close();
  
  // Check reponse for success or failure - start
  if(response.p_out_mssg_flg = 'S') {
  
  // swal ~ start -----
  swal({
  type             : 'success',
  title            : 'Your work has been saved',
  text             : 'Click OK to proceed...',
  allowOutsideClick: false,
  allowEscapeKey   : false,
  allowEnterKey    : false,
  showConfirmButton: true
  
  }).then((result) => {
  
  if(result.value) {
  this.router.navigateByUrl('/customerreport');
  
  }

  }) // swal ~ end -----
  
  }else if(response.p_out_mssg_flg = 'E') {
  
  // swal ~ start -----
  swal({
  type             : 'error',
  title            : 'Failed to process your work',
  text             : 'Click OK to proceed...',
  allowOutsideClick: false,
  allowEscapeKey   : false,
  allowEnterKey    : false,
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
      this.validateFields.validateAllFormFields(this.customer_details);
      this.validateFields.validateAllFormFields(this.customer_meta);

      if(this.showNoCustomerId){
        console.log('this.showNoCustomerId inside',this.showNoCustomerId);
        this.notification.ShowCustomMessage('w','Customer ID Already Exist');
      } else if(!this.customer_details.valid){
        console.log('inside console',!this.customer_details.valid);
        this.notification.ShowPreDefinedMessage('w', 'CMN-001');
      }else
      if(this.SubscriptionList.length==0)
      {
        this.notification.ShowCustomMessage('w','Add Atleast One Set-top Box');
     }
   
   
     }

  }

  // -- onSubmit -------------------------- ~end ---------------


 // --  @details :  Setting SMS Flag Functions for the Component #######################################################
 /*@details -  setting an sms flag */
//  ~ Start  -------------------------------------------------------------------------------------------------
setSmsStatus(){
  this.SMSFlag=!this.SMSFlag;
}
 // ~ End  -()setSmsStatus------------------------------------------------------------------------------------------------

// --  @details :  getAreaList Functions for the Component #######################################################
 /*@details -  Retriving the list of Areas*/
//  ~ Start  -------------------------------------------------------------------------------------------------
  getAreaList(){
    this.filteredAreas = this.area_name.valueChanges.pipe(
      startWith(""),
      map(
        areaValue =>
        areaValue ? this.filterAreas(areaValue) : this._areaList.slice()
      )
    );
  }
   // ~ End  -()getAreaList------------------------------------------------------------------------------------------------

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
     // ~ End  -()filterAreas------------------------------------------------------------------------------------------------

//  ~ Start  -------------------------------------------------------------------------------------------------

 //Function to use mat-Autocomplete
   getPackList() {
     /* @details - Check for fields validity
        ++ Check the createArea validity
          ** If the form state is invalid call validateAllFormFields service
          ** If the form state is valid call http service
   */
    // this.filteredPacks = this.pack_name.valueChanges.pipe(
    //   startWith(""),
    //   map(
    //     packvalue =>
    //     packvalue ? this.filterPacks(packvalue) : this._packList.slice()
    //   )
    // );

    console.warn('----------------- filteredCities ----------------- ');
    console.warn(this.filteredPacks);
  }
// --  @details :  getAreaList Functions for the Component #######################################################
 /*@details -  Filtering the list of Packs*/
//  ~ Start  -------------------------------------------------------------------------------------------------
  filterPacks(packvalue: string) {
    console.log('packvalue');
    console.log(packvalue.toLowerCase());
    console.log(
      '"%c filterPack ***** -------------------------------------------------------------------------- "',
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
      this.count=0;
      this.base_price=0;
      this.total_tax=0;
      this.total_amount=0;
      this.subscription_details.reset();
      this.packname = '';
      this.LabelFlag= 'Add';
      this.currentDate=new Date();
      this.subscription_details.controls['service_status'].setValue('ACTIVE');
      this.subscription_details.controls['stb_pack_name'].setValue('BSPK');
      this.subscription_details.controls['stb_activation_date'].setValue(this.currentDate);
      this.subscriptionPackList=[];
      this.tempSubscriptionPackList=[];
      this.showADDNCHNLPackList=[];
      this.showBasePackList=[];
      this.hasPack=false;
      this.showAlertMessage=false;
      this.requirePack=false;
      this.showNoRecordsPack=true;
    console.log(this.subscription_details.value);
      this.showNoRecordsPack=true;

      this.showVCNumberExist=false;
      this.showSTBNumberExist=false;

       // Jquery initialization
    this.zone.run(() => {
      $(document).ready(function() {
        $('select').select();
        M.updateTextFields();
      });
    });

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
    console.log(this.tempSubscriptionPackList[sub]);
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
  AddSubscription(value: string){
console.log("subscription",value);
   // checking if basePack is there in array or not
      if(this.tempSubscriptionPackList.length<=0 || this.count==0){
        this.requirePack=true;
      }
    
      if(this.subscription_details.valid && !this.requirePack)
      {
          $('#modal-subscription').modal('close');
          this.rownumber +=1;
          console.log(this.subscription_details.valid);
          if(this.subscription_details.valid)
          {
            
          this.subscriptionPackList=this.tempSubscriptionPackList;
          this.subscription_details.value.rownum = this.rownumber;
          this.subscription_details.value.base_price = this.base_price;
          this.subscription_details.value.total_tax = this.total_tax;
          this.subscription_details.value.total_amount = this.total_amount;
          this.subscription_details.value.pack_details = this.subscriptionPackList;
          this.SubscriptionList.push(this.subscription_details.value);
              console.log(this.SubscriptionList);
              if (this.SubscriptionList.length > 0) {
                this.showLoader = false;
                
                // console.log('Subscription List:',this._SubscriptionList);
      
                this.filteredData = this.SubscriptionList;
                this.filteredTotal = this.SubscriptionList.length;
                
                this.filter();
                this.showNoRecords = false;
              } else {
                this.showLoader    = false;
              
              }
              this.SummeryCalculation();
           }
   }else{
    this.validateFields.validateAllFormFields( this.subscription_details);
    this.notification.ShowPreDefinedMessage('w', 'CMN-001');
   }
}
  // -- AddSubscription -------------------------- ~End ---------------

   // -- updateSubscription -------------------------- ~start ---------------
     /*
       @details -  setting the form group values before Edit Subscription 
      */
  updateSubscription(indexnum){
    // updating the form variables
    console.log('outside loop',indexnum);
    console.log('outside loop',indexnum.row.rownum);
    this.subscriptionPackList=[];
    this.tempSubscriptionPackList=[];
    this.showADDNCHNLPackList=[];
    this.showBasePackList=[];
    this.LabelFlag= 'Edit';
    this.selectedPackName=' ';
    this.showNoRecordsADDONList=false;
    this.showNoRecordsBasePackList=false;
    this.subscription_details.reset();
    
    for (let sub in this.SubscriptionList) 
    {
  
      if(this.SubscriptionList[sub].rownum == indexnum.row.rownum)
      {
                        this.index=sub;
                        console.log(this.SubscriptionList[sub]);
                        this.subscription_details.controls['stb_number'].setValue(this.SubscriptionList[sub].stb_number);
                        this.subscription_details.controls['stb_vc_number'].setValue(this.SubscriptionList[sub].stb_vc_number);
                        this.subscription_details.controls['stb_model_number'].setValue(this.SubscriptionList[sub].stb_model_number);
                        this.subscription_details.controls['stb_serial_number'].setValue(this.SubscriptionList[sub].stb_serial_number);
                        this.subscription_details.controls['subscription_name'].setValue(this.SubscriptionList[sub].subscription_name);
                        this.subscription_details.controls['stb_activation_date'].setValue( this.SubscriptionList[sub].stb_activation_date);
                        this.subscription_details.controls['rownum'].setValue( this.SubscriptionList[sub].rownum);

                        this.subscription_details.controls['service_status'].setValue(this.SubscriptionList[sub].service_status);
                        this.base_price = this.SubscriptionList[sub].base_price;
                        this.total_tax = this.SubscriptionList[sub].total_tax;
                        this.total_amount = this.SubscriptionList[sub].total_amount;
                        this.subscriptionPackList = this.SubscriptionList[sub].pack_details;
                        this.tempSubscriptionPackList=this.subscriptionPackList;

                        if(this.tempSubscriptionPackList.length ==0){
                          this.showNoRecordsPack=true;
                        }
                     }
    }
    console.log('subscription_details',this.subscription_details);
   // Jquery initialization
    this.zone.run(() => {
      $(document).ready(function() {
        $('select').select();
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
    if(this.tempSubscriptionPackList.length<=0 || this.count==0){
      this.requirePack=true;
    }
    if(this.subscription_details.valid && !this.requirePack )
    {
        $('#modal-subscription').modal('close');
        this.subscriptionPackList=this.tempSubscriptionPackList;
    this.subscription_details.value.base_price   = this.base_price;
    this.subscription_details.value.total_tax    = this.total_tax;
    this.subscription_details.value.total_amount = this.total_amount;
    this.subscription_details.value.pack_details = this.subscriptionPackList;
    this.SubscriptionList.splice(this.index, 1 , this.subscription_details.value);
    // this.SubscriptionList.push(this.subscription_details.value);
    console.log('this.SubscriptionList');
    console.log(this.SubscriptionList);
    this.SummeryCalculation();
  }else{
    this.validateFields.validateAllFormFields( this.subscription_details);
    this.notification.ShowPreDefinedMessage('w', 'CMN-001');
   }
   this.filter();//Alter the tables Values of Subscription List 
  }
    // -- EditAddSubscription -------------------------- ~End ---------------

// --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  
  //To display subscription Summary variables we are assign and calculating the values 
  SummeryCalculation()
    {  
      //Initialize the default variables
      this.summeryRentTotal=0;
      this.summeryTaxTotal=0;
      this.summeryBillTotal=0;
      this.summeryActive=0;
      this.summeryFreeBox=0;
      this.summerySuspended=0;
      this.summeryDisconnected=0;
      this.summeryBoxTotal=0;
      this.summeryRecentActive='';
      this.summeryFirstActive='';

      var index;

      //Calculate the Subscription Summary variables
          for (let sub in this.SubscriptionList) 
          {
            if(this.SubscriptionList[sub].service_status == 'ACTIVE' )   //Calculate only service status is ACTIVE
            {
              index=sub;
              if(index == 0){
                console.log(index);
                this.summeryFirstActive= this.SubscriptionList[sub].stb_activation_date;
              } if(index == this.SubscriptionList.length-1){
                console.log(index);
                this.summeryRecentActive= this.SubscriptionList[sub].stb_activation_date;
              }

              this.summeryRentTotal+=this.SubscriptionList[sub].base_price;
              this.summeryTaxTotal+=this.SubscriptionList[sub].total_tax;
              this.summeryBillTotal+=this.SubscriptionList[sub].total_amount;
            }
              this.summeryBoxTotal +=1;

              if(this.SubscriptionList[sub].service_status == 'ACTIVE'){
                this.summeryActive =  (this.summeryActive*1) + 1;
               }else if(this.SubscriptionList[sub].service_status == 'SUSPENDED'){
                this.summerySuspended =  (this.summerySuspended*1) + 1;
               }else if(this.SubscriptionList[sub].service_status == 'DISCONNECTED'){
                this.summeryDisconnected = (this.summeryDisconnected*1) + 1;
               }else if(this.SubscriptionList[sub].service_status == 'FREEBOX'){
                this.summeryFreeBox = (this.summeryFreeBox*1) + 1;
               }

          }
   }
   //  ~ End  ----------------------------------------------------------------------------------------------------

 // -- savepayment -------------------------- ~start ---------------
     /*
       @details -  saving the payment form  group values 
      */
 AddPayment(){
  this.hasPayment=false;
   this.LabelPaymentType='';

   console.log('this.paymentDetails.value',this.paymentDetails.value);

   if(this.paymentDetails.valid){
   //Setting the default Values for payment feilds
    if(this.payment_details.length ==  0)
    {

      this.paymentDetails.controls['payment_user_id'].setValue(this._userProfileData.userDetails.user_id);
      this.paymentDetails.value.payment_code = this.paymentDetails.value.payment_type;
      this.payment_details.push(this.paymentDetails.value);
      console.log(this.payment_details);

          if (this.payment_details.length == 0) {
          this.showNoRecordsPayments = true;
          }else{
          this.showNoRecordsPayments = false;
          }
          this.paymentDetails.reset();

  }else {   //getting the Payment type Values for payment feilds if exist
      this.payment_obj_exist=this.payment_details.find(
        obj => obj.payment_type === this.paymentDetails.value.payment_type
      );
     //setting the Payment type Values for payment type to display
      if (this.payment_obj_exist) {
         this.hasPayment=true;
         if(this.payment_obj_exist.payment_type=='ADDCHRG'){
          this.LabelPaymentType='Add Charges';
         }else if(this.payment_obj_exist.payment_type=='OPNBAL'){
          this.LabelPaymentType='Opening Balance';
         }else if(this.payment_obj_exist.payment_type=='STBFEE'){
          this.LabelPaymentType='STB Fee';
         }
         console.log('this.payment_obj_exist.payment_type',this.payment_obj_exist.payment_type);
         console.log('hasPayment',this.hasPayment);
         console.log('LabelPaymentType',this.LabelPaymentType);

      }else{
        this.hasPayment=false; //Object not there show no records
      }
//Based on  hasPayment flag we are assign values
      if(!this.hasPayment)
      {
          this.paymentDetails.controls['payment_user_id'].setValue(this._userProfileData.userDetails.user_id);
          this.paymentDetails.value.payment_code = this.paymentDetails.value.payment_type;
          this.payment_details.push(this.paymentDetails.value);
          console.log(this.payment_details);
          if (this.payment_details.length == 0) {
          this.showNoRecordsPayments = true;
          }else{
          this.showNoRecordsPayments = false;
          }
         
          this.paymentDetails.reset();
  this.paymentDetails.controls["payment_type"].setValue('ADDCHRG');
      }
    }

  }else{
    this.validateFields.validateAllFormFields(this.paymentDetails);
  }
  
}
 // -- savepayment -------------------------- ~End ---------------

// --  @details :  removePayment ()#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  // If he done any mistake in payment 
 removePayment(index)
 {
   this.payment_details.splice(index,1);
     if(this.payment_details.length==0)
     {
       this.showNoRecordsPayments=true;
     }
     this.paymentDetails.controls["payment_type"].setValue('ADDCHRG');
 }
 // -- removePayment -------------------------- ~End ---------------

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
 
}

