/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR COLLECTION REPORT ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   19-MAR-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Get the data of all users for the owner
|   ++ Render the Collection data in tabular format with ability to :-
|      ** Ability to Filter by Area
|      ** Ability to Filter by User
|      ** Ability to Filter by Bill Type
|      ** Ability to Filter by Custom Date Range.
|    
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 19-MAR-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start ________________________________________________________________________________________________
// Import Angular Core Libraries/Functionalities
import { Component, OnInit, NgZone } from "@angular/core";
import { PersistenceService } from "angular-persistence";
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';
import {
  FormBuilder,
  FormGroup,
  AbstractControl,
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

import { startWith  } from "rxjs/operators/startWith";
import { map        } from "rxjs/operators/map";
import { Observable } from "rxjs/Observable";
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import * as _ from "lodash";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from './../../../Service/me-call-http-get.service';
import { MeUserProfileService } from './../../../Service/me-user-profile.service';
import { StorageType } from './../../../Service/Interfaces/storage-type.enum';
import { MeCalculateDateService } from './../../../Service/me-calculate-date.service';
import { MeGzipService } from '../../../Service/me-gzip.service';

// Decimal Format for integer values displayed in tera datatable.
const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);

// below variables declared for Jquery and Material script
// $ for jQuery functions and M for Material functions
declare var jQuery: any;
declare var $: any;
declare var M: any;
declare var require: any;

//  ~ End__________________________________________________________________________________________________


@Component({
  selector: 'app-me-collection-report',
  templateUrl: './me-collection-report.component.html',
  styleUrls: ['./me-collection-report.component.css']
})
export class MeCollectionReportComponent implements OnInit {
  
  // -- @details : Class variable declaration ################################################################
  //  ~ Start_________________________________________________________________________________________________

  //-- Create Form Group
  reportFilter: FormGroup;

  //-- Create List of Fields
  area_name: AbstractControl;
  user_name: AbstractControl;
  toppings  : AbstractControl;
  dateRange : AbstractControl;
  fromDate  : AbstractControl;
  toDate    : AbstractControl;


  // Class Form variables
  // All variables used in component template ( html file ) must be public
  showLoader   : boolean = true;
  showNoRecords: boolean = false;

  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput      : any   = "";
  private _userProfileData     : any;
  private _userLogin           : any;
  private _collectionReportList: any[] = [];
  private _areaList            : any   = [];
  private _userList            : any   = [];
  private reportValuesJSON     : any   = null;
  private area_id              : any;
  private user_id              : any;
  private reportDefaultObj: any;
  private customerNumber   : any;
  public selectedTabIndex : number;



  totalCollectionAmount         : number = 0;
  totalReceivedAmount           : number = 0;
  totalOutstandingAmount        : number = 0;
  fullCollectionAmount          : number = 0;
  partialCollectionAmount       : number = 0;
  AdvancePaymentAmount          : number = 0;
  billStatustotalCount          : number = 0;
  totalBillAmount               : number = 0;
  fullCollectionAmountPercent   : number = 0;
  partialCollectionAmountPercent: number = 0;
  totalBillAmountPercent: number = 0;
  totalBillStatustPercent: number = 0;
  totalCollectionPercent: number = 0;
  fullBillStatusCountPercent    = 0;
  partialBillStatusCountPercent = 0;
  advanceBillStatusCountPercent = 0;
  AdvancePaymentAmountPercent   : number = 0;
  totalCollectionAmountPercent  = 0;
  totalReceivedAmounttPercent   = 0;
  totalOutstandingAmountPercent = 0;
  fullCollectionAmountCount     : any    = [];
  advanceCollectionAmountCount  : any    = [];
  partialCollectionAmountCount  : any    = [];
  advanceBillStatusCount        : any    = [];
  fullBillStatusCount           : any    = [];
  partialBillStatusCount        : any    = [];
  _collectionSummaryList        : any    = [];
  _agentwiseSummaryList        : any    = [];
  _areawiseSummaryList        : any    = [];
  _areawiseSummaryListObj        : any    = [];
  
  userOptions             : any[] = [];
  filteredAreas           : Observable<any[]>;
  filteredUsers           : Observable<any[]>;
  collectionReportList_obj: any[] = [];
  exportColumnsData       : any[] = [];
  receivedAmountList      : any[] = [];
  collectionAmount        : any[] = [];
  receivedAmount          : any[] = [];
  outstandingAmount       : any[] = [];
  

  currentDate          : Date;
  minDate              : Date;
  maxDate              : Date;
  sixMonths            : Date;
  from_date_value      : Date;
  to_date_value        : Date;
  fromDate_value       : Date;
  datePickerDisableFlag: boolean = true;
  showResult    : boolean = false;
  lastDayOfWeek        : any ;
  firstDayOfWeek : any;
  loadComponentStatus    : boolean = false;

  // Tera DataTable Local Fields
  filteredData : any[]  = [];
  filteredTotal: number = 0;

  searchTerm  : string                  = '';
  fromRow     : number                  = 1;
  currentPage : number                  = 1;
  pageSize    : number                  = 50;
  sortBy      : string                  = 'received_date';
  selectedRows: any[]                   = [];
  sortOrder   : TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  dateRangeList = [
    {value: 'today', viewValue: 'Today'},
    {value: 'yesterday', viewValue: 'Yesterday'},
    {value: 'last_5_days', viewValue: 'Last 5 Days'},
    {value: 'last_7_days', viewValue: 'Last 7 Days'},
    {value: 'this_month', viewValue: 'This Month'},
    {value: 'custom', viewValue: 'Custom'}
  ];


  private postRequestObject: any   = {
    records: [
      {
        area_id  : "",
        area_name: "",
        user_name: "",
        user_id  : "",
        bill_status: "",
        fromDate : "",
        toDate   : "",
        dateRange: "",
        owner_id : "",
      }
    ]
  };



