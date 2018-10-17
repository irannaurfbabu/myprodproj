
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
  selector: "app-me-collection-report-new",
  templateUrl: "./me-collection-report-new.component.html",
  styleUrls: ["./me-collection-report-new.component.css"]
})
export class MeCollectionReportNewComponent implements OnInit {
  // -- @details : Class variable declaration ################################################################
  //  ~ Start_________________________________________________________________________________________________

  //-- Create Form Group
  reportFilter: FormGroup;

  //-- Create List of Fields
  area_name: AbstractControl;
  user_name: AbstractControl;
  toppings: AbstractControl;
  dateRange: AbstractControl;
  fromDate: AbstractControl;
  toDate: AbstractControl;

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  showLoader: boolean = true;
  showLoader1: boolean = true;
  showNoRecords: boolean = false;

  _agentwiseSummaryList: any = [];
  _agentwiseSummaryTotal: any = {
    count :0,
    amount : 0
  };
 

  filteredAreas: Observable<any[]>;
  filteredUsers: Observable<any[]>;

  dateRangeList = [
    {value: 'today', viewValue: 'Today'},
    {value: 'yesterday', viewValue: 'Yesterday'},
    {value: 'last_5_days', viewValue: 'Last 5 Days'},
    {value: 'last_7_days', viewValue: 'Last 7 Days'},
    {value: 'this_month', viewValue: 'This Month'},
    {value: 'custom', viewValue: 'Custom'}
  ];

  reportCols: any[];

  // function to open left side navgivation bar
  _opened: boolean = false;

  fileCurrentDate: number = Date.now();
  exportFileName :any = "collectionReport_";

  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput: any = "";
  private _userProfileData: any;
  private _userLogin: any;
  private _collectionReportList: any[] = [];
  private _areaList: any = [];
  private _userList: any = [];
  private reportValuesJSON: any = null;
  private area_id: any;
  private user_id: any;
  

  private _collectionList: any;
  public collectionListArray: any = [];
  private collectionListSummary: any = [];
 

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

  public fromDateDisplay: any;
  public toDateDisplay: any;

  private reportDate = new Date().toString();
  private getCollectionListAPI_Input: any   = {
    records: [
      {
        area_id  : "",
        user_id  : "",
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
      area_name: [""],
      user_name: [""],
      toppings: [""],
      dateRange: ["Today"],
      fromDate: [""],
      toDate: [""]
    });

    // -- Set min and max dates for the Calendar - Custom Drop down
    this.currentDate = new Date();
    this.sixMonths = new Date();
    this.sixMonths.setMonth(this.sixMonths.getMonth() - 6);
    this.minDate = this.sixMonths;
    this.maxDate = this.currentDate;

    // Controls are used in me-collection-report.component.html for accessing values and checking functionalities
    this.area_name = this.reportFilter.controls["area_name"];
    this.user_name = this.reportFilter.controls["user_name"];
    this.toppings = this.reportFilter.controls["toppings"];
    this.dateRange = this.reportFilter.controls["dateRange"];
    this.fromDate = this.reportFilter.controls["fromDate"];
    this.toDate = this.reportFilter.controls["toDate"];

    // Subscribe for Date Range changes
    // ~ Start -- pack price changes ------------------------------------------------
    this.dateRange.valueChanges.subscribe((value: string) => {
     
      if (value) {
        
        if (value === "custom") {
          // enable date picker
          this.datePickerDisableFlag = false;

          this.reportFilter.controls["fromDate"].setValue(null);
          this.reportFilter.controls["toDate"].setValue(null);
        } else {
          // disable date picker
          this.datePickerDisableFlag = true;

          // auto calculate from and to date values
          this.calculateDate.calculateDateRange(value);

          // assign caculated values to fields
          this.reportFilter.controls["fromDate"].setValue(
            this.calculateDate.from_date.toDate()
          );

          this.reportFilter.controls["toDate"].setValue(
            this.calculateDate.to_date.toDate()
          );
        }
      }
    });
    // -~  End -------------------------------------------------------------------------

    // Subscribe for Area changes to get area_id
    // ~ Start -- Area_name changes ------------------------------------------------
    this.area_name.valueChanges.subscribe((value: string) => {

      for (let area in this._areaList) {
        if (this._areaList[area].area_name === value) {
          this.area_id = this._areaList[area].area_id;
        }
      }
      
    });
    // ~End --------------------------------------------------------------------------

    // Subscribe for user_name changes to get user_id
    // ~ Start -- user_name changes ------------------------------------------------
    this.user_name.valueChanges.subscribe((value: string) => {

      for (let user in this._userList) {
        if (this._userList[user].user_name === value) {
          this.user_id = this._userList[user].user_id;
        }
      }
      
    });
    // ~End --------------------------------------------------------------------------
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
      { field: 'full_name', header: 'Customer Name', width: '150' },
      // { field: 'phone', header: 'Phone', width: '10%' },
      { field: 'address1', header: 'Address' ,width: '120' },
      { field: 'area_name', header: 'Area' , width: '150' },
      { field: 'payment_amount', header: 'Payment Amount' , width: '120'  },
      { field: 'payment_date', header: 'Payment  Date',  width: '150'  },
      { field: 'user_name', header: 'Agent'  ,  width: '150'},
      { field: 'mode_of_payment_desc', header: 'Payment Mode' ,  width: '120'   },
      { field: 'payment_type_desc', header: 'Payment Action' ,  width: '120'   },
      { field: 'comments', header: 'Remarks' ,  width: '120'   },
      { field: 'subscription_name', header: 'Subscription' ,  width: '200'  },
      { field: 'stb_number', header: 'STB Number' ,  width: '200'  },
      { field: 'stb_vc_number', header: 'VC Number' ,  width: '200'  },
      { field: 'service_status', header: 'Status' ,  width: '120'   },
     
  ];    


