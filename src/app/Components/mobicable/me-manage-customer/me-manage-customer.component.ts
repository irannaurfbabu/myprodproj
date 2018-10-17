/*
_________________________________________________________________________________________________
## COMPONENT OBJECT FOR MANAGE CUSTOMER ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   29-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Get the data of all area for the owner
|   ++ Render the area data in tabular format with ability to :-
|      ** Ability to Create New Customer
|      ** Ability to Edit Customer
|      ** Ability to Disable Customer
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 29-JAN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities
import { Component, OnInit, NgZone } from '@angular/core';
import { PersistenceService } from "angular-persistence";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { RouterModule,NavigationExtras,Router } from "@angular/router";
import { NgProgressRouterModule } from "@ngx-progressbar/router";
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';


// Import Custom Libraries/Functionalities/Services
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { MeGzipService } from '../../../Service/me-gzip.service';

declare var require: any;
declare var jQuery: any;
declare var $: any;



//  ~ End__________________________________________________________________________________________________


// -------------------  Component & Class Definition - Start ------------------------------------------------
@Component({
  selector: 'app-me-manage-customer',
  templateUrl: './me-manage-customer.component.html',
  styleUrls: ['./me-manage-customer.component.css']
})
export class MeManageCustomerComponent implements OnInit {

  // -- @details : Class variable declaration ################################################################
  //  ~ Start_________________________________________________________________________________________________

  // Class Local variables
  // All variables used within the class must be private
  getRequestInput: any = "";
  _userProfileData: any;
  _userLogin: any;
  _customersList:any[] = [];
  customersListObj:any[] = [];

  // Class Form variables
  // All variables used in component template ( html file ) must be public
  showLoader: boolean = true;
  showNoRecords: boolean = false;

  private getRequestInputObj : any = {
    user_id : null,
    owner_id: null,
    customer_number:''
    };

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
   { name: 'customer_id', label: 'Cust Id', filter: true, sortable: true, width: 100 },
   { name: 'full_name', label: 'Name', filter: true, sortable: true, width: 300 },
   { name: 'phone', label: 'Phone', sortable: true, filter: true },
   { name: 'address1', label: 'Address', sortable: true, filter: true, width: 350 },
   { name: 'active', label: 'Status', sortable: true  },
   { name: 'customer_number', label: 'Action', sortable: false }
   ];  

   // function to open left side navgivation bar
  _opened: boolean = false;
  

  //  ~ End___________________________________________________________________________________________________

  // --  @details :  constructor ##############################################################################
  //  ~ Start - constructor____________________________________________________________________________________
  constructor(
    public callHttpGet: MeCallHttpGetService,
    public userProfileService: MeUserProfileService,
    private CustomerPersistenceService: PersistenceService,
    private zone: NgZone,
    private _dataTableService: TdDataTableService,
    private router                  : Router,
    private gzipService       :MeGzipService,
  ) { }


  //  ~ End  ---------------------------------------------------------------------------------------------------

   // --  @details :  ngOnInit ##################################################################################
  //  ~ Start -ngOnInit  -------------------------------------------------------------------------------------------------
  ngOnInit() {

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

     // Fetch the User Login Details Stored in the Cache
     this._userLogin = this.CustomerPersistenceService.get(
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

  
        // assign values to customer request object
        this.getRequestInputObj.owner_id = this._userProfileData.ownerDetails.owner_id;
        this.getRequestInputObj.user_id = this._userProfileData.userDetails.user_id;

        // get the Input JSON format for making http request.
        this.getRequestInput = this.callHttpGet.createGetRequestRecord(
          this.getRequestInputObj
          );
          console.log(
          "%c  Request Input : >>> ",
          "color: green; font-weight: bold;",
          this.getRequestInput
          );
          
        // make call for retrieving Customers List
        //  ~ Start  makeRequest_ManageCustomer()-------------------------------------------------------------------------------------------------
        this.callHttpGet.makeRequest_ManageCustomer(this.getRequestInput).subscribe(response => {
         
            this.gzipService.makeRequest_uncompress(response).then(function(result) {
              console.log('result',result);
              this._customersList = result.customersList; 
            
              // Check the Response Array List and Display the data in tabular Format
              // If the Response Array List is blank/no-records - display no reacords in the table - set showNoRecords flag true
              if (this._customersList.length > 0) {
                this.showLoader = false;
                
                this.filteredData = this._customersList;
                this.filteredTotal = this._customersList.length;
               
                this.filter();
               
              } else {
                this.showLoader = false;
                this.showNoRecords = true;
              }

          }.bind(this))
         
        });
        // ~ End  makeRequest_ManageCustomer()----------------------------------------------------------------

      });
  }
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
    let newData: any[] = this._customersList;
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
  
  // --  @details : EditcustomerLink()#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------

    EditcustomerLink(value){
      console.log('EditcustomerLink');
      let navigationExtras: NavigationExtras = {
        queryParams: {
            "id": value,
            "Source": "managecustomer"
        }
    };
    console.log('navigationExtras',navigationExtras);

    this.router.navigate(["editcustomer"], navigationExtras);
    }

  //  ~ End  ----------------------------------------------------------------------------------------------------

}
// -------------------  Component & Class Definition - Start ---------------------------------------------