  // Tera DataTable Set Column name/Label and other features.
  columns: ITdDataTableColumn[] = [
    { name: 'bill_id', label: 'Bill Id',  filter: true,sortable: true,  },
    { name: 'full_name', label: 'Customer Name',  filter: true,sortable: true, width: 220 },
    { name: 'bill_status', label: 'Bill Status',  filter: true, sortable: true,  },
    { name: 'collection_amount_original', label: 'Orig. Collection Amt ',  filter: true ,sortable: true, numeric: true, format: DECIMAL_FORMAT },
    { name: 'collection_amount', label: 'Collection Amt',  filter: true, sortable: true, numeric: true, format: DECIMAL_FORMAT  },
    { name: 'received_amount', label: 'Received Amt',  filter: true, sortable: true, numeric: true, format: DECIMAL_FORMAT  },
    { name: 'outstanding_amount', label: 'Outstanding Amt',  filter: true, sortable: true, numeric: true, format: DECIMAL_FORMAT  },
    { name: 'received_date', label: 'Received On/By',  filter: true, sortable: true,  },
    // { name: 'received_date', label: 'Received Date',  filter: true, sortable: true, hidden:true , width: 180  } ,
    { name: 'previous_due', label: 'Prev Due.',  filter: true,sortable: true,numeric: true,format: DECIMAL_FORMAT  },
    { name: 'rent_amount', label: 'Rent',  filter: true,sortable: true,numeric: true,format: DECIMAL_FORMAT  },
    { name: 'cgst_total', label: 'CGST',  filter: true,sortable: false,numeric: true,format: DECIMAL_FORMAT  },
    { name: 'sgst_total', label: 'SGST',  filter: true,sortable: false,numeric: true,format: DECIMAL_FORMAT  },
    { name: 'tax_total', label: 'Total Tax',  filter: true,sortable: false,numeric: true,format: DECIMAL_FORMAT  },
    { name: 'subscription_name', label: 'Subscription Name',  filter: true,sortable: true },
    { name: 'stb_vc_number', label: 'VC Number',  filter: true,sortable: true, width: 250 },
    { name: 'stb_number', label: 'STB Number',  filter: true,sortable: true, width: 250 },
  ];  

  // function to open left side navgivation bar
  _opened: boolean = false;
 
 
  // Doughnut

  public doughnutChartType:string = 'doughnut';

  // public doughnutChartLabels:string[] = ['Inactive', 'Active'];
  // public doughnutChartData:number[] = [50, 200];

  public billCollectionsdoughnutChartLabels:string[] = ['Full', 'Partial','Advance Payment'];
  public billCollectionsdoughnutChartData:number[] = [0,0,0];
  // public collectionDoughnutColor[] = ['#C8E6C9', '#FAC152', '#D52C3F'];

  public doughnutChartColors:Array<any> = [
    {
      backgroundColor: ['#FFA07A','#90EE90','#BBDEFB']
    }
  ];

  public billStatusdoughnutChartLabels:string[] = ['Full', 'Partial','Advance Payment'];
  public billStatusdoughnutChartData:number[] = [0,0,0];


  public billAmuntdoughnutChartLabels:string[] = ['Collection', 'Received','Outstanding'];
  public billAmountdoughnutChartData:number[] = [0,0,0];

  public doughnutChartColorsBillAmount:Array<any> = [
    {
      backgroundColor: ['#FFA07A','#BBDEFB','#90EE90']
    }
  ];

  //  ~ End___________________________________________________________________________________________________

  // --  @details :  constructor ##############################################################################
  //  ~ Start - constructor____________________________________________________________________________________

  constructor(
    fb                            : FormBuilder,
    public  callHttpGet           : MeCallHttpGetService,
    public  userProfileService    : MeUserProfileService,
    private areaPersistenceService: PersistenceService,
    private _dataTableService     : TdDataTableService,
    public  zone                  : NgZone,
    private calculateDate         : MeCalculateDateService,
    public datepipe               : DatePipe,
    private gzipService       :MeGzipService,
  ) 
  
  {

    /*
      @details -  Intialize the form group with fields
        ++ The fields are set to default values - in below case to - null.
        ++ The fields are assigned validators
            ** Required Validator
    */

    this.reportFilter = fb.group({
      area_name: [""],
      user_name: [""],
      toppings  : [""],
      dateRange : ["Today"],
      fromDate  : [""],
      toDate    : [""] 
    });

    // -- Set min and max dates for the Calendar - Custom Drop down
    this.currentDate = new Date();
    this.sixMonths   = new Date();
    this.sixMonths.setMonth(this.sixMonths.getMonth() - 6);
    this.minDate     = this.sixMonths;
    this.maxDate     = this.currentDate;
    
    // Controls are used in me-collection-report.component.html for accessing values and checking functionalities
    this.area_name = this.reportFilter.controls["area_name"];
    this.user_name = this.reportFilter.controls["user_name"];
    this.toppings  = this.reportFilter.controls["toppings"];
    this.dateRange = this.reportFilter.controls["dateRange"];
    this.fromDate  = this.reportFilter.controls["fromDate"];
    this.toDate    = this.reportFilter.controls["toDate"];

    // Subscribe for Date Range changes
    // ~ Start -- pack price changes ------------------------------------------------
    this.dateRange.valueChanges.subscribe(
      (value: string) => {
        console.log('%c ------------------  Event Change Date Range ------------------','background: blue; color: white; display: block;');
        
        if (value) {
          console.log('date Range',value);
          if(value === 'custom') {
 
            // enable date picker
            this.datePickerDisableFlag = false;

            this.reportFilter.controls['fromDate'].setValue(null);
            this.reportFilter.controls['toDate'].setValue(null);
 
          }
          else 
          {
            // disable date picker
            this.datePickerDisableFlag = true;
 
            // auto calculate from and to date values
            this.calculateDate.calculateDateRange(value);

            // assign caculated values to fields
            this.reportFilter.controls['fromDate'].setValue(this.calculateDate.from_date.toDate());

            this.reportFilter.controls['toDate'].setValue(this.calculateDate.to_date.toDate());
            
          }

        } 
        
      }
    );
    // -~  End -------------------------------------------------------------------------


    // Subscribe for Area changes to get area_id
    // ~ Start -- Area_name changes ------------------------------------------------
      this.area_name.valueChanges.subscribe((value: string) => {

        for(let area in this._areaList) {

          if(this._areaList[area].area_name === value) {
            this.area_id = this._areaList[area].area_id;
          }
        }
        console.log('area_id',this.area_id);
      });
    // ~End --------------------------------------------------------------------------


    // Subscribe for user_name changes to get user_id
    // ~ Start -- user_name changes ------------------------------------------------
      this.user_name.valueChanges.subscribe((value: string) => {
        
        for(let user in this._userList) {

          if(this._userList[user].user_name === value) {
            this.user_id = this._userList[user].user_id;
          }
        }
        console.log('user_id',this.user_id);
      });
    // ~End --------------------------------------------------------------------------

  }
  //  ~ End - constructor_____________________________________________________________________________________

