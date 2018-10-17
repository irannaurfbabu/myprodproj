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
import { Router, NavigationExtras } from "@angular/router";

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "./../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "./../../../Service/me-user-profile.service";
import { StorageType } from "./../../../Service/Interfaces/storage-type.enum";
import { MeCalculateDateService } from "./../../../Service/me-calculate-date.service";
import { MeGzipService } from "../../../Service/me-gzip.service";
import { MeDataExchangeService } from "../../../Service/me-data-exchange.service";

// primeng components
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { MenuItem } from "primeng/api";
import { ContextMenuModule } from "primeng/contextmenu";
import { DialogModule } from "primeng/dialog";

// Import third party Libraries/Functionalities/Services
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTabChangeEvent } from "@angular/material";
import { MatDividerModule } from "@angular/material/divider";
import { MatTabsModule } from "@angular/material/tabs";
import { MatMenuModule } from "@angular/material/menu";
import { NotificationsService  } from 'angular2-notifications';

import swal from "sweetalert2";
import { PersistenceService } from "angular-persistence";
import * as moment from "moment";
import { Angular2Csv } from "angular2-csv/Angular2-csv";
import * as _ from "lodash";
declare var jsPDF: any; // Important

//  ~ End__________________________________________________________________________________________________

@Component({
  selector: "app-me-customer-report",
  templateUrl: "./me-customer-report.component.html",
  styleUrls: ["./me-customer-report.component.css"]
})
export class MeCustomerReportComponent implements OnInit {
  // -- @details : Class variable declaration ################################################################
  //  ~ Start_________________________________________________________________________________________________

  //-- Create Form Group
  reportFilter: FormGroup;

  //-- Create List of Fields
  area_name: AbstractControl;
  user_name: AbstractControl;

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  public showLoader: boolean = true;
  public showNoRecords: boolean = false;
  public showResult: boolean = false;

  public showPaymentModal: boolean = false;
  public showBillHistoryModal: boolean = false;
  public showSTBHistoryModal: boolean = false;
  public downloadInvoiceFlag: boolean = false;

  public selectedRow: any = "";
  public dataTable: any = "";
  public selectedTabIndex: number;
  public customerListArray: any[] = [];
  public _opened: boolean = false;
  public setCustomer_number: any = "";
  public shareCustomerObject: any = {
    customerNumber: null,
    customerName: null
  };

  filteredAreas: Observable<any[]>;
  filteredUsers: Observable<any[]>;

  exportFileName: any = "CustomerListReport_";
  fileCurrentDate: number = Date.now();

  items: MenuItem[];
  actionItems: MenuItem[];

  datasource: any = [];
  totalRecords: number;
  loading: boolean;

  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput: any = "";
  private _userProfileData: any;
  private _userLogin: any;

  private _areaList: any = [];
  private _userList: any = [];
  private reportValuesJSON: any = null;
  private area_id: any;
  private area_display_name: any;
  private user_id: any;
  private customerNumber: any;

  private _customerReportList: any[] = [];
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

  //  ~ End________________________________________________________________________

  // --  @details :  constructor ##################################################
  //  ~ Start - constructor________________________________________________________

