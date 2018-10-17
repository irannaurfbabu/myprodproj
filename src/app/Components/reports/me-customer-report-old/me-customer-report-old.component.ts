/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR COLLECTION REPORT ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   07-JUN-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Get the data of all users for the owner
|   ++ Render the Collection data in tabular format with ability to :-
|      ** Ability to Filter by Area
|      ** Ability to Filter by User
|    
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 07-JUN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start ________________________________________________________________________________________________
// Import Angular Core Libraries/Functionalities

import { Component, OnInit, NgZone, Input } from "@angular/core";
import { PersistenceService } from "angular-persistence";
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
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

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from './../../../Service/me-call-http-get.service';
import { MeUserProfileService } from './../../../Service/me-user-profile.service';
import { StorageType } from './../../../Service/Interfaces/storage-type.enum';
import { MeCalculateDateService } from './../../../Service/me-calculate-date.service';
import { MeGzipService } from '../../../Service/me-gzip.service';
import * as _ from "lodash";
import { MeDataExchangeService } from '../../../Service/me-data-exchange.service';

// Decimal Format for integer values displayed in tera datatable.
const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);

// below variables declared for Jquery and Material script
// $ for jQuery functions and M for Material functions
declare var require: any;
declare var jQuery: any;
declare var $: any;
declare var M: any;
declare var jsPDF: any;
declare var require: any;
declare let JsBarcode: any;
//  ~ End__________________________________________________________________________________________________

@Component({
  selector: 'app-me-customer-report-old',
  templateUrl: './me-customer-report-old.component.html',
  styleUrls: ['./me-customer-report-old.component.css']
})
export class MeCustomerReportOldComponent implements OnInit {

  // -- @details : Class variable declaration ################################################################
  //  ~ Start_________________________________________________________________________________________________

  //-- Create Form Group
  customerListReportFilters: FormGroup;

  //-- Create List of Fields
  area_name: AbstractControl;
  BalanceStatus: AbstractControl;
  CustomerStatus: AbstractControl;
  PrintAreaName:any;
  // Class Form variables
  // All variables used in component template ( html file ) must be public
  showLoader   : boolean = true;
  showNoRecords: boolean = false;
  showResult    : boolean = false;
  showBulkInvoice    : boolean = false;
  loadComponentStatus    : boolean = false;
  loadProformaInvoice    : boolean = false;
  loadBarcode : boolean = false;

  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput    : any   = "";
  private _userProfileData   : any;
  private _userLogin         : any;
  private _customerReportList: any[] = [];
  private _areaList          : any   = [];
  private reportValuesJSON   : any      = null;
  private area_id            : any;
  private reportDefaultObj   : any;
   customerNumber   : any;
  public selectedTabIndex : number;
  subscription : any;
  billDetails :  any;
  owner_meta_Json : any;
  subscriptions : any;
  subscriptionSummary : any[] = [];
  resultArray: any = []
  customer_meta_Json:any;
  filteredAreas: Observable<any[]>;
  customerReportList_obj : any[] = [];
  exportColumnsData : any[] = [];
  

  // Tera DataTable Local Fields
  filteredData : any[]  = [];




  filteredTotal: number = 0;

  searchTerm  : string                  = '';
  fromRow     : number                  = 1;
  currentPage : number                  = 1;
  pageSize    : number                  = 50;
  sortBy      : string                  = 'customer_id';
  selectedRows: any[]                   = [];
  sortOrder   : TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;


  private postRequestObject: any   = {
    records: [
      {
        area_id  : "",
        BalanceStatus  : "",
        owner_id : "",
        active: '',
      }
    ]
  };

