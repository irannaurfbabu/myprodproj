/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR MANAGE PAYMENTS ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Get the data of payments details for a owner
|   ++ Render the pack data in tabular format with ability to :-
|      ** Ability to Add Balance
|      ** Ability to make collection
|      ** Ability to make reversal
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

import { Component,         OnInit,    NgZone }    from "@angular/core";
import { PersistenceService }          from   "angular-persistence";
import { NgProgressModule,  NgProgress }      from "@ngx-progressbar/core";
import { RouterModule , ActivatedRoute, Router,NavigationExtras      }          from   "@angular/router";
import { NgProgressRouterModule } from "@ngx-progressbar/router";
import { MatMenuModule } from "@angular/material";
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';


// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { MeGzipService } from '../../../Service/me-gzip.service';

const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);

declare var jQuery: any;
declare var $     : any;
declare var M: any;
declare var require: any;

//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start ------------------------------------------------
@Component({
  selector: 'app-me-manage-payments',
  templateUrl: './me-manage-payments.component.html',
  styleUrls: ['./me-manage-payments.component.css']
})
export class MeManagePaymentsComponent implements OnInit {

  // -- @details : Class variable declaration ###################################################################
  //  ~ Start - variable declaratio______________________________________________________________________________

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  showLoader      : boolean = true;
  showNoRecords   : boolean = false;
  
  // Class Local variables
  // All variables used within the class must be private
  private getRequestInput : any = "";
  private _userProfileData: any;
  private _userLogin      : any;
  private _customerBalance: any = [];

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
    { name: 'customer_id', label: 'Cust Id', filter: true, sortable: true, width: 120  },
    { name: 'full_name', label: 'Customer Name', filter: true, sortable: true, width: 250 },
    { name: 'phone', label: 'Phone', sortable: true,  filter: true, width: 120 },
    { name: 'area_name', label: 'Area', sortable: true,  filter: true  },
    { name: 'available_balance', label: 'Avl Balance',  filter: true, sortable: true, numeric: true, format: DECIMAL_FORMAT },
    { name: 'customer_number', label: 'Action', sortable: false },
    { name: 'pending_collection', label: 'pending_collection', sortable: false,hidden: true }
    ];  

    // function to open left side navgivation bar
  _opened: boolean = false;
 

  //  ~ End - variable declaratio_________________________________________________________________________________

  // --  @details :  constructor #################################################################################
  //  ~ Start - constructor_______________________________________________________________________________________
  constructor(
    public  callHttpGet              : MeCallHttpGetService,
    public  userProfileService       : MeUserProfileService,
    private paymentPersistenceService: PersistenceService,
    public  zone                     : NgZone,
    private _dataTableService        : TdDataTableService,
    private router                   : Router,
    private gzipService       :MeGzipService,

  ) {}
  //  ~ End - constructor_______________________________________________________________________________________

  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start - ngOnInit________________________________________________________________________________________
  
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
      "%c ---------------------------- *****  Inside Manage Payment component ngonInit ***** ---------------------------- ",
      "background: #e65100;color: white; font-weight: bold;"
    );

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.paymentPersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );
    console.warn("----------------- User Login ----------------- ");
    console.dir(this._userLogin);


     // make call to get user profile details
    //  ~ Start - Get User Profile -------------------------------------------------------------------------------------------------
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

      // make call to get list of customer balance details
      //  ~ Start  -------------------------------------------------------------------------------------------------

      this.callHttpGet.makeRequest_GetCustomerBalance(this.getRequestInput).subscribe(response => {


        this.gzipService.makeRequest_uncompress(response).then(function(result) {
         
          this._userList = result.usersList;

          this._customerBalance = result.balanceList;

          // Check the Response Array List and Display the data in tabular Format
          // If the Response Array List is blank/no-records - display no reacords in the table - set showNoRecords flag true
          if (this._customerBalance.length > 0) {
            this.showLoader = false;
            
            this.filteredData = this._customerBalance;
            this.filteredTotal = this._customerBalance.length;
            this.filter();
          } else {
            this.showLoader = false;
            this.showNoRecords = true;
          }
          
        }.bind(this)) 

           
        });  //  ~ End  -------------------------------------------------------------------------------------------------


    }); //  ~ End - Get User Profile -------------------------------------------------------------------------------------------------

    // initialize jquery calls
    $(document).ready(function(){
        
      $('select').select(); 
      // $('.dropdown-trigger').dropdown();
     

    });

  }

  //  ~ End - ngOnInit________________________________________________________________________________________

  
  
  
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
    let newData: any[] = this._customerBalance;
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

  NavigatePaymentLink(link,value) 
   {
    console.log('EditcustomerLink');
    let navigationExtras: NavigationExtras = {
      queryParams: {
          "id": value,
          "Source": "managepayments"
      }
  };
  console.log('navigationExtras',navigationExtras);

  this.router.navigate([link], navigationExtras);
  }

}

// -------------------  Component & Class Definition - End ------------------------------------------------


function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