  constructor(
    fb: FormBuilder,
    public callHttpGet: MeCallHttpGetService,
    public userProfileService: MeUserProfileService,
    private reportPersistenceService: PersistenceService,
    private calculateDate: MeCalculateDateService,
    private router: Router,
    public datepipe: DatePipe,
    private gzipService: MeGzipService,
    public dataExchange: MeDataExchangeService,
    private _notificationService: NotificationsService 
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
      this.area_display_name = value;

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

    this.showPaymentModal = false;
    this.showBillHistoryModal = false;
    this.showSTBHistoryModal = false;

    this.setCustomer_number = "";

    //initialize  and set report columns
    this.reportCols = [
      {
        field: "customer_number",
        header: "Customer #",
        width: "120",
        isVisible: "false"
      },
      {
        field: "customer_id",
        header: "Customer ID",
        width: "120",
        isVisible: "false"
      },
      {
        field: "full_name",
        header: "Customer Name",
        width: "150",
        isVisible: "false"
      },
      // { field: 'phone', header: 'Phone', width: '10%' },
      {
        field: "address1",
        header: "Address",
        width: "180",
        isVisible: "false"
      },
      { field: "area_name", header: "Area", width: "150", isVisible: "false" },
      {
        field: "customer_status",
        header: "Status",
        width: "120",
        isVisible: "false"
      },
      {
        field: "available_balance",
        header: "Avl. Balance",
        width: "120",
        isVisible: "true"
      },
      {
        field: "balance_status",
        header: "Balance Status",
        width: "150",
        isVisible: "true"
      },
      {
        field: "pending_collection",
        header: "Pending Collection",
        width: "120",
        isVisible: "true"
      },
      {
        field: "subscription_name",
        header: "Subscription",
        width: "200",
        isVisible: "true"
      },
      {
        field: "stb_number",
        header: "STB Number",
        width: "200",
        isVisible: "true"
      },
      {
        field: "stb_vc_number",
        header: "VC Number",
        width: "200",
        isVisible: "true"
      },
      { field: "stb_cnt", header: "STB Count", width: "120", isVisible: "true" }
    ];

    this.items = [
      {
        label: "Edit Customer",
        icon: "fas fa-edit",
        routerLink: ["/editcustomer"]
      },
      { separator: true },
      {
        label: "Payments",
        icon: "fas fa-rupee-sign fa-fw",
        items: [
          {
            label: "Collect Payment",
            icon: "pi pi-fw pi-external-link",
            routerLink: ["/collectpayment"]
          },
          {
            label: "Add Charges",
            icon: "pi pi-fw pi-external-link",
            routerLink: ["/addcharges"],
            visible: false
          },
          {
            label: "Add Rebate",
            icon: "pi pi-fw pi-external-link",
            routerLink: ["/addrebate"],
            visible: false
          }
        ]
      },
      {
        label: "View Report",
        icon: "fas fa-eye fa-fw",
        items: [
          { label: "Payment History", icon: "pi pi-fw pi-external-link" },
          { label: "Bill History", icon: "pi pi-fw pi-external-link" },
          { label: "STB Details", icon: "pi pi-fw pi-external-link" }
        ]
      },
      {
        label: "Download",
        icon: "fas fa-download fa-fw",
        items: [
          { label: "Invoice", icon: "fas fa-download" },
          { label: "Barcode", icon: "fas fa-download" }
        ]
      }
    ];

    this.actionItems = [
      { label: "Export to CSV", icon: "fas fa-download fa-fw" },
      { label: "Bulk Invoice", icon: "pi pi-fw pi-external-link" }
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
        this.getUnpaidReportAPI_Input.records[0].comments =
          this._userProfileData.userDetails.user_name +
          " submitted collection report " +
          " on " +
          this.reportDate;

        console.warn(
          "%c ___________________________ getRequestInput ___________________________",
          "background: #9fa8da;color: black; font-weight: bold;"
        );

        console.log(this.getUnpaidReportAPI_Input);

        // make call for makeRequest_getCustomerListReport
        //  ~ Start  ----------------------------------------------------------------------------------
        this.callHttpGet
          .makeRequest_getCustomerListReport(this.getUnpaidReportAPI_Input)
          .subscribe(response => {
            this.gzipService.makeRequest_uncompress(response).then(
              function(result) {
                this._customerReportList = result;

                console.log("---- Result -----");
                console.log(this._customerReportList);

                if (this._customerReportList.customersList.length > 0) {
                  // assign reponse to table data object.
                  this.customerListArray = this._customerReportList.customersList;

                  // set flags
                  this.showLoader = false;
                  this.showNoRecords = false;
                  this.showResult = true;
                } else {
                  // set flags in case of blank reponse or no result.
                  this.showLoader = false;
                  this.showNoRecords = true;
                  this.showResult = false;
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
    this.getUnpaidReportAPI_Input.records[0].comments =
      this._userProfileData.userDetails.user_name +
      " submitted collection report " +
      " on " +
      this.reportDate;

    console.log(
      "%c Unpaid Post Request Object After ***** -------------------------------------------------------------------------- ",
      "background: #8bc34a;font-weight: bold;color: white; "
    );
    console.log(JSON.stringify(this.getUnpaidReportAPI_Input));

    // make call for makeRequest_getCustomerListReport
    //  ~ Start  ----------------------------------------------------------------------------------
    this.callHttpGet
      .makeRequest_getCustomerListReport(this.getUnpaidReportAPI_Input)
      .subscribe(response => {
        this.gzipService.makeRequest_uncompress(response).then(
          function(result) {
            this._customerReportList = result;

            console.log("---- Result -----");
            console.log(this._customerReportList);

            if (this._customerReportList.customersList.length > 0) {
              // assign reponse to table data object.
              this.customerListArray = this._customerReportList.customersList;

              // set flags
              this.showLoader = false;
              this.showNoRecords = false;
              this.showResult = true;
            } else {
              // set flags in case of blank reponse or no result.
              this.showLoader = false;
              this.showNoRecords = true;
              this.showResult = false;
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
    // Fetch the Customer Object Value from Event Emitter.
    this._opened = $event;

    // console.log("**** @@ Sidebar Open Object @@ ****");
    console.log(this._opened);
  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

  // --  @details :  onRightClick event for context menu #######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  onRightClick(p_event_obj, p_selected_row) {
    /* 
      @details - Based on collection pending flag - update the items list in the context menu
    */

    if (p_selected_row.pending_collection == "Y") {
      this.items = [
        {
          label: "Edit Customer",
          icon: "fas fa-edit",
          command: event =>
            this.navigateToLink("editcustomer", p_selected_row.customer_number)
        },
        { separator: true },
        {
          label: "Payments",
          icon: "fas fa-rupee-sign fa-fw",
          items: [
            {
              label: "Collect Payment",
              icon: "pi pi-fw pi-external-link",
              command: event =>
                this.navigateToLink(
                  "collectpayment",
                  p_selected_row.customer_number
                )
            },
            {
              label: "Add Charges",
              icon: "pi pi-fw pi-external-link",
              command: event =>
                this.navigateToLink(
                  "addcharges",
                  p_selected_row.customer_number
                )
            },
            {
              label: "Add Rebate",
              icon: "pi pi-fw pi-external-link",
              command: event =>
                this.navigateToLink("addrebate", p_selected_row.customer_number)
            }
          ]
        },
        {
          label: "View Report",
          icon: "fas fa-eye fa-fw",
          items: [
            {
              label: "Payment History",
              icon: "pi pi-fw pi-external-link",
              command: event => this.showHidePaymentModal(p_selected_row)
            },
            {
              label: "Bill History",
              icon: "pi pi-fw pi-external-link",
              command: event => this.showHideBillHistoryModal(p_selected_row)
            }
            // { label: "STB Details", icon: "pi pi-fw pi-external-link" },
          ]
        },
        {
          label: "Download",
          icon: "fas fa-download fa-fw",
          items: [
            {
              label: "Invoice",
              icon: "fas fa-download",
              command: event => this.downloadProformaInvoice(p_selected_row)
            }
            // { label: "Barcode", icon: "fas fa-download" }
          ]
        }
      ];
    } else {
      this.items = [
        {
          label: "Edit Customer",
          icon: "fas fa-edit",
          command: event =>
            this.navigateToLink("editcustomer", p_selected_row.customer_number)
        },
        { separator: true },
        {
          label: "Payments",
          icon: "fas fa-rupee-sign fa-fw",
          items: [
            {
              label: "View Collection",
              icon: "pi pi-fw pi-external-link",
              command: event =>
                this.navigateToLink(
                  "collectpayment",
                  p_selected_row.customer_number
                )
            },
            {
              label: "Collect Advance",
              icon: "pi pi-fw pi-external-link",
              command: event =>
                this.navigateToLink(
                  "addbalance",
                  p_selected_row.customer_number
                )
            },
            {
              label: "Add Charges",
              icon: "pi pi-fw pi-external-link",
              command: event =>
                this.navigateToLink(
                  "addcharges",
                  p_selected_row.customer_number
                )
            },
            {
              label: "Add Reversal",
              icon: "pi pi-fw pi-external-link",
              command: event =>
                this.navigateToLink(
                  "addreversal",
                  p_selected_row.customer_number
                )
            }
          ]
        },
        {
          label: "View Report",
          icon: "fas fa-eye fa-fw",
          items: [
            {
              label: "Payment History",
              icon: "pi pi-fw pi-external-link",
              command: event => this.showHidePaymentModal(p_selected_row)
            },
            {
              label: "Bill History",
              icon: "pi pi-fw pi-external-link",
              command: event => this.showHideBillHistoryModal(p_selected_row)
            }
            // { label: "STB Details", icon: "pi pi-fw pi-external-link" }
          ]
        },
        {
          label: "Download",
          icon: "fas fa-download fa-fw",
          items: [
            {
              label: "Invoice",
              icon: "fas fa-download",
              command: event => this.downloadProformaInvoice(p_selected_row)
            }
            // { label: "Barcode", icon: "fas fa-download" }
          ]
        }
      ];
    }

    return false;
  }
  //  ~ End  ----------------------------------------------------------------------------------------------------

  // --  @details :  navigation link for context menu #######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  navigateToLink(link, value) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        id: value,
        Source: "customerreport"
      }
    };

    if (link != "") {
      this.router.navigate([link], navigationExtras);
    }
  }

  //  ~ End  ----------------------------------------------------------------------------------------------------

  showHidePaymentModal(p_selected_row) {
    // reset values
    this.setCustomer_number = "";
    this.shareCustomerObject.customerNumber = "";
    this.shareCustomerObject.customerName = "";

    // assign values from selected row
    this.setCustomer_number = p_selected_row.customer_number;
    this.shareCustomerObject.customerNumber = p_selected_row.customer_number;
    this.shareCustomerObject.customerName = p_selected_row.full_name;

    console.log("showHidePaymentModal");
    console.log(this.shareCustomerObject);

    this.dataExchange.pushExchangeData(this.shareCustomerObject);
    this.showPaymentModal = !this.showPaymentModal;
  }

  showHideBillHistoryModal(p_selected_row) {
    // reset values
    this.setCustomer_number = "";
    this.shareCustomerObject.customerNumber = "";
    this.shareCustomerObject.customerName = "";

    // assign values from selected row
    this.setCustomer_number = p_selected_row.customer_number;
    this.shareCustomerObject.customerNumber = p_selected_row.customer_number;
    this.shareCustomerObject.customerName = p_selected_row.full_name;

    console.log("showBillHistoryModal");
    console.log(this.shareCustomerObject);

    this.dataExchange.pushExchangeData(this.shareCustomerObject);
    this.showBillHistoryModal = !this.showBillHistoryModal;
  }

  downloadProformaInvoice(p_selected_row) {
    // reset values
    this.setCustomer_number = "";
    this.setCustomer_number = p_selected_row.customer_number;

    this.downloadInvoiceFlag = true;
  }

  showActionItems(p_dataTable) {
    this.actionItems = [
      {
        label: "Add Customer",
        icon: "fas fa-user-plus fa-fw",
        routerLink: ["/createcustomer"]
      },
      { separator: true },
      {
        label: "Export All",
        icon: "fas fa-download fa-fw",
        command: event => p_dataTable.exportCSV()
      },
      {
        label: "Bulk Invoice",
        icon: "fas fa-download fa-fw",
        command: event => this.downloadBulkInvoice()
      }
    ];
  }

  downloadBulkInvoice(): void {

    console.log("Area ID", this.area_id);
    console.log("Area Name", this.area_display_name);
    

    if(this.area_id == "" || typeof this.area_id === 'undefined' ){
      
      console.log("Please select area");
      const toast = this._notificationService.warn('Warning!', 'Please select an area.', {
        timeOut: 350,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true
      });


    }
    else{
      console.log("Selected Area", this.area_id);

      this.createAndDownloadInvoice( this.area_id,this.area_display_name,this._userProfileData.ownerDetails.owner_id);

    }

    

    // PDF Formatting - End ===============================================================================
  }

  // loadCarsLazy(event: LazyLoadEvent) {
  //   this.loading = true;

  //   //in a real application, make a remote request to load data using state metadata from event
  //   //event.first = First row offset
  //   //event.rows = Number of rows per page
  //   //event.sortField = Field name to sort with
  //   //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
  //   //filters: FilterMetadata object having field as key and filter value, filter matchMode as value

  //   //imitate db connection over a network
  //   setTimeout(() => {
  //       if (this.datasource) {
  //           this.cars = this.datasource.slice(event.first, (event.first + event.rows));
  //           this.loading = false;
  //       }
  //   }, 1000);
  //   }

  createAndDownloadInvoice(p_area_id,p_area_name,p_owner_id){

    swal({
      
      titleText: 'Downloading...',
      text: 'Please wait...',
      allowOutsideClick : false,
      allowEscapeKey : false,
      allowEnterKey : false,
      onOpen: () => {
        swal.showLoading()
        }
    });


    console.log("Area ID Received", p_area_id);
    console.log("Area Name Received", p_area_name);

    let _customerBillList = [];
    let _customerBillSummaryList = [];
    let _customerBillDetailsList = [];
    let postRequestObject = {
      "records": [
        {
          "owner_id": p_owner_id,
          "area_id": p_area_id
        }
      ]
     
    };

      // make call for makeRequest_getCustomerListReport
    //  ~ Start  ----------------------------------------------------------------------------------
    this.callHttpGet
      .makeRequest_getInvoiceByArea(postRequestObject)
      .subscribe(response => {
        this.gzipService.makeRequest_uncompress(response).then(
          function(result) {
            this._customerBillList = result;

            console.log("---- Result -----");
            console.log(this._customerBillList);

            if (this._customerBillList.InvoiceByAreaBillSummary.length > 0  && this._customerBillList.InvoiceByAreaBillDetails.length > 0 ) {
              
              // assign reponse to table data object.
              _customerBillSummaryList = this._customerBillList.InvoiceByAreaBillSummary;
              _customerBillDetailsList = this._customerBillList.InvoiceByAreaBillDetails;


              // create pdf
              // Loop through Bill Summary 

              // declare variables

              // Initialize jsPDF
              var doc = new jsPDF("p", "pt", "a4");

              // declare and set labels for Invoice Document
                let Lables = {
                  documentTitle: "INVOICE",
                  invoicePhoneLabel: "Phone",
                  invoiceAddressLabel: "Address",
                  invoiceLabel: "Invoice Number: ",
                  invoiceDateLabel: "Invoice Date: ",
                  invoicePeriodLabel: "Invoice Period: ",
                  billToLabel: "Bill To",
                  otherDetailsLabel: "Other Details ",
                  customerPhoneLabel: "Phone: ",
                  customerAddressLabel: "Address: ",
                  customerIDLabel: "Customer ID: ",
                  gstInLabel: "GSTIN: ",
                  invoiceTotalLabel: "INVOICE TOTAL",
                  invoiceCurrencyLabel: "Rs. "
                };

                // variables
                let printText = "";
                
                let dt     = new Date();
                let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                let mon    = months[dt.getMonth()].toUpperCase();
                let day    = dt.getDay();
                let yr     = dt.getFullYear();
                let hrs    = dt.getHours();
                let min    = dt.getMinutes();
                let sec    = dt.getSeconds();

                let currentDate = day+mon+yr+"_"+hrs+min+sec;

                let companyName = this._userProfileData.ownerDetails.owner_company_name;
                let companyphone = this._userProfileData.ownerDetails.owner_phone;
                let companyAddress = this._userProfileData.ownerDetails.owner_company_address;

                let fileName = 'Invoice_Report_'+p_area_name.replace(" ","_")+'_'+currentDate+'.pdf';

              _.forEach(_customerBillSummaryList, function(billSummaryObj) {


                // console.log(billSummaryObj.);
                // console.log(
                //   billSummaryObj.full_name,billSummaryObj.customer_number,billSummaryObj.phone,billSummaryObj.address1,
                //   billSummaryObj.area_name,billSummaryObj.customer_id 
                //   );

                  
                    // Declare and set variable values
                    let invoiceNumber   = billSummaryObj.invoice_id;
                    let invoiceDate     = billSummaryObj.bill_date;
                    let invoicePeriod   = billSummaryObj.bill_period_start+ "/"+billSummaryObj.bill_period_end;
                    let customerName    = billSummaryObj.full_name;
                    let customerID      = billSummaryObj.customer_id;
                    let customerphone   = billSummaryObj.phone;
                    let customerAddress = billSummaryObj.address1;
                    let gstinNumber     = billSummaryObj.GSTIN;
                    let invoiceAmount   = billSummaryObj.collection_amount_original;
                    let billStatus      = billSummaryObj.bill_type;

                    // =========================================================

                    let stb_number  = billSummaryObj.stb_number;
                    let vc_number   = billSummaryObj.stb_vc_number;
                    let stb_count   = billSummaryObj.stb_count;

                    // =========================================================

                    let monthlyRent       = billSummaryObj.rent_amount;
                    let cgst              = billSummaryObj.cgst_total;
                    let sgst              = billSummaryObj.sgst_total;
                    let monthlyTotal      = billSummaryObj.rent_total;
                    let rebate            = billSummaryObj.rebate_amount;
                    let additionalCharges = billSummaryObj.additional_charge | 0;
                    let previosDue        = billSummaryObj.previous_due;
                    let partialPayment    = billSummaryObj.partial_amount;

                    let totalAmount        = billSummaryObj.collection_amount_original;

                    // =========================================================
                    let p_bill_id            = billSummaryObj.bill_id;
                    let billDetailsRows = [];
                    let rowid           = 0;

                   // PDF Formatting - Start ===============================================================================

                    doc.setLineWidth(1.5);
                    // doc.rect(5, 5, 584, 810);
                    doc.rect(5, 5, 584, 10, "F");
                    doc.setFontSize(25);
                    doc.setFontType("bold");
                    printText = Lables.documentTitle;
                    doc.text(printText, 475, 45);   

                    // set and add line
                    doc.setLineWidth(1);
                    doc.line(15, 55, 580, 55);

                    // doc.rect(15, 60, 280, 120);
                    // doc.rect(305, 60, 275, 120);

                    doc.setFontSize(16);
                    doc.setFontType("bold");
                    printText = companyName;
                    doc.text(printText, 20, 75);
                    doc.setFontSize(12);
                    printText = companyphone;
                    doc.text(printText, 20, 90);
                    doc.setFontSize(8);
                    printText = companyAddress;
                    doc.text(printText, 20, 100);

                     // Invoice number
                    printText = Lables.invoiceLabel;
                    doc.setFontSize(12);
                    doc.setFontType("bold");
                    doc.text(printText, 310, 75);
                    printText = invoiceNumber;
                    doc.setFontSize(12);
                    doc.text(printText, 410, 75);

                    // Invoice Date
                    printText = Lables.invoiceDateLabel;
                    doc.setFontSize(12);
                    doc.setFontType("bold");
                    doc.text(printText, 310, 95);
                    printText = invoiceDate;
                    doc.setFontSize(12);
                    doc.text(printText, 410, 95);

                    // Invoice Period
                    printText = Lables.invoicePeriodLabel;
                    doc.setFontSize(12);
                    doc.setFontType("bold");
                    doc.text(printText, 310, 115);
                    printText = invoicePeriod;
                    doc.setFontSize(12);
                    doc.text(printText, 410, 115);

                    doc.rect(15, 140, 280, 120);
                    doc.rect(305, 140, 275, 120);
                
                    // Create Rectangles
                    doc.rect(15, 140, 280, 25, "F");
                    doc.rect(305, 140, 275, 25, "F");
                
                    // set rectangle header
                    doc.setFontSize(14);
                    doc.setFontType("bold");
                    doc.setTextColor(255, 255, 255);
                    printText = Lables.billToLabel;
                    doc.text(printText, 20, 156);
                
                    // set rectangle header
                    doc.setFontSize(14);
                    doc.setFontType("bold");
                    doc.setTextColor(255, 255, 255);
                    printText = Lables.otherDetailsLabel;
                    doc.text(printText, 310, 156);

                    // set customer name  
                    doc.setFontSize(12);
                    doc.setFontType("bold");
                    doc.setTextColor(0, 0, 0);
                    printText = customerName;
                    doc.text(printText, 20, 180);

                    // set customer phone label & value
                    doc.setFontSize(10);
                    doc.setFontType("bold");
                    printText = Lables.customerPhoneLabel;
                    doc.text(printText, 20, 195);
                    doc.setFontSize(10);
                    printText = customerphone;
                    doc.text(printText, 70, 195);
                    

                    // set customer address label & value
                    doc.setFontSize(10);
                    doc.setFontType("bold");
                    printText = Lables.customerAddressLabel;
                    doc.text(printText, 20, 210);
                    doc.setFontSize(10);
                    printText = customerAddress;
                    doc.text(printText, 70, 210);

                     // set customer ID label & value
                    doc.setFontSize(10);
                    doc.setFontType("bold");
                    printText = Lables.customerIDLabel;
                    doc.text(printText, 310, 180);
                    doc.setFontSize(10);
                    printText = customerID;
                    doc.text(printText, 380, 180);

                     // set customer gstin label & value
                    doc.setFontSize(10);
                    doc.setFontType("bold");
                    printText = Lables.gstInLabel;
                    doc.text(printText, 310, 195);
                    doc.setFontSize(10);
                    printText = gstinNumber;
                    doc.text(printText, 380, 195);

                    // Add Paid Inovice Image

                    if(billStatus == "FP"){
                         // Add Paid Inovice Image
                          var image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANUAAABKCAMAAAAbruEnAAADAFBMVEVHcEz/iYn/gID/gYH/goL/gID/gID/AAD/h4f/qqr/gID/gID/gID/mZn/gID/gID/gID/g4P/goL/gID/gID/gID/gID/iIj/gID/gID/i4v/gID/gID/gID/g4P/gID/gID/gID/hob/jo7/gID/gID/gID/gYH/gID/gYH/g4P/gID/gID/gID/gID/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/goL/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gID/kpL/gID/gID/gID/gID/hIT/gID/goL/hob/gID/gID/gID/gID/gID/hIT/gID/gID/gID/gID/gID/hIT/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/g4P/gID/gID/gID/gID/gID/gYH/gYH/gID/gID/gID/goL/gID/gID/goL/gID/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gYH/gID/gID/gID/gID/goL/gID/gID/gID/gID/gID/gID/gID/gYH/gID/gYH/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gID/hYX/gYH/gID/gYH/gID/gID/gID/gID/gID/gYH/gID/gID/gID/gID/gYH/gID/gID/gID/gID/gID/goL/gID/gID/gID/g4P/gYH/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gID/gYH/gID/goL/gID/gID/gID/gID/gID/gID/gID/goL/hYX/gID/gID/gID/gID/gID/gID/goL/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gYH/gID/gID/gID/gIBfxqbjAAAA/3RSTlMADcxVM/4CAREDZpnuBf1EUiMtxafyBA/JagvYQN0p0N98FQmc/I11qUMnVKO3DEiIdygy+oJQXjo1ip5ZsvsY0QYiPItfTlgsRxpwCgeU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"
                          doc.addImage(image, 'PNG', 415, 210, 100, 35);
                    }

                    // set and add line
                    doc.setLineWidth(3);
                    doc.line(15, 275, 580, 275);
                    doc.setLineWidth(3);
                    doc.line(15, 310, 580, 310);

                    // set invoice total label and value
                    doc.setFontSize(22);
                    doc.setFontType("bold");
                    printText = Lables.invoiceTotalLabel;
                    doc.text(printText, 20, 300);
                    printText = _.padStart(invoiceAmount, 18, " ");
                    doc.text(printText, 400, 300);

                    // fetch bill details
                    let billDetailsObject =  _.filter( _customerBillDetailsList, function(o) { 
                      return o.bill_id == p_bill_id ; });

                    // create array for bill details
                    _.forEach(billDetailsObject, function(obj) {

                      let billDetailsRowObject = {
                        "id" : null,
                        "subscription_name" : null,
                        "amount" : null,
                        }

                      rowid += 1;
                      billDetailsRowObject.id = rowid;
                      billDetailsRowObject.subscription_name = obj.subscription_name;
                      billDetailsRowObject.amount = obj.bill_total;
                    
                      billDetailsRows.push(billDetailsRowObject);
                    });


                    var getColumns = function () {
                      return [
                          {title: "#", dataKey: "id"},
                          {title: "Description", dataKey: "subscription_name"},
                          {title: "Amount", dataKey: "amount"} 
                      ];
                    };
                
                    let rows = billDetailsRows;

                    let options = {
                      // Styling
                      theme: "grid", // 'striped', 'grid' or 'plain'
                
                      // Properties
                      startX: 15, // false (indicates margin top value) or a number
                      startY: 320, // false (indicates margin top value) or a number
                      // margin: 40, // a number, array or object
                      pageBreak: "auto", // 'auto', 'avoid' or 'always'
                      tableWidth: "auto", // 'auto', 'wrap' or a number,
                      showHeader: "everyPage", // 'everyPage', 'firstPage', 'never',
                      styles: {
                        cellPadding: 5, // a number, array or object (see margin below)
                        fontSize: 10,
                        font: "helvetica", // helvetica, times, courier
                        // lineColor: 0,
                        // lineWidth: 0.5,
                        fontStyle: "normal", // normal, bold, italic, bolditalic
                        overflow: "ellipsize", // visible, hidden, ellipsize or linebreak
                       // fillColor: false, // false for transparent or a color as described below
                        textColor: 20,
                        halign: "left", // left, center, right
                        valign: "middle", // top, middle, bottom
                        columnWidth: "auto", // 'auto', 'wrap' or a number,
                        tableLineWidth: .5,
                      },
                      headerStyles:{fillColor: [0, 0, 0],halign:'center',fontSize: 12,textColor: 255,fontStyle: 'bold'},
                      columnStyles: { 
                          id:{halign:'center',columnWidth:80},
                          subscription_name:{halign:'left',columnWidth:300},
                          amount:{halign:'right', columnWidth: 150}
                        },
                     
                    };
                
                    // create bill details table
                    doc.autoTable(getColumns(), rows, options);


                    // ************** Summary Table *********************
                     var getSummaryColumns = function () {
                      return [
                          {title: "Comments", dataKey: "comments"},
                          {title: "Description", dataKey: "summary_title"},
                          {title: "amount", dataKey: "amount"} 
                      ];
                    };
                
                    let summaryRows = [
                    { "comments": "Comments","summary_title":"Monthly Rent","amount": monthlyRent },
                    {"summary_title":"CGST[9%]","amount": cgst},
                    {"summary_title":"SGST[9%]","amount":sgst},
                    {"summary_title":"Monthly Total","amount":monthlyTotal},
                    {"summary_title":"Rebate","amount":rebate},
                    {"summary_title":"Additional Charges","amount":additionalCharges},
                    {"summary_title":"Previous Due","amount":previosDue},
                    {"summary_title":"Partial Payment","amount":partialPayment},
                    
                    ];

                    let summaryOptions = {
                      // Styling
                      theme: "plain", // 'striped', 'grid' or 'plain'
                
                      // Properties
                      //startX: 310, // false (indicates margin top value) or a number
                      // startY: 360, // false (indicates margin top value) or a number
                      startY: doc.autoTableEndPosY(),
                      pageBreak: "auto", // 'auto', 'avoid' or 'always'
                      tableWidth: "auto", // 'auto', 'wrap' or a number,
                      showHeader: "never", // 'everyPage', 'firstPage', 'never',
                      
                
                      styles: {
                        cellPadding: 5, // a number, array or object (see margin below)
                        fontSize: 10,
                        font: "helvetica", // helvetica, times, courier
                        // lineColor: 200,
                        // lineWidth: 0,
                        fontStyle: "normal", // normal, bold, italic, bolditalic
                        overflow: "ellipsize", // visible, hidden, ellipsize or linebreak
                        fillColor: false, // false for transparent or a color as described below
                        textColor: 20,
                        halign: "right", // left, center, right
                        valign: "middle", // top, middle, bottom
                        columnWidth: "auto" // 'auto', 'wrap' or a number
                      },
                      columnStyles: { 
                        comments:{columnWidth:260, textColor: 20, fontStyle: 'bold', halign:'left',valign:'middle',lineWidth: 0.5},
                        summary_title:{columnWidth:120,fontStyle: 'bold'},
                        amount:{ columnWidth: 150,lineWidth: 0.5}
                      },
                      
                    };

                    // create bill details summary table
                    doc.autoTable(getSummaryColumns(), summaryRows, summaryOptions);


                    // ************** Total Table ************************************************************

                    var getTotalColumns = function () {
                      return [
                          {title: "gap", dataKey: "gap"},
                          {title: "Total", dataKey: "total_title"},
                          {title: "amount", dataKey: "amount"} 
                      ];
                    };
                      
                    let totalRow = [
                      { "gap": "","total_title":"Total","amount":totalAmount}  
                    ];

                    let totalRowOptions = {
                      // Styling
                      theme: "plain", // 'striped', 'grid' or 'plain'

                      // Properties
                      // startX: 310, // false (indicates margin top value) or a number
                      // startY: 360, // false (indicates margin top value) or a number
                      startY: doc.autoTableEndPosY(),
                      pageBreak: "auto", // 'auto', 'avoid' or 'always'
                      tableWidth: "auto", // 'auto', 'wrap' or a number,
                      showHeader: "never", // 'everyPage', 'firstPage', 'never',
                      

                      styles: {
                        cellPadding: 5, // a number, array or object (see margin below)
                        fontSize: 10,
                        font: "helvetica", // helvetica, times, courier
                        // lineColor: 200,
                        // lineWidth: 0,
                        fontStyle: "normal", // normal, bold, italic, bolditalic
                        overflow: "ellipsize", // visible, hidden, ellipsize or linebreak
                        fillColor: false, // false for transparent or a color as described below
                        textColor: 20,
                        halign: "right", // left, center, right
                        valign: "middle", // top, middle, bottom
                        columnWidth: "auto" // 'auto', 'wrap' or a number
                      },
                      columnStyles: { 
                        gap:{columnWidth:260, },
                        total_title:{columnWidth:120,fontStyle: 'bold',lineWidth: 0.5,fillColor: [0, 0, 0],fontSize: 14,textColor: 255},
                        amount:{ columnWidth: 150,lineWidth: 0.5,fontStyle: 'bold',fontSize: 14}
                      },
                      
                      };

                      // create bill details summary total
                      doc.autoTable(getTotalColumns(), totalRow, totalRowOptions);

                      // ************** STB/VC Table ************************************************************

                      var getSTBColumns = function () {
                        return [
                            {title: "title", dataKey: "title"},
                            {title: "Details", dataKey: "details"}
                        ];
                      };
                
                      let stbRow = [
                        { "title":"Number of Boxes","details": stb_count} ,
                        { "title":"STB #","details": stb_number} ,
                        { "title":"VC#","details":  vc_number} ,
                      ];
                
                      let stbRowOptions = {
                        // Styling
                        theme: "plain", // 'striped', 'grid' or 'plain'
                  
                        // Properties
                        // startX: 310, // false (indicates margin top value) or a number
                        // startY: 360, // false (indicates margin top value) or a number
                        startY: doc.autoTableEndPosY() + 10,
                        pageBreak: "auto", // 'auto', 'avoid' or 'always'
                        tableWidth: "auto", // 'auto', 'wrap' or a number,
                        showHeader: "never", // 'everyPage', 'firstPage', 'never',
                        
                  
                        styles: {
                          cellPadding: 5, // a number, array or object (see margin below)
                          fontSize: 8,
                          font: "helvetica", // helvetica, times, courier
                          lineColor: 200,
                          lineWidth: 0.5,
                          fontStyle: "normal", // normal, bold, italic, bolditalic
                          overflow: "linebreak", // visible, hidden, ellipsize or linebreak
                          fillColor: false, // false for transparent or a color as described below
                          textColor: 20,
                          halign: "left", // left, center, right
                          valign: "middle", // top, middle, bottom
                          columnWidth: "auto" // 'auto', 'wrap' or a number
                        },
                        columnStyles: { 
                          title:{columnWidth:80, },
                          details:{columnWidth:450, },
                
                          // total_title:{columnWidth:120,fontStyle: 'bold',lineWidth: 0.5,fillColor: [0, 0, 0],fontSize: 14,textColor: 255}
                          
                        },
                        // margin: {top: 15},
                        };
                
                        // create stb details table
                        doc.autoTable(getSTBColumns(), stbRow, stbRowOptions);
                      
                
                        // Set Footer
                        doc.setLineWidth(1);
                        doc.line(15, 825, 580, 825);
                        doc.setFontSize(6);
                        doc.setFontType('normal');
                        doc.text('**This is a computer generated invoice and does not require any signature',15,837);
                        doc.setFontSize(8);
                        doc.setFontType('bold');
                        doc.text('Thank You',282,837);



                    // add a new page for next invoice
                    doc.addPage('p','pt','a4');

              });

              swal.close();
              
              // save pdf
              doc.save(fileName);




            } else {
              
              const toast = this._notificationService.error('Error!', 'Invoice generation failed.', {
                timeOut: 350,
                showProgressBar: true,
                pauseOnHover: true,
                clickToClose: true
              });

            }


          }.bind(this)
        );
      });



    

    

  }


  
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


}
// -------------------  Component & Class Definition - End ---------------------------------------------
