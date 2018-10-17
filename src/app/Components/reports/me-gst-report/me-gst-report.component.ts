// Import Angular Core Libraries/Functionalities/Services
import { Component, OnInit, NgZone } from "@angular/core";
import { FormBuilder, FormGroup, AbstractControl } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { startWith } from "rxjs/operators/startWith";
import { map } from "rxjs/operators/map";
import { Observable } from "rxjs/Observable";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "./../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "./../../../Service/me-user-profile.service";
import { StorageType } from "./../../../Service/Interfaces/storage-type.enum";
import { MeCalculateDateService } from "./../../../Service/me-calculate-date.service";
import { MeGzipService } from "../../../Service/me-gzip.service";

// Import third party Libraries/Functionalities/Services
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatTabChangeEvent } from '@angular/material';
import {MatDividerModule} from '@angular/material/divider';
import {MatTabsModule} from '@angular/material/tabs';
import {PaginatorModule} from 'primeng/paginator';
import { TableModule } from "primeng/table";
import { PersistenceService } from "angular-persistence";
import * as moment from "moment";
import { Angular2Csv } from "angular2-csv/Angular2-csv";
import * as _ from "lodash";


@Component({
  selector: 'app-me-gst-report',
  templateUrl: './me-gst-report.component.html',
  styleUrls: ['./me-gst-report.component.css']
})
export class MeGstReportComponent implements OnInit {
// -- @details : Class variable declaration ################################################################
  //  ~ Start_________________________________________________________________________________________________

  //-- Create Form Group
  reportFilter: FormGroup;

  //-- Create List of Fields
  toppings: AbstractControl;
  dateRange: AbstractControl;
  fromDate: AbstractControl;
  toDate: AbstractControl;

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  showLoader: boolean = true;
  showLoader1: boolean = true;
  showNoRecords: boolean = false;

 
  dateRangeList = [
    {value: 1, viewValue: 'January'},
    {value: 2, viewValue: 'February'},
    {value: 3, viewValue: 'March'},
    {value: 4, viewValue: 'April'},
    {value: 5, viewValue: 'May'},
    {value: 6, viewValue: 'June'},
    {value: 7, viewValue: 'July'},
    {value: 8, viewValue: 'August'},
    {value: 9, viewValue: 'September'},
    {value: 10, viewValue: 'October'},
    {value: 11, viewValue: 'November'},
    {value: 12, viewValue: 'December'}
  ];

  reportCols: any[];

  // function to open left side navgivation bar
  _opened: boolean = false;

  fileCurrentDate: number = Date.now();
  exportFileName :any = "gstReport_";

  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput: any = "";
  private _userProfileData: any;
  private _userLogin: any;
  private reportValuesJSON: any = null;
  private _gstReport: any;
  private _gstMonth: string;
  private GSTMonthList:any = [];
  public  MonthList:any = [];

  public collectionListArray: any = [];
  public currentDate: Date;
  public minDate: Date;
  public maxDate: Date;
  public sixMonths: Date;
  public from_date_value: Date;
  public to_date_value: Date;
  public fromDate_value: Date;
  public datePickerDisableFlag: boolean = true;
  public showResult: boolean = false;
  public lastDayOfWeek: any;
  public firstDayOfWeek: any;
  public from_date: any;
  public to_date: any;

  public fromDateDisplay: any;
  public toDateDisplay: any;

  private reportDate = new Date().toString();
  private getCollectionListAPI_Input: any   = {
    records: [
      {
        fromDate : "",
        toDate   : "",
        dateRange: "",
        owner_id : "",
        submitted_by : "",
        submitted_by_id : "",
        comments : "",
      }
    ]
  };

