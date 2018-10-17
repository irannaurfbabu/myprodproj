/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR MANAGE USER ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Get the data of all users for the owner
|   ++ Render the User data in tabular format with ability to :-
|      ** Ability to Create New User
|      ** Ability to Edit User
|      ** Ability to Disable User
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 24-JAN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start ________________________________________________________________________________________________
// Import Angular Core Libraries/Functionalities

import { Component, OnInit, NgZone  } from "@angular/core";
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
import { MeUserInterface } from "../../../Service/Interfaces/me-user-interface";
import { MeGzipService } from '../../../Service/me-gzip.service';

declare var jQuery: any;
declare var $: any;
declare var require: any;

//  ~ End _________________________________________________________________________________________________

// -------------------  Component & Class Definition - Start ----------------------------------------------

@Component({
  selector: "app-me-manage-user",
  templateUrl: "./me-manage-user.component.html",
  styleUrls: ["./me-manage-user.component.css"]
})
export class MeManageUserComponent implements OnInit {
  
 // -- @details : Class variable declaration ##############################################################
 //  ~ Start  _____________________________________________________________________________________________

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  showLoader    : boolean       = true;
  showNoRecords: boolean        = false;
  
  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput : any = "";
  private _userProfileData: any;
  private _userLogin      : any;
  private _userList       : MeUserInterface[] = [];

  // function to open left side navgivation bar
  _opened: boolean = false;

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
    { name: 'rownum', label: '#', filter: true, sortable: true, width: 40 },
    { name: 'user_name', label: 'User Name', filter: true, sortable: true },
    { name: 'phone', label: 'User Phone', filter: true, sortable: true },
    { name: 'user_role', label: 'User Role', sortable: true, filter: true },
    { name: 'user_login_id', label: 'User Login', sortable: true, filter: true },
    { name: 'active', label: 'Status', sortable: true },
    { name: 'user_id', label: 'Action', sortable: false, width: 130 }
    ];  

  
  
  //  ~ End _______________________________________________________________________________________________

  // --  @details :  constructor ##########################################################################
  //  ~ Start _____________________________________________________________________________________________

  constructor(
    public  callHttpGet           : MeCallHttpGetService,
    public  userProfileService    : MeUserProfileService,
    private userPersistenceService: PersistenceService,
    private zone                  : NgZone,
    private _dataTableService: TdDataTableService,
    private gzipService       :MeGzipService,
  ) {}

  //  ~ End _______________________________________________________________________________________________

  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start - ngOnInit ---------------------------------------------------------------------------------------
  ngOnInit() {

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
      "%c ---------------------------- *****  Inside Manage User component ngonInit ***** ---------------------------- ",
      "background: #283593;color: white; font-weight: bold;"
    );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.userPersistenceService.get(
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
  
        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this._userProfileData.ownerDetails
        );
        console.log(
          "%c  Request Input : >>> ",
          "color: green; font-weight: bold;",
          this.getRequestInput
        );

        // make call for retrieving User List
        //  ~ Start  -------------------------------------------------------------------------------------------------
          this.callHttpGet.makeRequest_ManageUser(this.getRequestInput).subscribe(response => {
        
            this.gzipService.makeRequest_uncompress(response).then(function(result) {
              
              this._userList = result.usersList;

              // Check the Response Array List and Display the data in tabular Format
              // If the Response Array List is blank/no-records - display no reacords in the table - set showNoRecords flag true
              if (this._userList.length > 0) {
                this.showLoader = false;
              
                this.filteredData = this._userList;
                this.filteredTotal = this._userList.length;
                this.filter();
              } else {
                this.showLoader = false;
                this.showNoRecords = true;
              }
          }.bind(this)) 

          });

        //  ~ End  ---------------------------------------------------------------------------------------------
      });
    //  ~ End  -------------------------------------------------------------------------------------------------
  }

  //  ~ End -ngOnInit --------------------------------------------------------------------------------------------

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
    let newData: any[] = this._userList;
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

    console.log("**** @@ Sidebar Open Object @@ ****");
    console.log(this._opened);

  }
  //  ~ End  ----------------------------------------------------------------------------------------------------


}

// -------------------  Component & Class Definition - Start ---------------------------------------------

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