  // Tera DataTable Set Column name/Label and other features.
  columns: ITdDataTableColumn[] = [
    { name: 'customer_id', label: 'Customer Id',  filter: true,sortable: true, width: 130  },
    { name: 'full_name', label: 'Customer Name',  filter: true,sortable: true, width: 230 },
    { name: 'stb_cnt', label: 'No. of STB',  filter: true, sortable: true, width: 120},
    { name: 'stb_vc_number', label: 'VC #',  filter: true, sortable: false , width: 250},
    { name: 'available_balance', label: 'Available Balance',  filter: true, sortable: true, numeric: true, format: DECIMAL_FORMAT  },
    { name: 'balance_status', label: 'Balance Status',  filter: true, sortable: true },
    { name: 'customer_number', label: 'Action', sortable: false, filter: false }
  ];  

  // function to open left side navgivation bar
  _opened: boolean = false;
 
  Duedate            : any;
  dueDate : any = new Date;
  due : any;
  vcNumber : any;
  stbNumber : any;
  vcNoList : any = [];
  vcNum : any = "";
  vcNumbers : any = "";
  stb : any;
  stbNum : any;
  stbNumberList:any= [];

  bill_date        : any;
  month            : any;

  public shareCustomerObject: any = {
    customerNumber: null,
    customerName: null
  };
  //  ~ End___________________________________________________________________________________________________
  
  // --  @details :  constructor ##############################################################################
  //  ~ Start - constructor____________________________________________________________________________________