  // --  @details :  ngOnInit ###############################################################################
  //  ~ Start - ngOnInit_____________________________________________________________________________________
  ngOnInit(): void {

    this.filter();
    this.totalCollectionAmount = 0;

     //initialize loader
     this.showLoader    = true;
     this.showNoRecords = false;
     this.showResult    = false;

    // initialize and execute jquery document ready
    this.zone.run(() => {
      // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
      // https://angular.io/api/core/NgZone

      $(document).ready(function() {
        $("select").select();
        $('.modal').modal(
          {
            dismissible: false,
          }
        );
        $("input#input_text, textarea#textarea2").characterCounter();

        // intialize input label
        M.updateTextFields();
        
      });
    });

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.areaPersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );
    
    // make call to get user profile details
    //  ~ Start  --------------------------------------------------------------------------------- 
    this.userProfileService.makeRequest_UserProfile(this._userLogin).subscribe(response => {
        //assign user profile data from the response
         this._userProfileData = response;

        // Log Response - Remove Later
        console.warn(
          "%c ___________________________ UserProfile Response ___________________________",
          "background: #4dd0e1;color: black; font-weight: bold;"
        );
        console.log(this._userProfileData);

        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this._userProfileData.ownerDetails
        );

        console.log(
          "%c  Request Input : >>> ",
          "color: green; font-weight: bold;",
          this.getRequestInput
        );

        // make call for retrieving Area List  
        //  ~ Start  -------------------------------------------------------------------------------------------------
          this.callHttpGet.makeRequest_GetArea(this.getRequestInput).subscribe(response => {
           
            this.gzipService.makeRequest_uncompress(response).then(function(result) {
              
              this._areaList = result.areaList;

            }.bind(this))

          });
        //  ~ End ________________________________________________________________________________________

        // make call for retrieving User List
        //  ~ Start  -----------------------------------------------------------------------------------------

        this.callHttpGet.makeRequest_ManageUser(this.getRequestInput).subscribe(response => {
        
          this.gzipService.makeRequest_uncompress(response).then(function(result) {
              
            this._userList = result.usersList;

          }.bind(this))

        });

      //  ~ End  ---------------------------------------------------------------------------------------------

      // make call for makeRequest_getAreaSummary 
      //  ~ Start  ---makeRequest_getAreaSummary()----------------------------------------------------------------------
       
        this.callHttpGet.makeRequest_getAreaSummary(this.getRequestInput).subscribe(response => {


          console.warn(
            "%c ___________________________ makeRequest_getAreaSummary ___________________________",
            "background: #9fa8da;color: black; font-weight: bold;"
          );

          console.log(response.areawiseCollections);

          this._areawiseSummaryListObj = response.areawiseCollections;

          // calculate agent wise summary
          // this._areawiseSummaryList  = this.calculateAreawiseSummary(this._areawiseSummaryListObj);
        
        });
      // ~ End  ---makeRequest_getAreaSummary()-------------------------------------------------------------------------


      // ~ Assigning datepicker values as default today's date -----------------------------------------------        
      // disable date picker
        this.datePickerDisableFlag = true;
        
        // auto calculate from and to date values
        this.calculateDate.calculateDateRange('today');

        // assign caculated values to fields
        this.reportFilter.controls['fromDate'].setValue(this.calculateDate.from_date.toDate());
        this.reportFilter.controls['toDate'].setValue(this.calculateDate.to_date.toDate());
          
        this.reportFilter.controls['dateRange'].setValue('today');

        this.reportDefaultObj = {"fromDate":moment(this.calculateDate.from_date.toDate()).format('YYYY-MM-DD H:mm:ss'),"toDate":moment(this.calculateDate.to_date.toDate()).format('YYYY-MM-DD H:mm:ss'),"owner_id":this._userProfileData.ownerDetails.owner_id};
      
        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this.reportDefaultObj
        );

        console.warn(
          "%c ___________________________ getRequestInput ___________________________",
          "background: #9fa8da;color: black; font-weight: bold;"
        );

        console.log('default object is:',this.getRequestInput);
      
        // make call for getCollectionReport 
        //  ~ Start  ---makeRequest_getCollectionReport()-------------------------------------------------------------------------------
        this.callHttpGet.makeRequest_getCollectionReport(this.getRequestInput).subscribe(response => {
          
          
          this.gzipService.makeRequest_uncompress(response).then(function(result) {
              
            this._collectionReportList    = result.collectionReport;

            this.collectionReportList_obj = this._collectionReportList;
          
            if (this._collectionReportList.length > 0) {
              this.showLoader = false;
            
              this.filteredData  = this.collectionReportList_obj;
              this.filteredTotal = this.collectionReportList_obj.length;
              this.filter();

              // calculate agent wise summary
              // this._agentwiseSummaryList  = this.calculateAgentwiseSummary(this.collectionReportList_obj);
              // this.calculateAreawiseSummary(this.collectionReportList_obj);

              // set flags
              this.showLoader    = false;
              this.showNoRecords = false;
              this.showResult    = true;

            } else {
             // set flags in case of blank reponse or no result.
             this.showLoader    = false;
             this.showNoRecords = true;
             this.showResult    = false;
            }
          }.bind(this))

        });

