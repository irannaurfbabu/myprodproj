/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR UNPAID REPORT ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   21-MAR-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Get the data of all users for the owner
|   ++ Render the Unpaid Customers List in tabular format with ability to :-
|      ** Ability to Filter by Area
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 21-MAR-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start ________________________________________________________________________________________________
// Import Angular Core Libraries/Functionalities
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
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTabChangeEvent } from "@angular/material";
import { MatDividerModule } from "@angular/material/divider";
import { MatTabsModule } from "@angular/material/tabs";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { PersistenceService } from "angular-persistence";
import * as moment from "moment";
import { Angular2Csv } from "angular2-csv/Angular2-csv";
import * as _ from "lodash";

//  ~ End__________________________________________________________________________________________________

@Component({
  selector: "app-me-unpaid-report",
  templateUrl: "./me-unpaid-report.component.html",
  styleUrls: ["./me-unpaid-report.component.css"]
})
export class MeUnpaidReportComponent implements OnInit {
  // -- @details : Class variable declaration ################################################################
  //  ~ Start_________________________________________________________________________________________________

  //-- Create Form Group
  reportFilter: FormGroup;

  //-- Create List of Fields
  area_name: AbstractControl;
  user_name: AbstractControl;

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  showLoader: boolean = true;
  showNoRecords: boolean = false;
  showResult: boolean = false;

  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput: any = "";
  private _userProfileData: any;
  private _userLogin: any;
  private _unpaidReportList: any[] = [];
  private _areaList: any = [];
  private _userList: any = [];
  private reportValuesJSON: any = null;
  private area_id: any;
  private user_id: any;
  private customerNumber: any;
  public selectedTabIndex: number;

  filteredAreas: Observable<any[]>;
  filteredUsers: Observable<any[]>;

  userOptions: any[] = [];
  unpaidListArray: any[] = [];

  private reportCols: any[];
  private reportDate = new Date().toString();
  private getUnpaidReportAPI_Input: any = {
    records: [
      {
        area_id: "",
        owner_id: "",
        submitted_by: "",
        submitted_by_id: "",
        comments: ""
      }
    ]
  };

  // function to open left side navgivation bar
  _opened: boolean = false;
  exportFileName :any = "UnpaidReport_";
  fileCurrentDate: number = Date.now();

  //  ~ End________________________________________________________________________

  // --  @details :  constructor ##################################################
  //  ~ Start - constructor________________________________________________________

  constructor(
            fb                      : FormBuilder,
    public  callHttpGet             : MeCallHttpGetService,
    public  userProfileService      : MeUserProfileService,
    private reportPersistenceService: PersistenceService,
    private calculateDate           : MeCalculateDateService,
    public  datepipe                : DatePipe,
    private gzipService             : MeGzipService
  ) {
    /*
      @details -  Intialize the form group with fields
        ++ The fields are set to default values - in below case to - null.
        ++ The fields are assigned validators
            ** Required Validator
    */
    this.reportFilter = fb.group({
      area_name: [""]
    });

    // Controls are used in me-collection-report.component.html for accessing values and checking functionalities
    this.area_name = this.reportFilter.controls["area_name"];

    // Subscribe for Area changes to get area_id
    // ~ Start -- Area_name changes ------------------------------------------------
    this.area_name.valueChanges.subscribe((value: string) => {
      for (let area in this._areaList) {
        if (this._areaList[area].area_name === value) {
          this.area_id = this._areaList[area].area_id;
        }
      }
      console.log("area_id", this.area_id);
    });
    // ~End --------------------------------------------------------------------------

    // Subscribe for user_name changes to get user_id
    // ~ Start -- user_name changes ------------------------------------------------
    // this.user_name.valueChanges.subscribe((value: string) => {
    //   for (let user in this._userList) {
    //     if (this._userList[user].user_name === value) {
    //       this.user_id = this._userList[user].user_id;
    //     }
    //   }
    //   console.log("user_id", this.user_id);
    // });
    // ~End --------------------------------------------------------------------------
  }
  //  ~ End - constructor_____________________________________________________________________________________

