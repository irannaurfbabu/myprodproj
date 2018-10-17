/*
____________________________________________________________________________________________________________
## COMPONENT FOR HOME PAGE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## SERVICE FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ Component Definition for Home Page
|   ++ Subscribe and Retrieve User Profile Details from MeUserProfileService
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 24-JAN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/
// -- @details : Built and Custom Imports  ##################################################################
//  ~ Start  ------------------------------------------------------------------------------------------------
// Import Core Libraries/Functionalities

import { Component, OnInit } from "@angular/core";
import { PersistenceService } from "angular-persistence";
import { RouterModule } from "@angular/router";
import { Router } from "@angular/router";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { MeGzipService } from "../../../Service/me-gzip.service";
import * as _ from "lodash";

// Declare Generic Variables
declare var jQuery: any;
declare var $: any;
declare var M: any;
// var _ = require('lodash');

//  ~ End  ---------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start --------------------------------------------------
@Component({
  selector: "app-me-home",
  templateUrl: "./me-home.component.html",
  styleUrls: ["./me-home.component.css"]
})
export class MeHomeComponent implements OnInit {
  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  --------------------------------------------------------------------------------------------------

  private _userProfileData: any;
  private _userLogin: any;
  private getRequestInput: any = "";
  private getRequestInputObj: any = {
    user_id: null,
    owner_id: null
  };
  private getRequestOwnerObj: any = {
    records: [{ owner_id: null }]
  };

  private collectionSummaryObj: any;
  private complaintSummaryObj: any;
  _opened: boolean = false;

  UserRoleOwner: boolean = false;

  // public class variables

  ownerCompanyName: String = "";
  showLoader: boolean = true;
  showNoRecords: boolean = false;

  toggleSearchFlag: boolean = false;
  _collectionList: any = [];
  _complaintList: any = [];
  _areawiseCollectionList: any = [];
  _userwiseCollectionList: any = [];
  _packList: any = [];
  _collectioStatusList: any = "";
  sortedData: any = [];

  cableName: any;
  collectedAmountDisplay: any;
  pendingAmountDisplay: any;
  collectionTargetDisplay: any;

  completedCollCountDisplay: any;
  pendingCollCountDisplay: any;
  totalCollCountDisplay: any;

  registeredComplDisplay: any;
  assignedComplDisplay: any;
  inprogressComplDisplay: any;
  cancelledComplDisplay: any;
  closedComplDisplay: any;
  totalComplDisplay: any;

  showCircularLoader1: boolean = false;
  showCircularLoader2: boolean = false;
  showCircularLoader3: boolean = false;

  customerWidgetObject: any;
  connectionWidgetObject: any;
  expenseWidgetObject: any;
  collectionTrendObject: any;
  expenseTrendObj: any;
  month_expense: number = 0;
  total_expense: number = 0;
  displayExpensePercent: any;
  areawiseCollectionObject: any;
  userwiseCollectionObject: any;
  totalCollectionObject: any;
  totalPendingAmt: any;

  areawiseSummary: any = {
    excess_collection: 0,
    less_collection: 0,
    no_outstanding: 0,
    highest_collection: 0,
    highest_received: 0,
    lowest_collection: 0,
    lowest_received: 0
  };

  agentwiseSummary: any = {
    excess_collection: 0,
    less_collection: 0,
    no_outstanding: 0,
    highest_collection: 0,
    highest_received: 0,
    lowest_collection: 0,
    lowest_received: 0
  };

  private updatesImages: any = [
    { url: "assets/images/me_announcements.svg" },
    { url: "assets/images/me_notifications.svg" },
    { url: "assets/images/me_newfeatures.svg" },
    { url: "assets/images/me_announcements.svg" },
    { url: "assets/images/me_notifications.svg" },
    { url: "assets/images/me_newfeatures.svg" }
  ];

  showSlideImage: boolean = true;
  slideImage: any = "assets/images/me_announcements.svg";

  // ----------------------------------------------------------------

  displayNewCustomer: number = 0;
  displayTotalCustomer: number = 0;
  displayCustomerPerct: number = 0;

  displayActiveConnections: number = 0;
  displaySuspendedConnections: number = 0;
  displayDisconnetedConnections: number = 0;
  displayTotalConnections: number = 0;
  displayConnectionPerct: number = 0;

  displayExpense: number = 0;
  displayTotalExpense: number = 0;

  displayOpenComplaints: number = 0;
  displayTotalComplaints: number = 0;
  displayComplaintsPercent: number = 0;

  displayTotalCollection: number = 0;
  displayTotalReceived: number = 0;
  displayTotalOutstanding: number = 0;

  // Chart Variables ----------------------------------------------------
  // Collection Status Pie Chart01
  showCircularLoader4: boolean = false;
  collectionStatusView: any[] = [450, 250];
  collectionStatuscolorScheme = {
    domain: ["#a5d6a7", "#e57373"]
  };

  collectionStatusData = [
    {
      name: "Received",
      value: 0
    },
    {
      name: "Due",
      value: 0
    }
  ];

  // Connection Status Pie Chart01
  showCircularLoader6 = false;
  connectionStatusView: any[] = [500, 220];
  connectionStatuscolorScheme = {
    domain: ["#a5d6a7", "#ffc107", "#e57373", "#03a9f4", "#5e35b1"]
  };

  percentageFormatting: (value: number) => any = percentage =>
    Math.round(percentage);

  connectionStatusData = [
    {
      name: "Active",
      value: 0
    },
    {
      name: "Suspended",
      value: 0
    },
    {
      name: "Disconnected",
      value: 0
    }
  ];

  // Complaints - Advanced Pie Grid
  showCircularLoader7: boolean = false;
  complaintStatusView: any[] = [1000, 300];
  complaintStatuscolorScheme = {
    domain: ["#FAC152", "#42A5F5", "#5c6bc0", "#66BB6A", "#EF5350"]
  };
  complaintStatusData = [
    {
      name: "Registered",
      value: 0
    },
    {
      name: "Assigned",
      value: 0
    },
    {
      name: "Inprogress",
      value: 0
    },
    {
      name: "Closed",
      value: 0
    },
    {
      name: "Cancelled",
      value: 0
    }
  ];

  // bar chart options =======================================================
  showCircularLoader5: boolean = false;
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  // public collectionTrendLabels:string[] = ['Mar-06', 'Mar-07', 'Mar-08', 'Mar-09', 'Mar-10','Mar-11','Mar-12'];
  public barChartType: string = "line";
  public barChartLegend: boolean = true;

  public collectionTrendLabels: string[] = [];
  public collectionTrendData: any[] = [
    { data: [0, 0, 0, 0, 0, 0, 0], label: "Amount" }
  ];

  public expenseTrendLabels: string[] = [];
  public expenseTrendData: any[] = [
    { data: [0, 0, 0, 0, 0, 0, 0], label: "Amount" }
  ];

  public collectionStatusLabels: string[] = [];
  public collectionStatusBarData: any[] = [
    { data: [0, 0, 0], label: "Amount" }
  ];

  public barChartColors1: Array<any> = [
    {
      // dark grey
      backgroundColor: "#bbdefb",
      borderColor: "#03a9f4",
      pointBackgroundColor: "rgba(77,83,96,1)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(77,83,96,1)"
    }
  ];

  public barChartColors2: Array<any> = [
    {
      // dark grey
      backgroundColor: "#b2dfdb ",
      borderColor: "#009688",
      pointBackgroundColor: "rgba(77,83,96,1)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(77,83,96,1)"
    }
  ];

  // Chart Variables ----------------------------------------------------

  // Prime Table Variables ----------------------------------------------------
  reportArrayList = [];
  reportCols = [];

  // Prime Table Variables ----------------------------------------------------

  // Class variable declaration ~ End  ---------------------------------------------------------------------

  // --  @details :  constructor #################################################################################
  //  ~ Start  ---------------------------------------------------------------------------------------------------
  constructor(
    public callHttpGet: MeCallHttpGetService,
    public userProfileService: MeUserProfileService,
    private homePersistenceService: PersistenceService,
    public router: Router,
    private gzipService: MeGzipService
  ) {
    // Intialize Value
    this.collectedAmountDisplay = 0;
    this.pendingAmountDisplay = 0;
    this.collectionTargetDisplay = 0;

    //
    this.completedCollCountDisplay = 0;
    this.pendingCollCountDisplay = 0;
    this.totalCollCountDisplay = 0;

    this.registeredComplDisplay = 0;
    this.assignedComplDisplay = 0;
    this.inprogressComplDisplay = 0;
    this.cancelledComplDisplay = 0;
    this.closedComplDisplay = 0;
    this.totalComplDisplay = 0;

    //
    this.showCircularLoader1 = true;
    this.showCircularLoader2 = true;
    this.showCircularLoader3 = true;
    this.showCircularLoader4 = true;
    this.showCircularLoader5 = true;
    this.showCircularLoader6 = true;
    this.showCircularLoader7 = true;

    // initialize display variables
    this.displayNewCustomer = 0;
    this.displayTotalCustomer = 0;
    this.displayActiveConnections = 0;
    this.displaySuspendedConnections = 0;
    this.displayDisconnetedConnections = 0;
    this.displayTotalConnections = 0;
    this.displayExpense = 0;
    this.displayTotalExpense = 0;

    // Prime Table Variables ----------------------------------------------------

    this.reportArrayList = [];

    //initialize  and set report columns
    this.reportCols = [
      {
        field: "area_name",
        header: "Area",
        width: "180",
        isVisible: "false"
      },
      {
        field: "collection_amount",
        header: "Collection Amt",
        width: "120",
        isVisible: "false"
      },
      {
        field: "received_amount",
        header: "Received Amt",
        width: "120",
        isVisible: "false"
      },
      {
        field: "amount_difference",
        header: "Amount Diff",
        width: "150",
        isVisible: "false"
      },
      {
        field: "remarks",
        header: "Remarks",
        width: "150",
        isVisible: "false"
      } 
    ];
    // Prime Table Variables ----------------------------------------------------
  }

  //  ~ End  ---------------------------------------------------------------------------------------------------

  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  ngOnInit() {
    // Intialize Loader Flags
    this.showCircularLoader1 = true;
    this.showCircularLoader2 = true;
    this.showCircularLoader3 = true;
    this.showCircularLoader4 = true;
    this.showCircularLoader5 = true;
    this.showCircularLoader6 = true;
    this.showCircularLoader7 = true;

    // initialize display variables
    this.displayNewCustomer = 0;
    this.displayTotalCustomer = 0;
    this.displayActiveConnections = 0;
    this.displayTotalConnections = 0;
    this.displayExpense = 0;
    this.displayTotalExpense = 0;

    // console.log(
    //   "%c  Inside home component ngonInit : ",
    //   "background: #1898dd;color: white; font-weight: bold;"
    // );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.homePersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );
    // console.log("User Login", this._userLogin);

    // make call to User Profile Request based on login details
    this.userProfileService
      .makeRequest_UserProfile(this._userLogin)
      .subscribe(response => {
        // this.gzipService.makeRequest_uncompress(response).then(function(result) {

        // console.log("Profile Inside Home Component :", result);
        this._userProfileData = response;

        if (
          this._userProfileData.userDetails.user_role_id != "1001" &&
          this._userProfileData.userDetails.user_role_id != "1002" &&
          this._userProfileData.userDetails.user_role_id != "1003"
        ) {
          this.router.navigateByUrl("/accessdenied");
        }

        console.warn(
          "----------------- User Profile Response ----------------- "
        );
        // console.log(this._userProfileData);
        // console.log(this._userProfileData.ownerDetails);

        // assigng to display in header nav bar
        this.ownerCompanyName = response.ownerDetails.owner_company_name;

        // assign values
        this.getRequestInputObj.user_id = this._userProfileData.userDetails.user_id;
        this.getRequestInputObj.owner_id = this._userProfileData.ownerDetails.owner_id;

        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this.getRequestInputObj
        );
        // console.log(
        //   "%c  Request Input : >>> ",
        //   "color: green; font-weight: bold;",
        //   this.getRequestInput
        // );

        // make call for retrieving Complaint Status
        // Complaint Status ~ Start  -------------------------------------------------------------------------------------------------

        // make call for retrieving Complaint List
        //  ~ Start  -------------------------------------------------------------------------------------------------
        this.callHttpGet
          .makeRequest_ManageComplaint(this.getRequestInput)
          .subscribe(response => {
            // // Log Response - Remove Later
            // console.warn(
            //   "%c ___________________________ Manage Complaint Response ___________________________",
            //   "background: #4dd0e1;color: black; font-weight: bold;"
            // );

            // console.log(response.complaintsList);
            // console.log("Complaint Length : ", response.complaintsList.length);

            this.gzipService.makeRequest_uncompress(response).then(
              function(result) {
                // assign response to local variable
                this._complaintList = result.complaintsList;

                if (this._complaintList.length > 0) {
                  // Calculate and assign summary to local variable
                  this.complaintSummaryObj = this.calculateComplaintSummary(
                    this._complaintList
                  );

                  //__________________________ Assign Values ~ Start ________________________________________
                  // Append Zeroes for displaying Counts if the value of count is less than 10
                  this.complaintStatusData = [
                    {
                      name: "Registered",
                      value: this.complaintSummaryObj.registeredCount
                    },
                    {
                      name: "Assigned",
                      value: this.complaintSummaryObj.assignedCount
                    },
                    {
                      name: "Inprogress",
                      value: this.complaintSummaryObj.inprogressCount
                    },
                    {
                      name: "Closed",
                      value: this.complaintSummaryObj.closedCount
                    },
                    {
                      name: "Cancelled",
                      value: this.complaintSummaryObj.cancelledCount
                    }
                  ];

                  //__________________________ Assign Values ~ End ________________________________________

                  this.displayOpenComplaints =
                    this.complaintSummaryObj.registeredCount +
                    this.complaintSummaryObj.assignedCount +
                    this.complaintSummaryObj.inprogressCount;
                  this.displayTotalComplaints =
                    this.complaintSummaryObj.registeredCount +
                    this.complaintSummaryObj.assignedCount +
                    this.complaintSummaryObj.inprogressCount +
                    this.complaintSummaryObj.closedCount +
                    this.complaintSummaryObj.cancelledCount;
                  this.displayComplaintsPercent = this.caculatePercentage(
                    this.displayOpenComplaints,
                    this.displayTotalComplaints
                  );

                  // hide loader
                  this.showCircularLoader7 = false;
                } else {
                  this.displayOpenComplaints = 0;
                  this.displayTotalComplaints = 0;
                  this.displayComplaintsPercent = 0;

                  this.showCircularLoader7 = false;
                  this.showNoRecords = true;
                }
              }.bind(this)
            );
          });

        // Complaint Status ~ End  -------------------------------------------------------------------------------------------------

        // assign owner id
        this.getRequestOwnerObj.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
        // console.log("----------- getRequestOwnerObj -----------");
        // console.log(this.getRequestOwnerObj );

        // make call for retrieving Complaint List
        // makeRequest_GetCustomerCount ~ Start  ------------------------------------------------------------------------------
        this.callHttpGet
          .makeRequest_GetCustomerCount(this.getRequestOwnerObj)
          .subscribe(response => {
            // Log Response - Remove Later
            // console.warn(
            //   "%c ___________________________ makeRequest_GetCustomerCount Response ___________________________",
            //   "background: #4dd0e1;color: black; font-weight: bold;"
            // );

            // console.log(response);
            // assign response
            this.customerWidgetObject = response;

            this.displayNewCustomer = this.customerWidgetObject.newCustomersCount;
            this.displayTotalCustomer = this.customerWidgetObject.totalCustomersCount;
            this.displayCustomerPerct = this.caculatePercentage(
              this.displayNewCustomer,
              this.displayTotalCustomer
            );

            // console.log("-- Percentage --");
            // console.log(this.displayCustomerPerct);

            this.showCircularLoader1 = false;
          });
        // makeRequest_GetCustomerCount ~ End  ------------------------------------------------------------------------------

        // make call for retrieving Connection Status
        // makeRequest_GetConnectionStatus ~ Start  ------------------------------------------------------------------------------

        this.callHttpGet
          .makeRequest_GetConnectionStatus(this.getRequestOwnerObj)
          .subscribe(response => {
            // Log Response - Remove Later
            // console.warn(
            //   "%c ___________________________ makeRequest_GetConnectionStatus Response ___________________________",
            //   "background: #4dd0e1;color: black; font-weight: bold;"
            // );

            // assign response
            this.connectionWidgetObject = response;
            // console.log(this.connectionWidgetObject);

            // this.displayNewCustomer   = this.customerWidgetObject.newCustomersCount;
            // this.displayTotalCustomer = this.customerWidgetObject.totalCustomersCount;
            if (this.connectionWidgetObject.connectionStatus.length > 0) {
              // assign values to connection status pie
              this.connectionStatusData = this.connectionWidgetObject.connectionStatus;
              this.showCircularLoader6 = false;

              // Calculate Connection Widget Summary
              let totalConnection = 0;
              let activeConnection = 0;

              this.connectionWidgetObject.connectionStatus.forEach(function(
                item,
                index
              ) {
                if (item.name === "ACTIVE") {
                  activeConnection = item.value;
                }

                // sum total connections
                totalConnection += item.value;
              });

              // assign to widget display variables
              this.displayActiveConnections = activeConnection;
              this.displayTotalConnections = totalConnection;
              this.displayConnectionPerct = this.caculatePercentage(
                this.displayActiveConnections,
                this.displayTotalConnections
              );
            } else {
              this.displayActiveConnections = 0;
              this.displayTotalConnections = 0;
              this.displayConnectionPerct = 0;
              this.showCircularLoader6 = false;
            }
          });

        // makeRequest_GetConnectionStatus ~ End  ------------------------------------------------------------------------------

        // make call for retrieving Collection Trend
        // makeRequest_GetCollectionTrend ~ Start  ------------------------------------------------------------------------------

        this.callHttpGet
          .makeRequest_GetCollectionTrend(this.getRequestOwnerObj)
          .subscribe(response => {
            // Log Response - Remove Later
            // console.warn(
            //   "%c ___________________________ makeRequest_GetCollectionTrend Response ___________________________",
            //   "background: #1dd0e1;color: black; font-weight: bold;"
            // );

            // assign response
            this.collectionTrendObject = response;
            // console.log(this.collectionTrendObject);

            if (this.collectionTrendObject.collectionTrend.length > 0) {
              this.collectionTrendObject.collectionTrend = this.collectionTrendObject.collectionTrend.reverse();

              // Extract Days
              let arry_idx = 0;
              let collectionLables = [];
              let collectionData = [];

              this.collectionTrendObject.collectionTrend.forEach(function(
                item,
                index
              ) {
                // console.log("------- Data -------");
                // console.log(item.DAY);
                // console.log(item.amount);

                // extract and assignn values
                collectionLables[arry_idx] = item.DAY;
                collectionData[arry_idx] = item.amount;

                arry_idx = arry_idx + 1;
              });

              // Assign values to Bar Chart Variables.
              this.collectionTrendLabels = collectionLables;
              this.collectionTrendData[0].data = collectionData;

              // console.log("------- Bar Chart Data Output -------");
              // console.log( collectionLables);
              // console.log( collectionData);

              this.showCircularLoader5 = false;
            } else {
              this.showCircularLoader5 = false;
            }
          });

        // makeRequest_GetCollectionTrend ~ End  ------------------------------------------------------------------------------

        // makeRequest_getAreawiseCollection ~ Start  ------------------------------------------------------------------------------
        this.callHttpGet
          .makeRequest_getAreawiseCollection(this.getRequestOwnerObj)
          .subscribe(response => {
            this.areawiseCollectionObject = response;

            // console.log("Areawise Collection");
            // console.log(this.areawiseCollectionObject);

            if (this.areawiseCollectionObject.areawiseCollections.length > 0) {
              // assign the collection array
              this.reportArrayList = this.areawiseCollectionObject.areawiseCollections;
              this._areawiseCollectionList = this.areawiseCollectionObject.areawiseCollections;

              this.areawiseSummary = this.calculateAreaStats(
                this._areawiseCollectionList
              );
            } else {
              console.log("--- No Areawise Data ---");
            }
          });

        // makeRequest_getAreawiseCollection ~ End  ------------------------------------------------------------------------------
        // makeRequest_getAgentiseCollection ~ Start  ------------------------------------------------------------------------------

        // makeRequest_getAgentiseCollection ~ End  ------------------------------------------------------------------------------

        // makeRequest_getAgentiseCollection ~ Start  ------------------------------------------------------------------------------
        this.callHttpGet
          .makeRequest_getExpenseTrend(this.getRequestOwnerObj)
          .subscribe(response => {
            this.expenseTrendObj = response;

            // console.log("Userwise Collection");
            // console.log(this.expenseTrendObj);

            if (this.expenseTrendObj.dailyExpenseTrend.length > 0) {
              // assign the collection array
              // this.expenseTrendObj.dailyExpenseTrend = this.expenseTrendObj.dailyExpenseTrend.reverse();
              this.expenseTrendObj.dailyExpenseTrend = this.expenseTrendObj.dailyExpenseTrend;

              // console.log("Daily Expense Trend");
              // console.log( this.expenseTrendObj.dailyExpenseTrend );

              // Extract Days
              let arry_idx = 0;
              let expenseLables = [];
              let expenseData = [];

              this.expenseTrendObj.dailyExpenseTrend.forEach(function(
                item,
                index
              ) {
                // extract and assignn values
                expenseLables[arry_idx] = item.expense_date;
                expenseData[arry_idx] = item.total_amount;

                arry_idx = arry_idx + 1;
              });

              //  console.log("Daily Expense Labels");
              //  console.log( expenseLables);
              //  console.log( expenseData);

              this.expenseTrendLabels = expenseLables;
              this.expenseTrendData[0].data = expenseData;

              this.month_expense = this.expenseTrendObj.monthly_expense.month_expense;
              this.total_expense = this.expenseTrendObj.total_expense.total_expense;

              // console.log('this.month_expense',this.month_expense);
              // console.log('this.total_expense',this.total_expense);

              this.displayExpensePercent = this.caculatePercentage(
                this.month_expense,
                this.total_expense
              );
              // console.log('this.displayExpensePercent',this.displayExpensePercent);
            } else {
              console.log("--- No Expense Trend Data ---");
              this.month_expense = 0;
              this.total_expense = 0;
            }
          });

        // makeRequest_getAgentiseCollection ~ End  ------------------------------------------------------------------------------

        // makeRequest_getAgentiseCollection ~ Start  ------------------------------------------------------------------------------
        this.callHttpGet
          .makeRequest_getCollectionStatus(this.getRequestOwnerObj)
          .subscribe(response => {
            this._collectioStatusList = response;

            console.log("--- this._collectioStatusList ---");
            console.log(this._collectioStatusList);

            if (this._collectioStatusList) {
              console.log("--- Inside Collection Status ---");

              // Display Collection Summary Status - only for active users
              this.displayTotalCollection = this._collectioStatusList.ActivecollectionStatus.collection_amount_original;
              this.displayTotalReceived = this._collectioStatusList.ActivecollectionStatus.received_amount;
              this.displayTotalOutstanding = this._collectioStatusList.ActivecollectionStatus.outstanding_balance;

              this.showCircularLoader4 = false;
            } else {
              console.log("--- No Collection Status Data ---");
              // Display Collection Summary Status - only for active users
              this.displayTotalCollection = 0;
              this.displayTotalReceived = 0;
              this.displayTotalOutstanding = 0;
            }
          });

        // makeRequest_getAgentiseCollection ~ End  ------------------------------------------------------------------------------

        // }.bind(this))

        // make call to get list of Packs for the owner
        //  ~ Start  -------------------------------------------------------------------------------------------------

        this.callHttpGet
          .makeRequest_ManagePack(this.getRequestInput)
          .subscribe(response => {
            this.gzipService.makeRequest_uncompress(response).then(
              function(result) {
                this._packList = result.packList;

                // Check the Response Array List and Display the data in tabular Format
                // If the Response Array List is blank/no-records - display no reacords in the table - set showNoRecords flag true
                if (this._packList.length > 0) {
                  this.showLoader = false;

                  this._packList = _.sortBy(this._packList, [
                    function(o) {
                      return o.stb_count;
                    }
                  ]);
                  this._packList = _.reverse(this._packList);
                  this._packList = _.slice(this._packList, 0, 5);

                  // console.log("See the Pack List");
                  // console.log( this._packList);
                } else {
                  this.showLoader = false;
                  this.showNoRecords = true;

                  console.log(this.showNoRecords);
                }
              }.bind(this)
            );
          });

        //  ~ End  -------------------------------------------------------------------------------------------------
      });

    // start slide show
    // this.start_Slideshow(this.updatesImages);


  }
  //ngOnInit  ~ End  ----------------------------------------------------------------------------------------------------

  // -- @details : Local Functions______________________________________________________________________
  // --  @details :  receiveToggleSidebarObj (Emit Event)#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

  receiveToggleSidebarObj($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this._opened = $event;

    // console.log("**** @@ Sidebar Open Object @@ ****");
    // console.log(this._opened);
  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

  // -- @details : Calculate Complaint Summary for Dashboard  ####################################################
  //  ~ Calculate Complaint Summary ~ Start  ---------------------------------------------------------------------
  calculateComplaintSummary(p_in_array): any {
    var complaintSummary = {
      registeredCount: 0,
      assignedCount: 0,
      inprogressCount: 0,
      cancelledCount: 0,
      closedCount: 0,
      totalCount: 0
    };

    // console.log(  "%c _______________ Calculate Complaint Summary Array Input ___________________________ ",
    // "background: #ab47bc ;color: black; font-weight: bold;",    );
    // console.log(p_in_array);

    // Loop through array for calculation ~ Start
    p_in_array.forEach(function(complntObj, index) {
      // console.log(complntObj);

      if (complntObj.complaint_status === "") {
      }

      switch (complntObj.complaint_status) {
        case "REGISTERED": {
          complaintSummary.registeredCount += 1;
          break;
        }
        case "ASSIGNED": {
          complaintSummary.assignedCount += 1;
          break;
        }
        case "IN-PROGRESS": {
          complaintSummary.inprogressCount += 1;
          break;
        }
        case "CANCELLED": {
          complaintSummary.cancelledCount += 1;
          break;
        }
        case "CLOSED": {
          complaintSummary.closedCount += 1;
          break;
        }
        default: {
          console.log("Invalid choice");
          break;
        }
      }
    }); // Loop through array for calculation ~ End

    // Calculate Total
    complaintSummary.totalCount =
      complaintSummary.registeredCount +
      complaintSummary.assignedCount +
      complaintSummary.inprogressCount +
      complaintSummary.cancelledCount +
      complaintSummary.closedCount;

    // console.log(  "%c _______________ Calculate Complaint Summary Object ___________________________ ",
    // "background: #ab47bc ;color: black; font-weight: bold;",    );
    // console.log(complaintSummary);

    //return Complaint Summary
    return complaintSummary;
  }
  //  ~ Calculate Complaint Summary ~ End  ---------------------------------------------------------------------

  // private _toggleSidebar() {
  //   this._opened = !this._opened;
  // }

  caculatePercentage(param1, param2) {
    let num1: number = param1;
    let num2: number = param2;
    let percentage: number = 0;

    if (num2 <= 0) {
      percentage = 0;
    } else {
      //calculate percentage
      percentage = (num1 / num2) * 100;
      // console.log(  "%c _______________ Percentage Value ___________________________ ",
      // "background: #1b47bc ;color: white; font-weight: bold;",    );
      // console.log(percentage);
      percentage = Math.round(percentage);
    }

    return percentage;
  }

  calculateAreaStats(p_input_array) {
    console.log(
      "%c _________________Calculate AreaStats Array Input ___________________________ ",
      "background: #4dd0e1;color: black; font-weight: bold;"
    );
    console.log(p_input_array);

    let areawiseSummaryObj = {
      excess_collection: 0,
      less_collection: 0,
      no_outstanding: 0,
      highest_collection: "",
      highest_received: "",
      lowest_collection: "",
      lowest_received: ""
    };

    p_input_array.forEach(function(item, index) {
      let differenceAmount = 0;
      differenceAmount = item.collection_amount - item.received_amount;

      if (differenceAmount < 0) {
        areawiseSummaryObj.excess_collection =
          areawiseSummaryObj.excess_collection + 1;
      } else if (differenceAmount == 0) {
        areawiseSummaryObj.no_outstanding =
          areawiseSummaryObj.no_outstanding + 1;
      } else if (differenceAmount > 0) {
        areawiseSummaryObj.less_collection =
          areawiseSummaryObj.less_collection + 1;
      }
    });

    // Calculate Max and Min values
    areawiseSummaryObj.highest_collection = _.maxBy(p_input_array, function(o) {
      return o.collection_amount;
    });
    areawiseSummaryObj.highest_received = _.maxBy(p_input_array, function(o) {
      return o.received_amount;
    });

    areawiseSummaryObj.lowest_collection = _.minBy(p_input_array, function(o) {
      return o.collection_amount;
    });
    areawiseSummaryObj.lowest_received = _.minBy(p_input_array, function(o) {
      return o.received_amount;
    });

    return areawiseSummaryObj;
  }

  // updates slideShow
  start_Slideshow(p_updatesImages): void {
    console.log("Inside Slideshow Functions");
    let cnt = 1;
    let i = 0;
    let imageList = p_updatesImages;

    _.delay(
      text => {
        console.log(text);

        let prvsIndex = 0;
        setInterval(() => {
          let currenIndex = _.random(0, 5);

          if (currenIndex != prvsIndex) {
            this.showSlideImage = false;
            console.log("Image List");
            console.log(" Image Url: ", imageList[currenIndex].url);

            this.slideImage = imageList[currenIndex].url;
            this.showSlideImage = true;
          } else {
            prvsIndex = currenIndex;
          }
        }, 20000);
      },
      8000,
      "Started Slideshow"
    );
  }
}

// -------------------  Component & Class Definition - End --------------------------------------------------