  // Constructor  ###########################################################################
  //  ~ Start - constructor__________________________________________________________________
  constructor(
    fb: FormBuilder,
    public callHttpGet: MeCallHttpGetService,
    public userProfileService: MeUserProfileService,
    private reportPersistenceService: PersistenceService,
    private calculateDate: MeCalculateDateService,
    public datepipe: DatePipe,
    private gzipService: MeGzipService  
  ) {
    this.reportFilter = fb.group({
      dateRange: [""],
      fromDate: [""],
      toDate: [""]
    });

    this.dateRange = this.reportFilter.controls["dateRange"];
    this.fromDate = this.reportFilter.controls["fromDate"];
    this.toDate = this.reportFilter.controls["toDate"];

    // Subscribe for Date Range changes
    // ~ Start -- pack price changes ------------------------------------------------
    this.dateRange.valueChanges.subscribe((value: any) => {
     
      if (value) {
        let month=1*value;
        month=month-1;

        console.log("month number:",month);

          // calculate from date
          this.from_date = moment().month(month).startOf('month');
          
          //calculate to date
          this.to_date =  moment().month(month).endOf('month');

          // assign caculated values to fields
          // this.reportFilter.controls["fromDate"].setValue(
          //   this.from_date
          // );

          // this.reportFilter.controls["toDate"].setValue(
          //   this.to_date
          // );
      }
    });
    // -~  End -------------------------------------------------------------------------

  }

  //  ~ End - constructor_______________________________________________________________________