  // --  @details :  ngOnInit ###############################################################################
  //  ~ Start - ngOnInit_____________________________________________________________________________________
  ngOnInit() {
    // align flags
    this.showLoader = true;
    this.showNoRecords = false;
    this.showResult = false;
    this.selectedTabIndex = 0;

       //initialize  and set report columns
    this.reportCols = [
      { field: 'customer_id', header: 'Customer ID', width: '120'},
      { field: 'full_name', header: 'Customer Name', width: '150' },
      // { field: 'phone', header: 'Phone', width: '10%' },
      { field: 'address1', header: 'Address' ,width: '120' },
      { field: 'area_name', header: 'Area' , width: '150' },
      { field: 'previous_due', header: 'Previous Due' , width: '120'  },
      { field: 'collection_amount', header: 'Collection Amount' , width: '120'  },
      { field: 'received_amount', header: 'Received Amount' , width: '120'  },
      { field: 'outstanding_balance', header: 'Oustanding Amount' , width: '120'  },
      { field: 'bill_status_desc', header: 'Bill Status' , width: '120'  },
      { field: 'subscription_name', header: 'Subscription' ,  width: '200'  },
      { field: 'stb_number', header: 'STB Number' ,  width: '200'  },
      { field: 'stb_vc_number', header: 'VC Number' ,  width: '200'  },
      { field: 'service_status', header: 'Status' ,  width: '120'   },
     
  ];    


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



        // set report api object values  
        this.getUnpaidReportAPI_Input.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
        this.getUnpaidReportAPI_Input.records[0].submitted_by = this._userProfileData.userDetails.user_name;
        this.getUnpaidReportAPI_Input.records[0].submitted_by_id = this._userProfileData.userDetails.user_id;
        this.getUnpaidReportAPI_Input.records[0].comments =  this._userProfileData.userDetails.user_name +
        " submitted collection report " + " on " + this.reportDate;;
 

        console.warn(
          "%c ___________________________ getRequestInput ___________________________",
          "background: #9fa8da;color: black; font-weight: bold;"
        );

        console.log(this.getUnpaidReportAPI_Input);

        
        // make call for makeRequest_getUnpaidReport
        //  ~ Start  ----------------------------------------------------------------------------------
        this.callHttpGet
        .makeRequest_getUnpaidReport(this.getUnpaidReportAPI_Input)
        .subscribe(response => {
          this.gzipService.makeRequest_uncompress(response).then(
            function(result) {

              
              console.log("this._unpaidReportList");
              console.log(result);
               
              this._unpaidReportList = result.unpaidReport;



              if (this._unpaidReportList.length > 0) {

                // assign reponse to table data object.
                this.unpaidListArray = this._unpaidReportList;

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
 
   
            }.bind(this)
          );
        });


       // ~ End  -----------------------------------------------------------------------------------------


      });
  }
  //  ~ End - ngOnInit_____________________________________________________________________________________

  // --  @details :  onSubmit ##################################################################################
  //  ~ Start -onSubmit ________________________________________________________________________________________

  onSubmit(value: string): void {
    // Show Loader
    this.showLoader = true;
    this.showResult = false;
    this.showNoRecords = false;

    console.log(
      "%c Form Submitted Values ***** ----------------------------------------------------------------------- ",
      "background: #689f38;font-weight: bold;color: white; "
    );
    console.log(value);

    //create JSON
    this.reportValuesJSON = JSON.parse(JSON.stringify(value));
    console.log("--------------- JSON Value ---------------");
    console.log(this.reportValuesJSON);

    // Assign Values from values to post request object
    this.getUnpaidReportAPI_Input.records[0].area_id = this.area_id;
    this.getUnpaidReportAPI_Input.records[0].user_id = this.user_id;
    this.getUnpaidReportAPI_Input.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
    this.getUnpaidReportAPI_Input.records[0].submitted_by = this._userProfileData.userDetails.user_name;
    this.getUnpaidReportAPI_Input.records[0].submitted_by_id = this._userProfileData.userDetails.user_id;
    this.getUnpaidReportAPI_Input.records[0].comments =  this._userProfileData.userDetails.user_name +
    " submitted collection report " + " on " + this.reportDate;;

    console.log(
      "%c Unpaid Post Request Object After ***** -------------------------------------------------------------------------- ",
      "background: #8bc34a;font-weight: bold;color: white; "
    );
    console.log(JSON.stringify(this.getUnpaidReportAPI_Input));

    // make call for makeRequest_getUnpaidReport
    //  ~ Start  ----------------------------------------------------------------------------------
    this.callHttpGet
        .makeRequest_getUnpaidReport(this.getUnpaidReportAPI_Input)
        .subscribe(response => {
          this.gzipService.makeRequest_uncompress(response).then(
            function(result) {

              console.log("this._unpaidReportList");
              console.log(result);

              this._unpaidReportList = result.unpaidReport;
              console.log("this._unpaidReportList", this._unpaidReportList);


              if (this._unpaidReportList.length > 0) {

                // assign reponse to table data object.
                this.unpaidListArray = this._unpaidReportList;

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
 
   
            }.bind(this)
          );
        });

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
  // -- @details : Function get UsersList for autocomplete.
  // getUsersList() {
  //   this.filteredUsers = this.user_name.valueChanges.pipe(
  //     startWith(""),
  //     map(
  //       userValue =>
  //         userValue ? this.filterUsers(userValue) : this._userList.slice()
  //     )
  //   );
  //   console.warn("----------------- filteredUsers ----------------- ");
  //   console.log("usersList", this._userList);
  //   console.warn(this.filteredUsers);
  // }

  // filterUsers(userValue: string) {
  //   console.log(
  //     "%c filterUsers ***** --------------------------------------------------- ",
  //     "background: #4caf50;font-weight: bold;color: white; "
  //   );
  //   console.log(userValue.toLowerCase());

  //   return this._userList.filter(
  //     user =>
  //       user.user_name.toLowerCase().indexOf(userValue.toLowerCase()) === 0
  //   );
  // }

  // ~ End ----------------------------------------------------------------

  // ~ Start ---------------------------------------------------------------
  // -- @details : Function to clear fields on autocomplete for area and agent.
  clearAgentNameField() {
    this.reportFilter.controls["user_name"].setValue("");
    this.user_id = "";
  }

  clearAreaNameField() {
    this.reportFilter.controls["area_name"].setValue("");
    this.area_id = "";
  }
  // ~ End ---------------------------------------------------------------

  //  ~ End_____________________________________________________________________________________________

  // --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  receiveToggleSidebarObj($event) {

    // console.log("**** @@ Sidebar Open Object @@ ****");

    this._opened = $event;
    console.log(this._opened);

  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

    
    
}
// -------------------  Component & Class Definition - End ---------------------------------------------