        // ~ End  ---makeRequest_getCollectionReport()-------------------------------------------------------------------------

        // make call for getCollectionSummary 
        //  ~ Start  ---makeRequest_getCollectionSummary()----------------------------------------------------------------------
       
        this.callHttpGet.makeRequest_getCollectionSummary(this.getRequestInput).subscribe(response => {


        console.warn(
          "%c ___________________________ makeRequest_getCollectionSummary ___________________________",
          "background: #9fa8da;color: black; font-weight: bold;"
        );

        console.log('getCollectionSummary -- response :',response.collectionSummaryList);

        this._collectionSummaryList = response.collectionSummaryList;
        // function to calculate collection summary stuff
        this.collectionSummary(this._collectionSummaryList);

        this._agentwiseSummaryList  = this.calculateAgentwiseSummary(this._collectionSummaryList);
        this._areawiseSummaryList= this.calculateAreawiseSummary(this._collectionSummaryList);
        // this.calculateAreawiseSummary(this._collectionSummaryList);

        });
        // ~ End  ---makeRequest_getCollectionSummary()-------------------------------------------------------------------------

      


    });

  }
  //  ~ End - ngOnInit_____________________________________________________________________________________

  // --  @details :  onSubmit ##################################################################################
  //  ~ Start -onSubmit ________________________________________________________________________________________
  
    onSubmit(value: string): void {

       // Show Loader
      this.showLoader    = true;
      this.showResult    = false;
      this.showNoRecords = false;

      this.exportColumnsData = [];
      this._collectionSummaryList = [];
     
      
      // console.log(
      //   "%c Form Submitted Values ***** ----------------------------------------------------------------------- ",
      //   "background: #689f38;font-weight: bold;color: white; "
      // );
      // console.log(value);
      
      //create JSON
      this.reportValuesJSON = JSON.parse(JSON.stringify(value));
      // console.log("--------------- JSON Value ---------------");
      // console.log(this.reportValuesJSON);

      // Assign Values from values to post request object
      this.postRequestObject.records[0].area_name = this.reportValuesJSON.area_name;
      this.postRequestObject.records[0].area_id   = this.area_id;
      this.postRequestObject.records[0].user_id   = this.user_id;
      this.postRequestObject.records[0].user_name = this.reportValuesJSON.user_name;
      this.postRequestObject.records[0].bill_status = this.reportValuesJSON.toppings;
      this.postRequestObject.records[0].dateRange = this.reportValuesJSON.dateRange;
      this.postRequestObject.records[0].owner_id  = this._userProfileData.ownerDetails.owner_id;
      this.postRequestObject.records[0].fromDate = moment(this.reportValuesJSON.fromDate).format('YYYY-MM-DD H:mm:ss'); 
      this.postRequestObject.records[0].toDate   = moment(this.reportValuesJSON.toDate).endOf('date').format('YYYY-MM-DD H:mm:ss');

    //  console.log('from date',this.reportValuesJSON.fromDate);
      console.log(
        "%c Post Request Object ***** -------------------------------------------------------------------------- ",
        "background: #8bc34a;font-weight: bold;color: white; "
      );
      console.log(JSON.stringify(this.postRequestObject));

      // make call for getCollectionReport 
      //  ~ Start  ----------------------------------------------------------------------------------
      this.callHttpGet.makeRequest_getCollectionReport(this.postRequestObject).subscribe(response => {
        // Log Response - Remove Later
        // console.warn(
        //   "%c ___________________________ getCollectionReport Filtered Response ___________________________",
        //   "background: #4dd0e1;color: black; font-weight: bold;"
        // );

        this.gzipService.makeRequest_uncompress(response).then(function(result) {
              


          this._collectionReportList    = result.collectionReport;


          this.collectionReportList_obj = this._collectionReportList;


          console.log('this.collectionReportList_obj',this.collectionReportList_obj);

          if (this._collectionReportList.length > 0) {

            this.showLoader = false;
            this.showNoRecords = false;
            this.filteredData  = this.collectionReportList_obj;
            this.filteredTotal = this.collectionReportList_obj.length;

            this.filter();

            // // function to calculate collection summary stuff
            // this.collectionSummary(this._collectionReportList);

            // calculate agent wise summary
            // this._agentwiseSummaryList  = this.calculateAgentwiseSummary(this.collectionReportList_obj);
        
            // this.calculateAreawiseSummary(this.collectionReportList_obj);

            // set flags
            this.showLoader    = false;
            this.showNoRecords = false;
            this.showResult    = true;
          } 
          else 
          {
            this.collectionReportList_obj = [];
            this.filteredData  = this.collectionReportList_obj;
            this.filteredTotal = this.collectionReportList_obj.length;
            this.totalReceivedAmount = 0;

            // set flags in case of blank reponse or no result.
            this.showLoader    = false;
            this.showNoRecords = true;
            this.showResult    = false;
          }
        }.bind(this))

      });

      // ~ End  -----------------------------------------------------------------------------------------

      // make call for getCollectionSummary 
      //  ~ Start  ---makeRequest_getCollectionSummary()----------------------------------------------------------------------
       
      // console.log('this.postRequestObject',this.postRequestObject);
        this.callHttpGet.makeRequest_getCollectionSummary(this.postRequestObject).subscribe(response => {


          console.warn(
            "%c ___________________________ makeRequest_getCollectionSummary ___________________________",
            "background: #9fa8da;color: black; font-weight: bold;"
          );
  
          console.log('getCollectionSummary -- response :',JSON.stringify(response.collectionSummaryList));
  
          this._collectionSummaryList = response.collectionSummaryList;

          // function to calculate collection summary stuff
          this.collectionSummary(this._collectionSummaryList);
  
          this._agentwiseSummaryList  = this.calculateAgentwiseSummary(this._collectionSummaryList);
         this._areawiseSummaryList= this.calculateAreawiseSummary(this._collectionSummaryList);
          // this.calculateAreawiseSummary(this.collectionReportList_obj);
        });
      // ~ End  ---makeRequest_getCollectionSummary()-------------------------------------------------------------------------

      


    }

  //  ~ End -onSubmit ________________________________________________________________________________________


  // --  @details :  Class Functions for the Component ###################################################
  //  ~ Start_____________________________________________________________________________________________

  // ~ Start ---------------------------------------------------------------
  // -- @details : Function get AreaList for autocomplete.
  getAreaList() {
    this.filteredAreas = this.area_name.valueChanges.pipe(
      startWith(""),
      map(
        areaValue =>
          areaValue ? this.filterAreas(areaValue) : this._areaList.slice()
      )
    );
    console.warn("----------------- filteredAreas ----------------- ");
    console.warn(this.filteredAreas);

  }

  filterAreas(areaValue: string) {
    console.log(
      "%c filterAreas ***** --------------------------------------------------- ",
      "background: #4caf50;font-weight: bold;color: white; "
    );
    console.log(areaValue.toLowerCase());
    
    return this._areaList.filter(
      area =>
        area.area_name.toLowerCase().indexOf(areaValue.toLowerCase()) === 0
    );
  }

  // ~ End ----------------------------------------------------------------


  // ~ Start ---------------------------------------------------------------
  // -- @details : Function get UsersList for autocomplete.
  getUsersList() {
    this.filteredUsers = this.user_name.valueChanges.pipe(
      startWith(""),
      map(
        userValue =>
          userValue ? this.filterUsers(userValue) : this._userList.slice()
      )
    );
    console.warn("----------------- filteredUsers ----------------- ");
    console.log('usersList',this._userList);
    console.warn(this.filteredUsers);
  }

  filterUsers(userValue: string) {
    console.log(
      "%c filterUsers ***** --------------------------------------------------- ",
      "background: #4caf50;font-weight: bold;color: white; "
    );
    console.log(userValue.toLowerCase());
    
    return this._userList.filter(
      user =>
        user.user_name.toLowerCase().indexOf(userValue.toLowerCase()) === 0
    );
  }

  // ~ End ----------------------------------------------------------------

  // ~ Start ---------------------------------------------------------------
  // -- @details : Function for teradata datatable.
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
    this.filter();
  }

  showAlert(event: any): void {
    let row: any = event.row;
    // .. do something with event.row
  }

  filter(): void {
    let newData: any[] = this.collectionReportList_obj;
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
  // ~ End ---------------------------------------------------------------


  // ~ Start ---------------------------------------------------------------
  // -- @details : Function to clear fields on autocomplete for area and agent.
  clearAgentNameField() {
    
    this.reportFilter.controls['user_name'].setValue('');
    this.user_id = '';
  }
    
  clearAreaNameField() {

    this.reportFilter.controls['area_name'].setValue('');
    this.area_id = '';
  }
  // ~ End ---------------------------------------------------------------


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

  // --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

    collectionSummary(collectionSummaryList) {

      if( collectionSummaryList.length > 0 ) {

        this.totalCollectionAmount = 0;
        this.collectionAmount = [];
        this.totalReceivedAmount = 0;
        this.receivedAmount = [];
        this.totalOutstandingAmount = 0;
        this.outstandingAmount = [];
        this.partialCollectionAmount = 0;
        this.AdvancePaymentAmount = 0;
        this.fullCollectionAmount = 0;

        this.fullBillStatusCount = 0;
        this.partialBillStatusCount = 0;
        this.advanceBillStatusCount = 0;


        // Start ~ Full received_amount Amount --------------------------------------------------------------------------
          
          this.fullCollectionAmount = _.sumBy(collectionSummaryList, function(o) { 
            
            if(o.bill_status_desc == 'Full') {
              return o.received_amount;
            }
          });

          // console.log('fullCollectionAmount',this.fullCollectionAmount);
      
        // End ~ Full received_amount Amount --------------------------------------------------------------------------

        // Start ~ Full received_amount Amount --------------------------------------------------------------------------
        
          this.partialCollectionAmount = _.sumBy(collectionSummaryList, function(o) { 
            if(o.bill_status_desc == 'Partial') {
              return o.received_amount;
            }
          });
          // console.log('partialCollectionAmount',this.partialCollectionAmount);
    
        // End ~ Full received_amount Amount --------------------------------------------------------------------------


        // Start ~ AdvancePaymentAmount --------------------------------------------------------------------------
        
         
          this.AdvancePaymentAmount = _.sumBy(collectionSummaryList, function(o) { 
            if(o.bill_status_desc == 'AddBal') {
              return o.received_amount;
            }
          });
          // console.log('AdvancePaymentAmount',this.AdvancePaymentAmount);
  
        // End ~ AdvancePaymentAmount --------------------------------------------------------------------------

        
        // Start ~ Total Collection Amount --------------------------------------------------------------------------
        
         
          this.totalCollectionAmount = _.sumBy(collectionSummaryList, function(o) { return o.collection_amount; });
          // console.log('totalCollectionAmount',this.totalCollectionAmount);
        
        // End ~ Total Collection Amount --------------------------------------------------------------------------


        // Start ~ Total Received Amount --------------------------------------------------------------------------
        

          this.totalReceivedAmount = _.sumBy(collectionSummaryList, function(o) { return o.received_amount; });
          // console.log('totalReceivedAmount',this.totalReceivedAmount);
      
        // End ~ Total Received Amount --------------------------------------------------------------------------


        // Start ~ Total Received Amount --------------------------------------------------------------------------
        
          
          this.totalOutstandingAmount = _.sumBy(collectionSummaryList, function(o) { return o.outstanding_amount; });
          this.totalOutstandingAmount = Math.abs(this.totalOutstandingAmount);
          // console.log('totalOutstandingAmount',this.totalOutstandingAmount);
    
        // End ~ Total Received Amount --------------------------------------------------------------------------


        // Start ~  Bill Status --------------------------------------------------------------------------

        this.fullBillStatusCount = _.sumBy(collectionSummaryList, function(o) { 
            
          if(o.bill_status_desc == 'Full') {
            return 1;
          }
        });

        this.partialBillStatusCount = _.sumBy(collectionSummaryList, function(o) { 
            
          if(o.bill_status_desc == 'Partial') {
            return 1;
          }
        });


        this.advanceBillStatusCount = _.sumBy(collectionSummaryList, function(o) { 
            
          if(o.bill_status_desc == 'AddBal') {
            return 1;
          }
        });

        // Start ~ End Bill Status  --------------------------------------------------------------------------

        this.totalBillAmount = 0;
        this.billStatustotalCount  = 0;
        this.fullCollectionAmountPercent    = 0;
        this.partialCollectionAmountPercent = 0;
        this.AdvancePaymentAmountPercent    = 0;

        this.fullBillStatusCountPercent    = 0;
        this.partialBillStatusCountPercent = 0;
        this.advanceBillStatusCountPercent = 0;
  
        this.totalCollectionAmountPercent  = 0;
        this.totalReceivedAmounttPercent   = 0;
        this.totalOutstandingAmountPercent = 0;

        this.billStatustotalCount             = this.fullBillStatusCount + this.partialBillStatusCount + this.advanceBillStatusCount;
        this.totalBillAmount = this.totalCollectionAmount + this.totalReceivedAmount + this.totalOutstandingAmount;

        // Calculating Percent for collections amount
        this.fullCollectionAmountPercent    = this.fullCollectionAmount / this.totalReceivedAmount * 100 ;
        this.partialCollectionAmountPercent = this.partialCollectionAmount / this.totalReceivedAmount * 100;
        this.AdvancePaymentAmountPercent    = this.AdvancePaymentAmount / this.totalReceivedAmount * 100;
        this.totalCollectionPercent = this.fullCollectionAmountPercent + this.partialCollectionAmountPercent + this.AdvancePaymentAmountPercent;  

        // Calculating Percent for Bill Status 
        this.fullBillStatusCountPercent    = this.fullBillStatusCount / this.billStatustotalCount * 100 ;
        this.partialBillStatusCountPercent = this.partialBillStatusCount / this.billStatustotalCount * 100 ;
        this.advanceBillStatusCountPercent = this.advanceBillStatusCount / this.billStatustotalCount * 100 ;
        this.totalBillStatustPercent = this.fullBillStatusCountPercent + this.partialBillStatusCountPercent + this.advanceBillStatusCountPercent; 
      
        // Calculating Percent for Bill Amount 
        this.totalCollectionAmountPercent  = this.totalCollectionAmount / this.totalBillAmount * 100 ;
        this.totalReceivedAmounttPercent   = this.totalReceivedAmount / this.totalBillAmount * 100 ;
        this.totalOutstandingAmountPercent = this.totalOutstandingAmount / this.totalBillAmount * 100 ;
        this.totalOutstandingAmountPercent = Math.abs(this.totalOutstandingAmountPercent);
        this.totalBillAmountPercent = this.totalCollectionAmountPercent +this.totalReceivedAmounttPercent + this.totalOutstandingAmountPercent;

        this.billAmountdoughnutChartData      = [this.totalCollectionAmount,this.totalReceivedAmount,this.totalOutstandingAmount];
        this.billCollectionsdoughnutChartData = [this.fullCollectionAmount,this.partialCollectionAmount,this.AdvancePaymentAmount];
        this.billStatusdoughnutChartData      = [this.fullBillStatusCount,this.partialBillStatusCount,this.advanceBillStatusCount];
        
      }
      else
      {
        // if no collections then set to zero.

        this.totalCollectionAmount = 0;
        this.collectionAmount = [];
        this.totalReceivedAmount = 0;
        this.receivedAmount = [];
        this.totalOutstandingAmount = 0;
        this.outstandingAmount = [];
        this.partialCollectionAmount = 0;
        this.AdvancePaymentAmount = 0;
        this.fullCollectionAmount = 0;

        this.fullBillStatusCount = 0;
        this.partialBillStatusCount = 0;
        this.advanceBillStatusCount = 0;

        this.totalBillAmount = 0;
        this.billStatustotalCount  = 0;
        this.fullCollectionAmountPercent    = 0;
        this.partialCollectionAmountPercent = 0;
        this.AdvancePaymentAmountPercent    = 0;

        this.fullBillStatusCountPercent    = 0;
        this.partialBillStatusCountPercent = 0;
        this.advanceBillStatusCountPercent = 0;
  
        this.totalCollectionAmountPercent  = 0;
        this.totalReceivedAmounttPercent   = 0;
        this.totalOutstandingAmountPercent = 0;

        this.billAmountdoughnutChartData = [0,0,0];
        this.billCollectionsdoughnutChartData = [0,0,0];
        this.billStatusdoughnutChartData = [0,0,0];
      }
    }

  //  ~ End  ----------------------------------------------------------------------------------------------------


  // --  @details : exportData()#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  exportData() {
  
    if(this._collectionReportList) {

      console.log('this._collectionReportList',this._collectionReportList);
      this._collectionReportList.map(item => {
        return {
            bill_id: item.bill_id,
            customer_id: item.customer_id,
            name: item.full_name,
            customer_phone: item.customer_phone,
            area_name: item.area_name,
            opening_balance: item.opening_balance,
            rent_amount: item.rent_amount,
            previous_due: item.previous_due,
            cgst_total: item.cgst_total,
            sgst_total: item.sgst_total,
            tax_total: item.tax_total,
            rent_total: item.rent_total,
            bill_amount: item.bill_amount,
            collection_amount_original: item.collection_amount_original,
            collection_amount: item.collection_amount,
            received_amount: item.received_amount,
            outstanding_amount: item.outstanding_amount,
            received_date: item.received_date,
            user_name: item.user_name,
            bill_status_desc: item.bill_status_desc,
            stb_vc_number: '`' + item.stb_vc_number,
            stb_number: '`' + item.stb_number,
            stb_serial_number: '`' + item.stb_serial_number,
            stb_model_number: item.stb_model_number,
            subscription_name: item.subscription_name
        }
      }).forEach(item => this.exportColumnsData.push(item));
      // console.log(this.exportColumnsData);
      
      const options = { 
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalseparator: '.',
        showLabels: true,
        showTitle: false,
        useBom: false,
        headers: [
          'Bill Id',
          'Customer Id',
          'Full Name',
          'Phone Number',
          'Area Name',
          'Opening Balance',
          'Rent Amount',
          'Previous Due',
          'CGST Total',
          'SGST Total',
          'Tax Total',
          'Rent Total',
          'Bill Amount',
          'Original Collection Amount',
          'Collection Amount',
          'Received Amount',
          'Outstanding Amount',
          'Received Date',
          'User Name',
          'Bill Status Desc',
          'VC Number',
          'STB Number',
          'STB SERIAL Number',
          'Model Number',
          'Subscription Name'

        ]
      };

      new Angular2Csv(this.exportColumnsData, 'Collection Report', options);
    }
  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

  // calculateAgentwiseSummary ~ Start -----------------------------------------------------------------------

  calculateAgentwiseSummary( p_collection_array : any ) {
    // declare variables
    let agentsArray = [];
    let agentObjIndex;


    // @details - Start Calculation

    _.forEach(p_collection_array, function(obj) {

    
      if(agentsArray.length == 0 ){

        let agentwiseSummaryObj = {
            agentName            : null,
            count                : 0,
            collection_amt_total : 0,
            received_amt_total   : 0,
            full_payment_total   : 0,
            partial_payment_total: 0,
            advance_payment_total: 0,
        };

        agentwiseSummaryObj.agentName            = obj.user_name;
        agentwiseSummaryObj.count                = 1;
        agentwiseSummaryObj.collection_amt_total = parseInt(obj.collection_amount_original) | 0 ;
        agentwiseSummaryObj.received_amt_total   = parseInt(obj.received_amount) | 0;

        if(obj.bill_status == "FP"){
          agentwiseSummaryObj.full_payment_total = parseInt(obj.received_amount) | 0;
        }
        else if(obj.bill_status == "PP"){
          agentwiseSummaryObj.partial_payment_total = parseInt(obj.received_amount) | 0;
        }
        else if(obj.bill_status == "AB"){
          agentwiseSummaryObj.advance_payment_total = parseInt(obj.received_amount) | 0;
        }

        // add the value to array
        agentsArray.push( agentwiseSummaryObj);
      }
      else if( agentsArray.length > 0 ){
        
        // find the user in array and return the index if the user value is already present in the array
        agentObjIndex = _.findIndex(agentsArray, function(o) { 
          return o.agentName == obj.user_name;
        });

       


        if(agentObjIndex >= 0 ){

          if(agentsArray[agentObjIndex].bill_id != obj.bill_id){
          agentsArray[agentObjIndex].collection_amt_total += parseInt(obj.collection_amount_original) | 0 ;
          }

          agentsArray[agentObjIndex].count                += 1;
          agentsArray[agentObjIndex].received_amt_total   += parseInt(obj.received_amount) | 0 ;
          
            if(obj.bill_status == "FP"){
              agentsArray[agentObjIndex].full_payment_total += parseInt(obj.received_amount) | 0;
            }
            else if(obj.bill_status == "PP"){
              agentsArray[agentObjIndex].partial_payment_total += parseInt(obj.received_amount) | 0;
            }
            else if(obj.bill_status == "AB"){
              agentsArray[agentObjIndex].advance_payment_total += parseInt(obj.received_amount) | 0;
            }
        }
        else if(agentObjIndex == -1 ){
      
          let agentwiseSummaryObj = {
            agentName            : null,
            count                : 0,
            collection_amt_total : 0,
            received_amt_total   : 0,
            full_payment_total   : 0,
            partial_payment_total: 0,
            advance_payment_total: 0,
          };


          

            agentwiseSummaryObj.agentName            = obj.user_name;
            agentwiseSummaryObj.count                = 1;
            agentwiseSummaryObj.collection_amt_total = parseInt(obj.collection_amount_original) | 0;
            agentwiseSummaryObj.received_amt_total   = parseInt(obj.received_amount) | 0;

          if(obj.bill_status == "FP"){
              agentwiseSummaryObj.full_payment_total = parseInt(obj.received_amount) | 0;
            }
            else if(obj.bill_status == "PP"){
              agentwiseSummaryObj.partial_payment_total = parseInt(obj.received_amount) | 0;
            }
            else if(obj.bill_status == "AB"){
              agentwiseSummaryObj.advance_payment_total = parseInt(obj.received_amount) | 0 ;
            }

          // add the value to array
          agentsArray.push( agentwiseSummaryObj);

        }  


      }

      
    });

  console.log(" **** Agents Array **** ");
  console.log(agentsArray);

  // return value
  return agentsArray;


  }

  // calculateAgentwiseSummary ~ End -----------------------------------------------------------------------



  // calculateAreawiseSummary ~ Start -----------------------------------------------------------------------

  // calculateAreawiseSummary( p_collection_array : any ) {
   
  //   // declare variables
  //   let areaArray = [];
  //   let areaObjIndex;


  //   // @details - Start Calculation

  //   _.forEach(p_collection_array, function(obj) {

    
  //     if(areaArray.length == 0 ){

  //       let areawiseSummaryObj = {
  //           area_name            : null,
  //           collection_amount : 0,
  //           received_amount   : 0
  //       };

  //       areawiseSummaryObj.agentName            = obj.user_name;
  //       areawiseSummaryObj.count                = 1;
  //       areawiseSummaryObj.collection_amt_total = parseInt(obj.collection_amount_original) | 0 ;
  //       areawiseSummaryObj.received_amt_total   = parseInt(obj.received_amount) | 0;

  //       if(obj.bill_status == "FP"){
  //         areawiseSummaryObj.full_payment_total = parseInt(obj.received_amount) | 0;
  //       }
  //       else if(obj.bill_status == "PP"){
  //         areawiseSummaryObj.partial_payment_total = parseInt(obj.received_amount) | 0;
  //       }
  //       else if(obj.bill_status == "AB"){
  //         areawiseSummaryObj.advance_payment_total = parseInt(obj.received_amount) | 0;
  //       }

  //       // add the value to array
  //       areaArray.push( areawiseSummaryObj);
  //     }
  //     else if( areaArray.length > 0 ){
        
  //       // find the user in array and return the index if the user value is already present in the array
  //       areaObjIndex = _.findIndex(areaArray, function(o) { 
  //         return o.agentName == obj.user_name;
  //       });


  //       if(areaObjIndex >= 0 ){

  //         areaArray[areaObjIndex].count                += 1;
  //         areaArray[areaObjIndex].collection_amt_total += parseInt(obj.collection_amount_original) | 0 ;
  //         areaArray[areaObjIndex].received_amt_total   += parseInt(obj.received_amount) | 0 ;
          
  //           if(obj.bill_status == "FP"){
  //             areaArray[areaObjIndex].full_payment_total += parseInt(obj.received_amount) | 0;
  //           }
  //           else if(obj.bill_status == "PP"){
  //             areaArray[areaObjIndex].partial_payment_total += parseInt(obj.received_amount) | 0;
  //           }
  //           else if(obj.bill_status == "AB"){
  //             areaArray[areaObjIndex].advance_payment_total += parseInt(obj.received_amount) | 0;
  //           }
  //       }
  //       else if(areaObjIndex == -1 ){
      
  //         let areawiseSummaryObj = {
  //           agentName            : null,
  //           count                : 0,
  //           collection_amt_total : 0,
  //           received_amt_total   : 0,
  //           full_payment_total   : 0,
  //           partial_payment_total: 0,
  //           advance_payment_total: 0,
  //         };

  //           areawiseSummaryObj.agentName            = obj.user_name;
  //           areawiseSummaryObj.count                = 1;
  //           areawiseSummaryObj.collection_amt_total = parseInt(obj.collection_amount_original) | 0;
  //           areawiseSummaryObj.received_amt_total   = parseInt(obj.received_amount) | 0;

  //         if(obj.bill_status == "FP"){
  //             areawiseSummaryObj.full_payment_total = parseInt(obj.received_amount) | 0;
  //           }
  //           else if(obj.bill_status == "PP"){
  //             areawiseSummaryObj.partial_payment_total = parseInt(obj.received_amount) | 0;
  //           }
  //           else if(obj.bill_status == "AB"){
  //             areawiseSummaryObj.advance_payment_total = parseInt(obj.received_amount) | 0 ;
  //           }

  //         // add the value to array
  //         areaArray.push( areawiseSummaryObj);

  //       }  


  //     }

      
  //   });

  //   console.log(" **** Area Array **** ");
  //   console.log(areaArray);

  //   // return value
  //   return areaArray;


  // }

  // calculateAreawiseSummary ~ End -----------------------------------------------------------------------

  //  ~ End  ----------------------------------------------------------------------------------------------------


      // --  @details :  getCustomerNumber (param)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  getCustomerNumber(custNumvalue) {

    this.customerNumber = custNumvalue;
    // console.log('customerNumber',this.customerNumber);
    
    this.loadComponentStatus = true;
    this.selectedTabIndex = 0;


  }