 // Local Functions  ###########################################################################
 //  ~ Start - ngOnInit _______________________________________________________________________
  ngOnInit() {

    //initialize loader
    this.showLoader    = true;
    this.showLoader1    = true;
    this.showNoRecords = false;
    this.showResult    = false;

 
     //initialize  and set report columns
    this.reportCols = [
      { field: 'customer_id', header: 'Customer ID', width: '120'},
      { field: 'customer_name', header: 'Customer Name', width: '150' },
      // { field: 'phone', header: 'Phone', width: '10%' },
      { field: 'address1', header: 'Address' ,width: '120' },
      { field: 'AREA', header: 'Area' , width: '150' },

      { field: 'bill_date', header: 'Bill Date', width: '120'},
      { field: 'bill_period_start', header: 'Bill Period Start', width: '150'},
      { field: 'bill_period_end', header: 'Bill Period End', width: '120'},

      { field: 'invoice_no', header: 'Invoice No', width: '120'},

      { field: 'rent_amount', header: 'Rent', width: '120'},
      { field: 'cgst_total', header: 'CGST',  width: '150'  },
      { field: 'sgst_total', header: 'SGST'  ,  width: '150'},
      { field: 'tax_total', header: 'GST Total' ,  width: '120'   },
      { field: 'bill_amount', header: 'Bill Amount' , width: '120'  },
      { field: 'previous_due', header: 'Previous Due' ,  width: '120'   },
      { field: 'rebate_amount', header: 'Rebate Amount' ,  width: '120'   },
      { field: 'collection_amount_original', header: 'Collection Amount' ,  width: '120'   },
      { field: 'received_amount', header: 'Received Amount' ,  width: '120'   },
      { field: 'outstanding_balance', header: 'Avl. Balance' ,  width: '120'   },
      { field: 'subscription_name', header: 'Subscription' ,  width: '200'  },
      { field: 'stb_number', header: 'STB Number' ,  width: '200'  },
      { field: 'stb_vc_number', header: 'VC Number' ,  width: '200'  },
      { field: 'stb_count', header: 'STB Count' ,  width: '200'  }
  ];    


   // ~ Assigning datepicker values as default today's date -----------------------------------------------
  // disable date picker
  this.datePickerDisableFlag = true;
  var currentDate = new Date();
  var currentMonth = currentDate.getMonth();

  console.log('currentMonth',currentMonth);
  // if(currentMonth == 12){
  //   currentMonth = 1;
  //   this.reportFilter.controls["dateRange"].setValue(currentMonth);
  // }else{
  //   this.reportFilter.controls["dateRange"].setValue((currentMonth*1)+1);
  // }

  console.log('currentMonth2',currentMonth);



    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.reportPersistenceService.get("userLogin",StorageType.SESSION);

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

        console.log(
          "%c  Request Input : >>> ",
          "color: green; font-weight: bold;",
          this.getRequestInput
        );
       
        // set report api object values  
        this.getCollectionListAPI_Input.records[0].fromDate = moment().startOf('month').format('YYYY-MM-DD');
        this.getCollectionListAPI_Input.records[0].toDate = moment().endOf('month').format('YYYY-MM-DD');
        this.getCollectionListAPI_Input.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
        this.getCollectionListAPI_Input.records[0].submitted_by = this._userProfileData.userDetails.user_name;
        this.getCollectionListAPI_Input.records[0].submitted_by_id = this._userProfileData.userDetails.user_id;
        this.getCollectionListAPI_Input.records[0].comments =  this._userProfileData.userDetails.user_name +
        " submitted collection report " + " on " + this.reportDate;
          

        console.warn(
          "%c ___________________________ getRequestInput ___________________________",
          "background: #9fa8da;color: black; font-weight: bold;"
        );

        console.log(this.getCollectionListAPI_Input);

        // make call for retrieving Collection List
        //  ~ Start  -------------------------------------------------------------------------------------------------
        this.callHttpGet.makeRequest_getGstReport(this.getCollectionListAPI_Input).subscribe(response => {
          

          this.gzipService.makeRequest_uncompress(response).then(
            function(result) {

          this._gstReport = result;
          
          this.GSTMonthList = result.GstMonth ;
        
          _.forEach( this.GSTMonthList,(el: any) => {
            this._gstMonth=el.gst_month;
           let gstmonth=el.gst_month.slice(-2);
           
            console.log('el.slice(-2)',gstmonth);
           let monthValue=this.dateRangeList.find(obj => obj.value ==  gstmonth);
  
           
            this.MonthList.push(monthValue);
           
  
           console.log('monthList',this.MonthList);
           
          });

          // let templist=this.dateRangeList.filter()
          
          this.collectionListArray = this._gstReport.GstList;



          console.log("----- GST Log -----");
          console.log(result);
          console.log('this.collectionListArray',this.collectionListArray);
          this.showLoader    = false;
          this.showLoader1    = false;
        }.bind(this)
      );
        });

        //  ~ End ________________________________________________________________________________________

      });

    // make call for getCollectionReport
    //  ~ Start  ---makeRequest_getCollectionReport()-------------------------------------------------------------------------------

  }
 //  ~ End - ngOnInit ____________________________________________________________________________________

  // --  @details :  onSubmit ##################################################################################
  //  ~ Start -onSubmit ________________________________________________________________________________________
  
  onSubmit(value: string): void {

    // Show Loader
   this.showLoader    = true;
   this.showLoader1    = true;
   this.showResult    = false;
   this.showNoRecords = false;
   
   console.log(
     "%c Form Submitted Values ***** ----------------------------------------------------------------------- ",
     "background: #689f38;font-weight: bold;color: white; "
   );
   console.log(value);
   
   //create JSON
   this.reportValuesJSON = JSON.parse(JSON.stringify(value));
   // console.log("--------------- JSON Value ---------------");
   // console.log(this.reportValuesJSON);
   console.log('from date:',this.from_date);
 
   // set report api object values  
   this.getCollectionListAPI_Input.records[0].fromDate = this.from_date.format('YYYY-MM-DD'); 
   this.getCollectionListAPI_Input.records[0].toDate = this.to_date.format('YYYY-MM-DD');
   this.getCollectionListAPI_Input.records[0].dateRange = this.from_date.format('MM');
   this.getCollectionListAPI_Input.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
   this.getCollectionListAPI_Input.records[0].submitted_by = this._userProfileData.userDetails.user_name;
   this.getCollectionListAPI_Input.records[0].submitted_by_id = this._userProfileData.userDetails.user_id;
   this.getCollectionListAPI_Input.records[0].comments =  this._userProfileData.userDetails.user_name +
   " submitted collection report " + " on " + this.reportDate;;
     
 
    console.warn(
     "%c ___________________________ getRequestInput ___________________________",
     "background: #9fa8da;color: black; font-weight: bold;"
    );

    console.log(this.getCollectionListAPI_Input);

    // make call for makeRequest_getGstReport
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.callHttpGet.makeRequest_getGstReport(this.getCollectionListAPI_Input).subscribe(response => {
      
      this.gzipService.makeRequest_uncompress(response).then(
        function(result) {
      
      this._gstReport = result;

      //
      this.collectionListArray = this._gstReport.GstList;

      console.log("----- GST Log -----");
      console.log(response);

      this.showLoader    = false;
      this.showLoader1    = false;

      
    }.bind(this)
  );
    });

    //  ~ End ________________________________________________________________________________________

  }

  //  ~ End -onSubmit ________________________________________________________________________________________





  // Local Functions  ###########################################################################

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
