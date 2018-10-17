/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR MANAGE AREA ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Get the data of all area for the owner
| ++ Render the area data in tabular format with ability to: -
|      ** Ability to Create New Area
|      ** Ability to Edit Area
|      ** Ability to Disable Area
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 24-JAN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start_________________________________________________________________________________________________
// Import Angular Core Libraries/Functionalities

import { Component, OnInit, NgZone } from "@angular/core";
import { Sort } from "@angular/material";
import { PersistenceService } from "angular-persistence";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { RouterModule } from "@angular/router";
import { NgProgressRouterModule } from "@ngx-progressbar/router";
import { SweetAlert2Module } from "@toverux/ngx-sweetalert2";
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';

// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { MeAreaInterface } from "../../../Service/Interfaces/me-area-interface";
import { MeGzipService } from '../../../Service/me-gzip.service';

// below variables declared for Jquery and Material script
// $ for jQuery functions and M for Material functions
declare var jQuery: any;
declare var $     : any;
declare var M     : any;
declare var require: any;


//  ~ End__________________________________________________________________________________________________


// -------------------  Component & Class Definition - Start ------------------------------------------------
@Component({
  selector   : "app-me-manage-area",
  templateUrl: "./me-manage-area.component.html",
  styleUrls  : ["./me-manage-area.component.css"]
})
export class MeManageAreaComponent implements OnInit {
  // -- @details : Class variable declaration ################################################################
  //  ~ Start_________________________________________________________________________________________________

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  showLoader   : boolean = true;
  showNoRecords: boolean = false;

  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput : any   = "";
  private _userProfileData: any;
  private _userLogin      : any;
  private _areaList       : MeAreaInterface[] = [];

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
    { name: 'rownum', label: '#',  filter: true, sortable: true, width:60 },
    { name: 'area_name', label: 'Area Name', filter: true, sortable: true },
    { name: 'city', label: 'City/Town', filter: true, sortable: true },
    { name: 'state', label: 'State', sortable: true },
    { name: 'pincode', label: 'pincode', sortable: true },
    { name: 'num_of_customers', label: 'No. of Customers', sortable: true },
    { name: 'active', label: 'Status', sortable: true  },
    { name: 'area_id', label: 'Action', sortable: false }
    ];  

  //  ~ End___________________________________________________________________________________________________

  // --  @details :  constructor ##############################################################################
  //  ~ Start - constructor____________________________________________________________________________________

  constructor(
    public  callHttpGet           : MeCallHttpGetService,
    public  userProfileService    : MeUserProfileService,
    private areaPersistenceService: PersistenceService,
    private zone                  : NgZone,
    private _dataTableService: TdDataTableService,
    private gzipService       :MeGzipService,
  ) {}

  //  ~ End - constructor_____________________________________________________________________________________

  // --  @details :  ngOnInit ###############################################################################
  //  ~ Start - ngOnInit_____________________________________________________________________________________
  ngOnInit() {
    
    //initialize loader
    this.showLoader    = true;
    this.showNoRecords = false;

    // teradata initialize filter
    this.filter();
 
    
    // initialize and execute jquery document ready
    this.zone.run(() => {
      // https://stackoverflow.com/questions/44919905/how-to-invoke-a-function-within-document-ready-in-angular-4
      // https://angular.io/api/core/NgZone

      $(document).ready(function() {
        $("select").select();
      });
    });


    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.areaPersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );
    
    // make call to get user profile details
    //  ~ Start  --------------------------------------------------------------- 
    this.userProfileService.makeRequest_UserProfile(this._userLogin).subscribe(response => {
        //assign user profile data from the response
         this._userProfileData = response;

         // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this._userProfileData.ownerDetails
        );
        
        // make call for retrieving Area List
        //  ~ Start  ------------------------------------------------------------ 
        this.callHttpGet.makeRequest_GetArea(this.getRequestInput).subscribe(response => {
           
          this.gzipService.makeRequest_uncompress(response).then(function(result) {
              // console.log('result response',result.areaList);
              this._areaList=result.areaList;
           
            if (this._areaList.length > 0) {
              this.showLoader = false;

              this.filteredData = this._areaList;
              this.filteredTotal = this._areaList.length;
              
              this.filter();
            } else {
              this.showLoader    = false;
              this.showNoRecords = true;
            }

          }.bind(this)) 

          
          });

        // ~ End  -----------------------------------------------------------------------------------------
      });
  }   //  ~ End - ngOnInit_____________________________________________________________________________________

  
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
    let newData: any[] = this._areaList;
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

// -------------------  Component & Class Definition - Start ---------------------------------------------