//  ~ End  ----------------------------------------------------------------------------------------------------

calculateAreawiseSummary( p_collection_array : any ) {
 // @details - Start Calculation

 console.log('calculateAreawiseSummary',p_collection_array);
 let UsersArray = [];
 let areaObjIndex;

 _.forEach(p_collection_array, function(obj) {

  if(UsersArray.length == 0){

    let areawiseSummaryObj = {
      area_name    : null,
      collection_amt_total : 0,
      received_amt_total   : 0,
      count                : 0,
    };

    areawiseSummaryObj.area_name            = obj.area_name;
    areawiseSummaryObj.count                = 1;
    areawiseSummaryObj.collection_amt_total = parseInt(obj.collection_amount_original) | 0 ;
    areawiseSummaryObj.received_amt_total   = parseInt(obj.received_amount) | 0;

     // add the value to array
     UsersArray.push( areawiseSummaryObj);
  } else if( UsersArray.length > 0 ){
 

      // find the user in array and return the index if the user value is already present in the array
      areaObjIndex = _.findIndex(UsersArray, function(o) { 
        return o.area_name == obj.area_name;
      });

      if(areaObjIndex >= 0 ){

        UsersArray[areaObjIndex].count                += 1;
        UsersArray[areaObjIndex].collection_amt_total += parseInt(obj.collection_amount_original) | 0 ;
        UsersArray[areaObjIndex].received_amt_total   += parseInt(obj.received_amount) | 0 ;
      
      }else if(areaObjIndex == -1 ){
        let areawiseSummaryObj = {
          area_name    : null,
          collection_amt_total : 0,
          received_amt_total   : 0,
          count                : 0,
        };

        areawiseSummaryObj.area_name            = obj.area_name;
        areawiseSummaryObj.count                = 1;
        areawiseSummaryObj.collection_amt_total = parseInt(obj.collection_amount_original) | 0 ;
        areawiseSummaryObj.received_amt_total   = parseInt(obj.received_amount) | 0;
   
         // add the value to array
         UsersArray.push( areawiseSummaryObj);

      }

  }

   
});

console.log(" **** UsersArray **** ");
  console.log(UsersArray);

  // return value
  return UsersArray;
}


}
// -------------------  Component & Class Definition - End ---------------------------------------------