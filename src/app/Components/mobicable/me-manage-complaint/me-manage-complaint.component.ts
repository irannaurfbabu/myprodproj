/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR MANAGE AREA ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   27-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Get the data of all compliant for the owner
|   ++ Render the complaint data in tabular format with ability to :-
|      ** Ability to Create New Complaint
|      ** Ability to Edit Complaint
|      ** Ability to Disable Complaint
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 27-JAN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities

import { Component, OnInit, NgZone } from "@angular/core";
import { Sort } from "@angular/material";
import { PersistenceService } from "angular-persistence";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { RouterModule } from "@angular/router";
import { NgProgressRouterModule } from "@ngx-progressbar/router";
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';


// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { MeComplaintInterface } from "../../../Service/Interfaces/me-complaint-interface";
import { MeGzipService } from '../../../Service/me-gzip.service';

declare var jQuery: any;
declare var $: any;
declare var M: any;
declare var require: any;

//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start ------------------------------------------------
@Component({
  selector: 'app-me-manage-complaint',
  templateUrl: './me-manage-complaint.component.html',
  styleUrls: ['./me-manage-complaint.component.css']
})
export class MeManageComplaintComponent implements OnInit {
  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  --------------------------------------------------------------------------------------------------

  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput: any = "";
  private _userProfileData: any;
  private _userLogin: any;

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  showLoader: boolean = true;
  showNoRecords: boolean = false;

  _complaintsList: MeComplaintInterface[] = [];

  // Tera DataTable Local Fields
  filteredData: any[] = [];
  filteredTotal: number = 0;

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 50;
  sortBy: string = 'rownum';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  // Tera DataTable Set Column name/Label and other features.
  columns: ITdDataTableColumn[] = [
    { name: 'rownum', label: '#',  filter: true, sortable: true, width: 40 },
    { name: 'customer_id', label: 'Cust Id', filter: true, sortable: true, width: 150 },
    { name: 'customer_name', label: 'Name', filter: true, sortable: true, width: 200 },
    { name: 'area_name', label: 'Area', sortable: true, filter: true, width: 150 },
    { name: 'complaint_title', label: 'Complaint Title', sortable: true, filter: true, width: 300 },
    { name: 'complaint_status', label: 'Status', sortable: true, filter: true, width: 140  },
    { name: 'complaint_date', label: 'Reported Date', sortable: true  },
    { name: 'complaint_id', label: 'Action', sortable: false}
    ]; 
  
  // function to open left side navgivation bar
  _opened: boolean = false;
 
  //  ~ End  ----------------------------------------------------------------------------------------------------

  // --  @details :  constructor #################################################################################
  //  ~ Start  ---------------------------------------------------------------------------------------------------

  constructor(
    public callHttpGet: MeCallHttpGetService,
    public userProfileService: MeUserProfileService,
    private complaintPersistenceService: PersistenceService,
    private zone: NgZone,
    private _dataTableService: TdDataTableService,
    private gzipService       :MeGzipService,
  ) { }

  ngOnInit() {

     // teradata initialize filter
     this.filter();

    // initialize and execute jquery document ready    
    this.zone.run(() => {
      // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
      // https://angular.io/api/core/NgZone

      $(document).ready(function(){
        
        $('select').select(); 

      });
    });

    this.showLoader = true;
    this.showNoRecords = false;

    console.log(
      "%c ---------------------------- *****  Inside Manage Complaint component ngonInit ***** ---------------------------- ",
      "background: #00838f;color: white; font-weight: bold;"
    );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.complaintPersistenceService.get(
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

     
      // get the Input JSON format for making http request.
      this.getRequestInput = this.callHttpGet.createGetRequestRecord(
        this._userProfileData.ownerDetails
      );
      console.log(
        "%c  Request Input : >>> ",
        "color: green; font-weight: bold;",
        this.getRequestInput
      );

       // make call for retrieving Complaint List
        //  ~ Start  -------------------------------------------------------------------------------------------------
        this.callHttpGet.makeRequest_ManageComplaint(this.getRequestInput).subscribe(response => {

          this.gzipService.makeRequest_uncompress(response).then(function(result) {
              
            this._complaintsList = result.complaintsList;
                console.log('this._complaintsList',this._complaintsList);
            // Check the Response Array List and Display the data in tabular Format
            // If the Response Array List is blank/no-records - display no reacords in the table - set showNoRecords flag true
            if (this._complaintsList.length > 0) {
              this.showLoader = false;
            
              this.filteredData = this._complaintsList;
              this.filteredTotal = this._complaintsList.length;
              this.filter();
            } else {
              this.showLoader = false;
              this.showNoRecords = true;
            }
          }.bind(this))
        

          });

        // ~ End  -------------------------------------------------------------------------------------------------
      });
  }


  //  ~ End -ngOnInit  -------------------------------------------------------------------------------------
  // --  @details :  Class Functions for the Component #######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

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

  filter(): void {
    let newData: any[] = this._complaintsList;
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

  // ~ End -----------------------------------------------------------------------------------------

  
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

// -------------------  Component & Class Definition - Start ---------------------------------------------
