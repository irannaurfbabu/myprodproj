/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR MANAGE PACK ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Get the data of all packs for the owner
|   ++ Render the pack data in tabular format with ability to :-
|      ** Ability to Create New Pack
|      ** Ability to Edit Pack
|      ** Ability to Disable Pack
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 24-JAN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities

import { Component, OnInit, NgZone } from "@angular/core";
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
import { MePackInterface } from "../../../Service/Interfaces/me-pack-interface";
import { MeGzipService } from '../../../Service/me-gzip.service';

const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);

declare var jQuery: any
declare var $: any;
declare var require: any;


//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start ------------------------------------------------
@Component({
  selector: "app-me-manage-pack",
  templateUrl: "./me-manage-pack.component.html",
  styleUrls: ["./me-manage-pack.component.css"]
})
export class MeManagePackComponent implements OnInit {
  // -- @details : Class variable declaration ###################################################################
  //  ~ Start  --------------------------------------------------------------------------------------------------

  // Class Form variables
  // All variables used in component template ( html file ) must be public
 
  showLoader   : boolean = true;
  showNoRecords: boolean = false;
  
 
  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput: any = "";
  private _userProfileData: any;
  private _userLogin: any;
  private _packList: MePackInterface[] = [];
 

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
    { name: 'pack_name', label: 'Plan Name', filter: true, sortable: true },
    { name: 'base_price', label: 'Base Amount', filter: true, sortable: true, numeric: true, format: DECIMAL_FORMAT },
    { name: 'sgst_amount', label: 'SGST', sortable: true, numeric: true, format: DECIMAL_FORMAT },
    { name: 'cgst_amount', label: 'CGST', sortable: true, filter: true, numeric: true, format: DECIMAL_FORMAT },
    { name: 'total_tax', label: 'Total Tax', sortable: true, filter: true, numeric: true, format: DECIMAL_FORMAT },
    { name: 'total_amount', label: 'Total Amount', sortable: true, filter: true, numeric: true, format: DECIMAL_FORMAT },
    { name: 'stb_count', label: 'No. of stb', sortable: true, filter: true },
    { name: 'active', label: 'Status', sortable: true, filter: true },
    { name: 'pack_id', label: 'Action', sortable: false }
    ];  


  // function to open left side navgivation bar
  _opened: boolean = false;
  ownerCompanyName: String = "";

  //  ~ End  ----------------------------------------------------------------------------------------------------

  // --  @details :  constructor #################################################################################
  //  ~ Start  ---------------------------------------------------------------------------------------------------

  constructor(
    public callHttpGet: MeCallHttpGetService,
    public userProfileService: MeUserProfileService,
    private packPersistenceService: PersistenceService,
    public  zone: NgZone,
    private _dataTableService: TdDataTableService,
    private gzipService       :MeGzipService,
  ) {}

  //  ~ End  ---------------------------------------------------------------------------------------------------

  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start - ngOnInit -------------------------------------------------------------------------------------------------
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
      "%c ---------------------------- *****  Inside Manage Pack component ngonInit ***** ---------------------------- ",
      "background: #e65100;color: white; font-weight: bold;"
    );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.packPersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );
    console.warn("----------------- User Login ----------------- ");
    console.dir(this._userLogin);

    // make call to get user profile details
    //  ~ Start  -------------------------------------------------------------------------------------------------
    this.userProfileService
      .makeRequest_UserProfile(this._userLogin)
      .subscribe(response => {
        this._userProfileData = response;

        console.warn(
          "----------------- User Profile Response ----------------- "
        );
        console.log(this._userProfileData);
        console.log(this._userProfileData.ownerDetails);

         // assigng to display in header nav bar
         this.ownerCompanyName = response.ownerDetails.owner_company_name;

        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this._userProfileData.ownerDetails
        );
        console.log(
          "%c  Request Input : >>> ",
          "color: green; font-weight: bold;",
          this.getRequestInput
        );

        // make call to get list of Packs for the owner
        //  ~ Start  -------------------------------------------------------------------------------------------------

        this.callHttpGet.makeRequest_ManagePack(this.getRequestInput).subscribe(response => {

            this.gzipService.makeRequest_uncompress(response).then(function(result) {

              this._packList = result.packList;

            // Check the Response Array List and Display the data in tabular Format
            // If the Response Array List is blank/no-records - display no reacords in the table - set showNoRecords flag true
            if (this._packList.length > 0) {
              this.showLoader = false;

              // assigning pdackDetails to table data
              this.filteredData = this._packList;
              this.filteredTotal = this._packList.length;
              this.filter();
            } else {
              this.showLoader = false;
              this.showNoRecords = true;
              console.log(this.showNoRecords);
            }
          }.bind(this)) 

          });

        //  ~ End  -------------------------------------------------------------------------------------------------
      });
    //  ~ End  -------------------------------------------------------------------------------------------------
  }

  //  ~ End - ngOnInit ----------------------------------------------------------------------------------------

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
    let newData: any[] = this._packList;
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