  constructor(
            fb                      : FormBuilder,
    public  callHttpGet             : MeCallHttpGetService,
    public  userProfileService      : MeUserProfileService,
    private reportPersistenceService: PersistenceService,
    private _dataTableService       : TdDataTableService,
    public  zone                    : NgZone,
    private calculateDate           : MeCalculateDateService,
    public  datepipe                : DatePipe,
    private router                  : Router,
    private gzipService       :MeGzipService,
    public dataExchange       : MeDataExchangeService

  ) { 

    /*
      @details -  Intialize the form group with fields
        ++ The fields are set to default values - in below case to - null.
        ++ The fields are assigned validators
            ** Required Validator
    */

   this.customerListReportFilters = fb.group({
    area_name: [""],
    BalanceStatus: [""],
    CustomerStatus:[""]
  });

  // Controls are used in me-collection-report.component.html for accessing values and checking functionalities
  this.area_name = this.customerListReportFilters.controls["area_name"];
  this.BalanceStatus = this.customerListReportFilters.controls["BalanceStatus"];
  this.CustomerStatus = this.customerListReportFilters.controls["CustomerStatus"];

  // Subscribe for Area changes to get area_id
  // ~ Start -- Area_name changes ------------------------------------------------
    this.area_name.valueChanges.subscribe((value: string) => {
      this.PrintAreaName=value;
      for(let area in this._areaList) {

        if(this._areaList[area].area_name === value) {
          this.area_id = this._areaList[area].area_id;
        }
      }
      console.log('area_id',this.area_id);
    });
  // ~End --------------------------------------------------------------------------


  }
//  ~ End - constructor_____________________________________________________________________________________



// --  @details :  ngOnInit ###############################################################################
//  ~ Start - ngOnInit_____________________________________________________________________________________
  ngOnInit() {

    this.filter();
    this.selectedTabIndex = 0;

    //initialize flags
    this.showLoader    = true;
    this.showNoRecords = false;
    this.showResult    = false;

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
     this._userLogin = this.reportPersistenceService.get(
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

     

      this.owner_meta_Json = JSON.parse(this._userProfileData.ownerDetails.owner_meta_value);

      this.dueDate =  moment().format("-MMM-YYYY");
      this.due = this.owner_meta_Json.due_date + this.dueDate;
      console.log(this.due)
      console.log(this.owner_meta_Json.enable_gst)
      console.log(this.owner_meta_Json.udf1)
      console.log(this.owner_meta_Json.udf2)

      console.log(
        "%c  Request Input : >>> ",
        "color: green; font-weight: bold;",
        this.getRequestInput
      );

      console.log(this._userProfileData.ownerDetails.owner_company_name)
      let owner_company_name = this._userProfileData.ownerDetails.owner_company_name
      // make call for retrieving Area List  
      //  ~ Start  -------------------------------------------------------------------------------------------------
        this.callHttpGet.makeRequest_GetArea(this.getRequestInput).subscribe(response => {
    
          this.gzipService.makeRequest_uncompress(response).then(function(result) {
              
            this._areaList = result.areaList;
          }.bind(this))

        });
      //  ~ End ________________________________________________________________________________________


      // Intialize report Object;
      this.reportDefaultObj = {
          "owner_id":this._userProfileData.ownerDetails.owner_id
        };

      // get the Input JSON format for making http request.
      this.getRequestInput = this.callHttpGet.createGetRequestRecord(
        this.reportDefaultObj
      );

      console.warn(
        "%c ___________________________ getRequestInput ___________________________",
        "background: #9fa8da;color: black; font-weight: bold;"
      );

      console.log('default object is:',this.getRequestInput);
    
      // make call for getCustomerList Report 
      //  ~ Start  ----------------------------------------------------------------------------------
      this.callHttpGet.makeRequest_getCustomerListReport(this.getRequestInput).subscribe(response => {
          
        // Log Response - Remove Later
        // console.warn(
        //     "%c ___________________________ getCustomerList Report Response ___________________________",
        //     "background: #4dd0e1;color: black; font-weight: bold;"
        // );
        // console.log(response);

        this.gzipService.makeRequest_uncompress(response).then(function(result) {
              
          this._customerReportList = result.customersList;

          console.log(this._customerReportList)

          this.customerReportList_obj = this._customerReportList;

        
          if(this._customerReportList.length > 0  ){

            console.log("----- Customer List Length ----- ", this._customerReportList.length);

            this.filteredData  = this.customerReportList_obj;
            this.filteredTotal = this.customerReportList_obj.length;
            this.filter();

            // set flags
            this.showLoader    = false;
            this.showNoRecords = false;
            this.showResult    = true;
          }
          else 
          {
            // set flags in case of blank reponse or no result.
            this.showLoader    = false;
            this.showNoRecords = true;
            this.showResult    = false;
          }
        }.bind(this))

      });

      // ~ End  -----------------------------------------------------------------------------------------
      
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
      this.showBulkInvoice=false;
      this.exportColumnsData = [];
          
      console.log(
        "%c Form Submitted Values ***** ----------------------------------------------------------------------- ",
        "background: #689f38;font-weight: bold;color: white; "
      );
      console.log(value);
      
      //create JSON
      this.reportValuesJSON = JSON.parse(JSON.stringify(value));
      // console.log("--------------- JSON Value ---------------");
      // console.log(this.reportValuesJSON);

    // Assign Values from values to post request object
      this.postRequestObject.records[0].area_id   = this.area_id;
      this.postRequestObject.records[0].owner_id  = this._userProfileData.ownerDetails.owner_id;
      this.postRequestObject.records[0].active    = this.customerListReportFilters.controls['CustomerStatus'].value;
      console.log(
        "%c Post Request Object ***** -------------------------------------------------------------------------- ",
        "background: #8bc34a;font-weight: bold;color: white; "
      );
      console.log(JSON.stringify(this.postRequestObject));

    // make call for getCustomerList Report 
    //  ~ Start  ----------------------------------------------------------------------------------
      this.callHttpGet.makeRequest_getCustomerListReport(this.postRequestObject).subscribe(response => {
        
        // Log Response - Remove Later
        // console.warn(
        //     "%c ___________________________ getCustomerList Report Response ___________________________",
        //     "background: #4dd0e1;color: black; font-weight: bold;"
        // );
        // console.log(response);

        this.gzipService.makeRequest_uncompress(response).then(function(result) {
              
          this._customerReportList = result.customersList;  
          this.customerReportList_obj = this._customerReportList;
          if (this.customerReportList_obj.length > 0) {
            this.showLoader = false;
            this.showNoRecords = false;
            this.showBulkInvoice=true;
            this.filteredData  = this.customerReportList_obj;
            this.filteredTotal = this.customerReportList_obj.length;
    
            this.filter();
    
            // set flags
            this.showLoader    = false;
            this.showNoRecords = false;
            this.showResult    = true;
          } else {
    
            this.customerReportList_obj = [];
            this.filteredData  = this.customerReportList_obj;
            this.filteredTotal = this.customerReportList_obj.length;
    
            // set flags in case of blank reponse or no result.
            this.showLoader    = false;
            this.showNoRecords = true;
            this.showResult    = false;
    
          }
        }.bind(this))
       
      });

      this.callHttpGet.makeRequest_getAreawiseLatestBill(this.postRequestObject).subscribe(response => {

        this.gzipService.makeRequest_uncompress(response).then(function(result) {

        console.log('response',result);
        this.billDetails = result.billSummary
        console.log('this.billDetails',this.billDetails)
        this.subscriptions = result.stb_details
        console.log(this.subscriptions);

        let customerNoList = [];
        let Result = [];
        let ResulstList = [];

        this.billDetails.map(item => {
          return {
              customer_number : item.customer_number
          }
        
        }).forEach(item => customerNoList.push(item));

        console.log('customerNoList:',customerNoList);
        
        let subscriptionLists =  this.subscriptions;
        console.log('subscriptionLists:',subscriptionLists);
       
        _.forEach(customerNoList, function(value, key) {
       
          console.log('value',value);

          Result = _.filter(subscriptionLists, function(obj) { 
           
            return obj.customer_number == value.customer_number;
          });
          console.log('Result',Result);

          ResulstList.push(Result);
         
        })
        this.resultArray = ResulstList;
        console.log('ResulstList',this.resultArray);
      }.bind(this))
    })
      // ~ End  -----------------------------------------------------------------------------------------
    
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
    let newData: any[] = this.customerReportList_obj;
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
 
  clearAreaNameField() {

    this.customerListReportFilters.controls['area_name'].setValue('');
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


  // --  @details :  getCustomerNumber (param)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

    getCustomerNumber(custNumvalue,fullname) {

      this.loadProformaInvoice=false;
      this.customerNumber = custNumvalue;
      this.shareCustomerObject.customerNumber = custNumvalue;
      this.shareCustomerObject.customerName = fullname;

      this.dataExchange.pushExchangeData(this.shareCustomerObject);
      // console.log('customerNumber',this.customerNumber);
      
      this.loadComponentStatus = true;
      this.selectedTabIndex = 0;
      this.loadBarcode=false;

    }
 //  ~ End  ----------------------------------------------------------------------------------------------------
 LoadBarcode(){
  this.loadBarcode=true;
}


  // --  @details : exportData()#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  exportData() {
  
    if(this._customerReportList) {

      this._customerReportList.map(item => {
        return {
            customer_id : item.customer_id,
            name: item.full_name,
            phone: item.phone,
            area_name: item.area_name,
            address1: item.address1,
            city: item.city,
            customer_status: item.customer_status,
            debit_till_date: item.debit_till_date,
            credit_till_date: item.credit_till_date,
            available_balance: item.available_balance,
            balance_status: item.balance_status,
            stb_cnt: item.stb_cnt,
            stb_cstb_vc_numbernt: '`' + item.stb_vc_number,
            stb_number: '`' + item.stb_number,
        }
      }).forEach(item => this.exportColumnsData.push(item));
      console.log('exported data',this.exportColumnsData);
      
      const options = { 
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalseparator: '.',
        showLabels: true,
        showTitle: false,
        useBom: false,
        headers: [
          'Customer Id',
          'Full Name',
          'Phone Number',
          'Area Name',
          'Address',
          'City',
          'Customer Status',
          'Debit_Till_Date',
          'Credit_Till_Date',
          'Available Balance',
          'Balance Status',
          'STB Count',
          'VC Number',
          'STB Number'
        ]
      };


      new Angular2Csv(this.exportColumnsData, 'Customers_List', options);
    }
  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

  
// --  @details : EditcustomerLink()#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  NavigatePaymentLink(link,value) 
  {
   console.log('EditcustomerLink');
   let navigationExtras: NavigationExtras = {
     queryParams: {
         "id": value,
         "Source": "customerreport"
     }
 };
 console.log('navigationExtras',navigationExtras);
if(link != ''){
 this.router.navigate([link], navigationExtras);
}
 }


  //  ~ End  ----------------------------------------------------------------------------------------------------

  LoadProformaInvoice(){

    this.loadProformaInvoice=true;
    // $('#modal-ProformaInvoice').modal('close');
  }
  

  DownloadPDF()
  {
    var doc = new jsPDF('p','pt','a4');

    for (this.subscription of this.resultArray)
    {
     
      console.log(this.subscription)

      this.vcNumber = this.subscription.map(function (obj){
        return obj.stb_vc_number;
      });
      console.log('this.vcNumber',this.vcNumber)


      this.stbNumber = this.subscription.map(function (obj){
        return obj.stb_number;
      });
      console.log('this.stbNumber',this.stbNumber)

      console.log('this.billDetails',this.billDetails);
      let CustomerObj;
      let billDetailsArray=this.billDetails;

      _.forEach(this.subscription, function(value, key) {
       
        console.log('value',value);

        CustomerObj = _.filter(billDetailsArray, function(obj) { 
           
          return obj.customer_number == value.customer_number;
        });
        console.log('CustomerObj inside',CustomerObj);

       
      })
      console.log('CustomerObj Outside',CustomerObj[0]);

      this.bill_date= moment(CustomerObj[0].bill_date).format('DD-MMM-YYYY')
      // var invoice_date = moment(this.bill_date).subtract('months',1).format('DD-MMM-YYYY')
      

        this.month = moment(CustomerObj[0].bill_date).format('MMM YYYY');
        var bill_month = moment(this.month).subtract('months',1).format('MMM YYYY')
        this.due = this.owner_meta_Json.due_date + this.dueDate
     
    
      this.subscriptionSummary=[];
      this.subscriptionSummary.push(this.subscription);
      console.log('this.subscriptionSummary', this.subscriptionSummary)
      
      doc.setLineWidth(1.5)
      doc.rect(5,5,584,820)
      doc.rect(5,5,584,10, 'F')
      doc.setFontSize(18)
      var text = `${this._userProfileData.ownerDetails.owner_company_name}`
      doc.text(text,20,55);
    
      doc.setFontSize(20);
      doc.setFontType('bold')
      doc.text('INVOICE',485,46)
      doc.setFontSize(12)
      doc.text('Address :',20,95)
      doc.setFontType('normal')
      var text1 = `${this._userProfileData.ownerDetails.owner_company_address}`
      var line = doc.splitTextToSize(text1,190)
      doc.text(line,20,110);
      doc.setFontType('bold')
      doc.text('Phone :',20,75);
      doc.setFontType('normal')
      doc.text(`${this._userProfileData.ownerDetails.owner_phone}`,67,75)
      doc.setFontType('bold')
      doc.text('Invoice#',380,85)
      doc.text('Invoice Date:',380,105)
      if(this.owner_meta_Json.enable_gst === "Y")
      {
      doc.text('GSTIN#',380,125)
      doc.setFontType('normal')
      doc.text(`${this.owner_meta_Json.gstin_number}`,475,125)
      }
      doc.setFontType('normal')
      doc.text(`${CustomerObj[0].invoice_id}`,475,85)
      doc.text(`${this.bill_date }`,475,105)

      doc.rect(20,165,230,20, 'F')
      doc.rect(310,165,263,20, 'F')
      doc.setTextColor(255,255,255)
      doc.setFontType('normal')
      doc.text('Bill To',25,179)
      doc.text('Details',315,179)

      doc.setFontType('bold')
      doc.setTextColor(0,0,0)
      doc.text(`${CustomerObj[0].full_name}`, 25, 200)
      doc.text('Phone :',25,216);
      doc.setFontType('normal')
      doc.text(`${CustomerObj[0].phone}`,72,216)
      this.customer_meta_Json = JSON.parse(CustomerObj[0].customer_meta_value)
      console.log('this.customer_meta_Json',this.customer_meta_Json)
      if(this.customer_meta_Json.GSTIN != "" && this.customer_meta_Json.GSTIN != null && this.customer_meta_Json.GSTIN != 'null')
      {
        doc.setFontType('bold')
        doc.text('GSTIN :',25,232) 
        doc.setFontType('normal')
        doc.text(`${this.customer_meta_Json.GSTIN}`,72,232)
      }
      doc.setFontType('bold')
      doc.text(`Address :`,25, 248)
      doc.setFontType('normal')
      var text2 = `${CustomerObj[0].address1}`
      var lines = doc.splitTextToSize(text2, 190)
      doc.text(lines,25, 263)
      doc.setFontType('bold')

      doc.setFontType('bold')
      doc.text(`Customer ID:`,315,200)
      doc.text(`Bill Month:`,315,216)
      // console.log(this.dueDate)
      if(this.owner_meta_Json.due_date != "" && this.owner_meta_Json.due_date != "null" && this.owner_meta_Json.due_date != null ){
        doc.text(`Due Date:`,315,231)
        doc.setFontType('normal')
        doc.text(`${this.due}`,409,231)
      }
      doc.setFontType('bold')
      doc.text('VC Number:', 315, 247)
      for(var vcno of this.vcNumber){
        console.log('outvcno',vcno)
        if( vcno != "None" && vcno != "null" && vcno != null && vcno != "none"){
          console.log('vcno',vcno)
          this.vcNoList.push(vcno)
          console.log(this.vcNoList)
        }
      }
      if(this.vcNoList.length > 1)
      {
        doc.setFontType('normal')
        this.vcNum = this.vcNoList.slice(0,1)
        this.vcNumbers = this.vcNum.concat('...')
        var vc = `${this.vcNumbers}`
        var line3 = doc.splitTextToSize(vc,128)
        doc.text(line3,410,247)
      }
      else{
        doc.setFontType('normal')
        var vc = `${this.vcNoList}`
        var line3 = doc.splitTextToSize(vc,128)
        doc.text(line3,410,247)
      }
      this.vcNoList = []

      doc.setFontType('bold')
      doc.text('STB Number:', 315, 263)
      for(var stbno of this.stbNumber){
        console.log('outstbno',stbno)
        if( stbno != "None" && stbno != "null" && stbno != null && stbno != "none"){
          console.log('indstbno',stbno)
          this.stbNumberList.push(stbno)
          console.log(this.stbNumberList)
        }
      }
      console.log(this.stbNumberList)

      if(this.stbNumberList.length > 1)
      {
          doc.setFontType('normal')
          this.stb = this.stbNumberList.slice(0,1)
          console.log(this.stb)
          this.stbNum = this.stb.concat('...')
          var text2 = `${this.stbNum}`
          var line2 = doc.splitTextToSize(text2,128)
          doc.text(line2,410,263)  
      }
      else{
            doc.setFontType('normal')
            var text2 =`${this.stbNumberList}`
            var line2 = doc.splitTextToSize(text2,128)
            doc.text(line2,410,263)
      }
      this.stbNumberList = [];
      doc.setFontType('normal')
      doc.text(`${CustomerObj[0].customer_id}`,410, 200)
      doc.text(`${bill_month}`,410,216)

      doc.setLineWidth(0.5)
      doc.line(20, 295, 571, 295)
      doc.setFontSize(18);
      doc.setFontType('bold')
      doc.text('INVOICE TOTAL',25,320)
      doc.text(`Rs. ${CustomerObj[0].collection_amount_original.toFixed(2)}`,520,320,null,null,'right')
      doc.line(20,332,571,332)


      var data = this.subscription;
      console.log('data',data)
      var columns = [
        { title:"Description",dataKey:"subscription_name"},
        { title:"Amount",dataKey:"total_amount"}
      ]
      console.log('data',data);
      let index=0;
      var res = doc.autoTable(columns, data,{startX:250,startY: 368,theme:'grid',
      columnStyles: { subscription_name:{columnWidth:320},total_amount:{columnWidth: 195,halign:'right'}},
      headerStyles:{fillColor: [0, 0, 0],halign:'center',fontSize: 12},
      addPageContent : function (data){}});
      let first = doc.autoTable.previous.finalY;
      doc.rect(430,first,125,20)
      doc.rect(430,first+20,125,20)
      doc.rect(430,first+40,125,20)
      doc.rect(430,first+60,125,20)
      doc.rect(430,first+80,125,20)
      doc.rect(430,first+100,125,20)
      doc.setFontType('normal')
      doc.setFontSize(10)
      doc.text(`${CustomerObj[0].rent_amount.toFixed(2)}`,550,first+14,null,null,'right')
      doc.text(`${CustomerObj[0].cgst_total.toFixed(2)}`,550,first+34,null,null,'right')
      doc.text(`${CustomerObj[0].sgst_total.toFixed(2)}`,550,first+54,null,null,'right')
      doc.text(`${CustomerObj[0].bill_amount.toFixed(2)}`,550,first+74,null,null,'right')
      doc.text(`${CustomerObj[0].rebate_amount.toFixed(2)}`,550,first+94,null,null,'right')
      doc.text(`${CustomerObj[0].previous_due.toFixed(2)}`,550,first+114,null,null,'right')
      doc.setFontSize(11)
      doc.text('Sub Total',377,first+14)
      doc.text('CGST[9%]',372,first+34)
      doc.text('SGST[9%]',372,first+54)
      doc.text('Monthly Charge',348,first+74)
      doc.text('Rebate Amount',349,first+94)
      doc.text('Previous Due',359,first+114)
      doc.setFontSize(15);
      doc.setFontType('bold')
      doc.text('Total',385,first+140)
      doc.setFillColor(0, 0, 0)
      doc.rect(429.5,first+120,125.5,30,'F')
      doc.setTextColor(255,255,255)
      doc.text(`${CustomerObj[0].collection_amount_original.toFixed(2)}`,550,first+140,null,null,'right')
    

      doc.rect(40,first+40,250,110)
      if(this.owner_meta_Json.udf1 != ""&& this.owner_meta_Json.udf1 != "null" && this.owner_meta_Json.udf1 != null)
      {
        if(this.owner_meta_Json.udf2 != "" && this.owner_meta_Json.udf2 != "null" && this.owner_meta_Json.udf2 != null)
        {
          doc.setFontSize(10);
          doc.setFontType('normal')
          doc.setTextColor(0,0,0)
          doc.rect(40,first+120,250,15)
          doc.text(`${this.owner_meta_Json.udf1}`,45,first+131)
          doc.rect(40,first+135,250,15)
          doc.text(`${this.owner_meta_Json.udf2}`,45,first+147)
        }
      }
      doc.setFillColor(0, 0, 0)
      doc.rect(40,first+24,250,20,'F')
      doc.setFontSize(12);
      doc.setFontType('bold')
      doc.setTextColor(255,255,255)
      doc.text('Comments',45,first+38)

      // doc.setDrawColor(0, 0, 0)
      // doc.setLineWidth(1.0)
      // doc.line(151, 610, 222, 640)
      // doc.line(140, 640, 210, 680)
      // doc.setLineWidth(5.0)
      // doc.circle(180, 640, 50)
      // doc.setLineWidth(2.0)
      // doc.circle(180, 640, 40)

      if(CustomerObj[0].collection_amount === 0)
      {
      var image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANUAAABKCAMAAAAbruEnAAADAFBMVEVHcEz/iYn/gID/gYH/goL/gID/gID/AAD/h4f/qqr/gID/gID/gID/mZn/gID/gID/gID/g4P/goL/gID/gID/gID/gID/iIj/gID/gID/i4v/gID/gID/gID/g4P/gID/gID/gID/hob/jo7/gID/gID/gID/gYH/gID/gYH/g4P/gID/gID/gID/gID/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/goL/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gID/kpL/gID/gID/gID/gID/hIT/gID/goL/hob/gID/gID/gID/gID/gID/hIT/gID/gID/gID/gID/gID/hIT/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/g4P/gID/gID/gID/gID/gID/gYH/gYH/gID/gID/gID/goL/gID/gID/goL/gID/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gYH/gID/gID/gID/gID/goL/gID/gID/gID/gID/gID/gID/gID/gYH/gID/gYH/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gID/hYX/gYH/gID/gYH/gID/gID/gID/gID/gID/gYH/gID/gID/gID/gID/gYH/gID/gID/gID/gID/gID/goL/gID/gID/gID/g4P/gYH/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gID/gYH/gID/goL/gID/gID/gID/gID/gID/gID/gID/goL/hYX/gID/gID/gID/gID/gID/gID/goL/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gYH/gID/gID/gID/gIBfxqbjAAAA/3RSTlMADcxVM/4CAREDZpnuBf1EUiMtxafyBA/JagvYQN0p0N98FQmc/I11qUMnVKO3DEiIdygy+oJQXjo1ip5ZsvsY0QYiPItfTlgsRxpwCgeU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"
      doc.addImage(image, 'PNG', 110, 600, 120, 50);
      }
      
      doc.setFontSize(15);
      doc.setFontType('normal')
      doc.setTextColor(0,0,0)
      doc.setDrawColor(0,0,0)
      doc.line(20, 790, 571, 790)
      doc.text('Thank You',258,814)
      doc.setFontSize(8);
      doc.setFontType('normal')
      doc.text('**This is a computer generated invoice and does not require any signature',25,837)

      doc.addPage('p','pt','a4')
    }
  // }
      doc.save(this.PrintAreaName+'_InvoiceList.pdf');
    }


    Active(){
      console.log('Active');
    }




Generatepdf()
{
var pdf = new jsPDF('p', 'pt', 'a4');
var pageHeight= pdf.internal.pageSize.height;
console.log(pageHeight)
var y = pageHeight-800;
var x = 95
var xAxis = 155
for(var customerID of this._customerReportList)
{
console.log(customerID.customer_id)
JsBarcode("#barcode", `${customerID.customer_id}`, { height: 25});
let canvas = document.getElementById('barcode') as HTMLCanvasElement;
console.log(canvas);
let dataURL = canvas.toDataURL("image/jpeg");
pdf.addImage(dataURL, 'JPEG', x, y, 120, 70);
pdf.setFontSize(12);
pdf.text(`${customerID.full_name}`,xAxis,y,null,null,'center')
pdf.rect(30, y-20,250,88 )
pdf.rect(315, y-20,250,88 )
console.log(y)
x = x+ 285
xAxis = xAxis + 286
if( x > 440){
x = 95
xAxis = 155
y = y + 100
}
if(y >= pageHeight){
console.log("New Page")
pdf.addPage('p','pt','a4')
y = pageHeight - 800
}
}
pdf.save("Barcode.pdf")
}

  
}
// -------------------  Component & Class Definition - End ---------------------------------------------