   // ~ Assigning datepicker values as default today's date -----------------------------------------------
  // disable date picker
  this.datePickerDisableFlag = true;

  // auto calculate from and to date values
  this.calculateDate.calculateDateRange("today");

  // assign caculated values to fields
  this.reportFilter.controls["fromDate"].setValue(this.calculateDate.from_date.toDate());
  this.reportFilter.controls["toDate"].setValue(this.calculateDate.to_date.toDate());
  this.reportFilter.controls["dateRange"].setValue("today");


    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.reportPersistenceService.get("userLogin",StorageType.SESSION);

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.reportPersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );

    // make call to get user profile details
    //  ~ Start  ---------------------------------------------------------------------------------
    this.userProfileService
      .makeRequest_UserProfile(this._userLogin)
      .subscribe(response => {
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
        this.callHttpGet
          .makeRequest_GetArea(this.getRequestInput)
          .subscribe(response => {
            this.gzipService.makeRequest_uncompress(response).then(
              function(result) {
                this._areaList = result.areaList;
              }.bind(this)
            );
          });
        //  ~ End ________________________________________________________________________________________

        // make call for retrieving User List
        //  ~ Start  -----------------------------------------------------------------------------------------

        this.callHttpGet
          .makeRequest_ManageUser(this.getRequestInput)
          .subscribe(response => {
            this.gzipService.makeRequest_uncompress(response).then(
              function(result) {
                this._userList = result.usersList;
              }.bind(this)
            );
          });

        //  ~ End  ---------------------------------------------------------------------------------------------

        // set report api object values  
        this.getCollectionListAPI_Input.records[0].fromDate = moment(this.calculateDate.from_date.toDate()).format("YYYY-MM-DD H:mm:ss");
        this.getCollectionListAPI_Input.records[0].toDate = moment(this.calculateDate.to_date.toDate()).format("YYYY-MM-DD H:mm:ss");
        this.getCollectionListAPI_Input.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
        this.getCollectionListAPI_Input.records[0].submitted_by = this._userProfileData.userDetails.user_name;
        this.getCollectionListAPI_Input.records[0].submitted_by_id = this._userProfileData.userDetails.user_id;
        this.getCollectionListAPI_Input.records[0].comments =  this._userProfileData.userDetails.user_name +
        " submitted collection report " + " on " + this.reportDate;;
          
        this.fromDateDisplay = this.calculateDate.from_date.toDate();
        this.toDateDisplay = this.calculateDate.to_date.toDate();

        console.warn(
          "%c ___________________________ getRequestInput ___________________________",
          "background: #9fa8da;color: black; font-weight: bold;"
        );

        console.log(this.getCollectionListAPI_Input);

        // make call for retrieving Collection List
        //  ~ Start  -------------------------------------------------------------------------------------------------
        this.callHttpGet
        .makeRequest_getCollectionListReport(this.getCollectionListAPI_Input)
        .subscribe(response => {
          this.gzipService.makeRequest_uncompress(response).then(
            function(result) {
              this._collectionList = result;
  
              //
              this.collectionListArray = this._collectionList.collectionList;
              this._agentwiseSummaryList = this._collectionList.CollectionSummaryUserWise;

              console.log("----- Collection Log -----");
              console.log(result);
  
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
 
   // set report api object values  
   this.getCollectionListAPI_Input.records[0].fromDate = moment(this.reportValuesJSON.fromDate).format('YYYY-MM-DD H:mm:ss'); 
   this.getCollectionListAPI_Input.records[0].toDate = moment(this.reportValuesJSON.toDate).endOf('date').format('YYYY-MM-DD H:mm:ss');
   this.getCollectionListAPI_Input.records[0].dateRange = this.reportValuesJSON.dateRange;
   this.getCollectionListAPI_Input.records[0].area_id = this.area_id;
   this.getCollectionListAPI_Input.records[0].user_id = this.user_id;
   this.getCollectionListAPI_Input.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
   this.getCollectionListAPI_Input.records[0].submitted_by = this._userProfileData.userDetails.user_name;
   this.getCollectionListAPI_Input.records[0].submitted_by_id = this._userProfileData.userDetails.user_id;
   this.getCollectionListAPI_Input.records[0].comments =  this._userProfileData.userDetails.user_name +
   " submitted collection report " + " on " + this.reportDate;;
     
   this.fromDateDisplay = this.reportValuesJSON.fromDate;
    this.toDateDisplay = this.reportValuesJSON.toDate;
   

   console.warn(
     "%c ___________________________ getRequestInput ___________________________",
     "background: #9fa8da;color: black; font-weight: bold;"
   );

   console.log(this.getCollectionListAPI_Input);

   // make call for retrieving Collection List
   //  ~ Start  -------------------------------------------------------------------------------------------------
   this.callHttpGet.makeRequest_getCollectionListReport(this.getCollectionListAPI_Input).subscribe(response => {
     this.gzipService.makeRequest_uncompress(response).then(
       function(result) {
         this._collectionList = result;

         //
         this.collectionListArray = this._collectionList.collectionList;
         this._agentwiseSummaryList = this._collectionList.CollectionSummaryUserWise;
         this.calculateAgentSummaryTotals(this._agentwiseSummaryList);

        //  console.log("----- Collection Log -----");
        //  console.log(JSON.stringify(result));

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
    
  }

  filterAreas(areaValue: string) {

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
     
  }

  filterUsers(userValue: string) {

    return this._userList.filter(
      user =>
        user.user_name.toLowerCase().indexOf(userValue.toLowerCase()) === 0
    );
  }

  // ~ End ----------------------------------------------------------------

  // ~ Start ---------------------------------------------------------------
  clearAgentNameField() {
    this.reportFilter.controls["user_name"].setValue("");
    this.user_id = "";
  }

  clearAreaNameField() {
    this.reportFilter.controls["area_name"].setValue("");
    this.area_id = "";
  }
  // ~ End ---------------------------------------------------------------


  onLinkClick(event: MatTabChangeEvent) {
    console.log('event => ', event);
    console.log('index => ', event.index);
    console.log('tab => ', event.tab);

    if(event.index == 1) {
      this.calculateAgentSummaryTotals(this._agentwiseSummaryList);
    } 
   
  }


  calculateAgentSummaryTotals(p_collectionSummaryArray) {

    let agentsArray = p_collectionSummaryArray;
    let countList =  _.toArray(_.mapValues(agentsArray, 'count'))
    let countTotal =  _.sum(countList);

    let receivedList =  _.toArray(_.mapValues(agentsArray, 'received_amt_total'))
    let receivedTotal =  _.sum(receivedList);

    console.log(" **** Agents Total **** ");
    console.log(countTotal);
    console.log(receivedTotal);

    this._agentwiseSummaryTotal.count = countTotal;
    this._agentwiseSummaryTotal.amount = receivedTotal;

  } 



  // calculateAgentSummary(p_collectionListArray) {
    
  //   this.showLoader1    = true;
  //   console.log("--- Array --- ");
  //   console.log(p_collectionListArray);

  //   // declare variables
  //   let agentsArray = [];
  //   let agentObjIndex;


  //   _.forEach(p_collectionListArray, function(obj) {

    
  //     if(agentsArray.length == 0 ){

  //       let agentwiseSummaryObj = {
  //           agentName            : null,
  //           count                : 0,
  //           received_amt_total   : 0,
  //       };

  //       agentwiseSummaryObj.agentName            = obj.user_name;
  //       agentwiseSummaryObj.count                = 1;
  //       agentwiseSummaryObj.received_amt_total   = parseInt(obj.payment_amount) | 0;
     
  //       // add the value to array
  //       agentsArray.push( agentwiseSummaryObj);
  //     }
  //     else if( agentsArray.length > 0 ){
        
  //       // find the user in array and return the index if the user value is already present in the array
  //       agentObjIndex = _.findIndex(agentsArray, function(o) { 
  //         return o.agentName == obj.user_name;
  //       });

  //       if(agentObjIndex >= 0 ){

  //         agentsArray[agentObjIndex].count                += 1;
  //         agentsArray[agentObjIndex].received_amt_total   += parseInt(obj.payment_amount) | 0 ;
        
  //       }
  //       else if(agentObjIndex == -1 ){
      
  //         let agentwiseSummaryObj = {
  //           agentName            : null,
  //           count                : 0,
  //           received_amt_total   : 0,
  //       };

  //           agentwiseSummaryObj.agentName            = obj.user_name;
  //           agentwiseSummaryObj.count                = 1;
  //           agentwiseSummaryObj.received_amt_total   = parseInt(obj.payment_amountpayment_amount) | 0;

  //         // add the value to array
  //         agentsArray.push( agentwiseSummaryObj);

  //       }  


  //     }

      
  //   });

  // console.log(" **** Agents Array **** ");
  // console.log(agentsArray);

  // this._agentwiseSummaryList = agentsArray;

  // let countList =  _.toArray(_.mapValues(agentsArray, 'count'))
  // let countTotal =  _.sum(countList);

  // let receivedList =  _.toArray(_.mapValues(agentsArray, 'received_amt_total'))
  // let receivedTotal =  _.sum(receivedList);

  // console.log(" **** Agents Total **** ");
  // console.log(countTotal);
  // console.log(receivedTotal);

  // this._agentwiseSummaryTotal.count = countTotal;
  // this._agentwiseSummaryTotal.amount = receivedTotal;

  // this.showLoader1    = false;

  // }

}
