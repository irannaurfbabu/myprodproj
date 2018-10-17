import { Component, OnInit, Output , EventEmitter , Input } from '@angular/core';
import { MeCallHttpGetService } from '../../../Service/me-call-http-get.service';
import { PersistenceService } from 'angular-persistence';
import { MeUserProfileService } from '../../../Service/me-user-profile.service';
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { ActivatedRoute } from '@angular/router';
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';
const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);

@Component({
  selector: 'app-me-stb-details',
  templateUrl: './me-stb-details.component.html',
  styleUrls: ['./me-stb-details.component.css']
})
export class MeStbDetailsComponent implements OnInit {

  @Input() setCustNumObj: any;
  private _customerDetails_obj   : any;
  private getRequestInput        : any = "";
  private _userLogin             : any;
  private _userProfileData       : any;
  private postRequestCustomerObject: any =
  {
    records: [{
 
        owner_id: null,
        customer_number: null,
       
     
    }]
  };


// Local Variables
  showNoRecords         :boolean=true;
  showLoader   : boolean = true;

  _SubscriptionList     :any=[];
  customer_number_param : any     = "";

  //Url Variabes for routing
  public id:any;
  public source:string;

  // Tera DataTable Local Fields
 filteredData: any[] = [];
 filteredTotal: number = 0;

 searchTerm: string = '';
 fromRow: number = 1;
 currentPage: number = 1;
 pageSize: number = 50;
 sortBy: string = 'subscription_name';
 selectedRows: any[] = [];
 sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  // Tera DataTable Set Column name/Label and other features.
    columns: ITdDataTableColumn[] = [
      { name: 'subscription_name', label: 'Subscription Name', filter: true, sortable: true,width:180},
      { name: 'stb_number', label: 'STB#', filter: true, sortable: true,width:210},
      { name: 'stb_vc_number', label: 'VC#', filter: true, sortable: true,width:210},
      { name: 'service_status', label: 'Status', sortable: true,width:130 },
      { name: 'base_price', label: 'Rent',numeric: true, format: DECIMAL_FORMAT, sortable: true, filter: true,width:90},
      { name: 'total_tax', label: 'Tax',numeric: true, format: DECIMAL_FORMAT, sortable: true, filter: true,width:90},
      { name: 'total_amount', label: 'Total',numeric: true, format: DECIMAL_FORMAT, sortable: true, filter: true,width:90},
    ]; 

  constructor(
    public  callHttpGet                      : MeCallHttpGetService,
    private customerDetailsPersistenceService: PersistenceService,
    public  userProfileService               : MeUserProfileService,
    public  route                            : ActivatedRoute,
    private _dataTableService: TdDataTableService
  ) { 

      // this.customer_number_param = +this.route.snapshot.params["id"];
  
     
  }

  // --  @details :  ngOnChanges ##################################################################################
  //  ~ Start -ngOnChanges  ---------------------------------------------------------------------------------------
  // ngOnChanges get updated customerNumber
  
    ngOnChanges(setCustNumObj:any) {
      // console.log('on change',this.setCustNumObj);
      this.customer_number_param = this.setCustNumObj;
      this.filteredData = [];
      this.filteredTotal = 0;
      this.ngOnInit();
    }
  
  //  ~ End -ngOnChanges  ---------------------------------------------------------------------------------------


  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start -ngOnInit  ---------------------------------------------------------------------------------------

  ngOnInit() {

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.customerDetailsPersistenceService.get(
      "userLogin",
      StorageType.SESSION
    );
    console.warn("----------------- User Login STB ----------------- ");
    console.dir(this._userLogin);
  
    // make call to get user profile details
    //  ~ Start  -------------------------------------------------------------------------------------------------
      this.userProfileService.makeRequest_UserProfile(this._userLogin).subscribe(response => {
        this._userProfileData = response;

        console.warn(
          "----------------- User Profile Response payment STB ----------------- "
        );
        console.log(this._userProfileData);
        console.log(this._userProfileData.ownerDetails);

      });

    // ~ End  -------------------------------------------------------------------------------------------------

    if(this.setCustNumObj) {

      this.customer_number_param = this.setCustNumObj;
      console.log('this.customer_number_param',this.customer_number_param);

    }
    else 
    {

      this.route.queryParams.subscribe(params => {
        this.id = params["id"];
        this.source = params["Source"];
      });

      this.customer_number_param = +this.id;
      // this.postRequestCustomerObject.records[0].customer_number =this.customer_number_param;
      console.log('postRequestCustomerObject payment',this.postRequestCustomerObject);      

    }
  
    // console.log('this.customer_number_param outside',this.customer_number_param);
    // initialize 
    this.postRequestCustomerObject.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
    this.postRequestCustomerObject.records[0].customer_number =this.customer_number_param;
    console.log('postRequestCustomerObject payment',this.postRequestCustomerObject);


    // Subscribing to get GetCustomerPayments
    this.callHttpGet.makeRequest_GetCustomerSubscription(this.postRequestCustomerObject).subscribe(response => {
      console.log(
      "%c Subscription List  STB***** ----------------------------------------------------------- ",
      "background: #ff5722;font-weight: bold;color: white; "
      );

      this._SubscriptionList = response.subscription;
      this.filteredData=this._SubscriptionList;
      this.filteredTotal = this._SubscriptionList.length;
      this.filter();

      console.log('this.filteredData:',this.filteredData);

      if(this._SubscriptionList.length !=0){
        this.showNoRecords=false;
        this.showLoader = false;
      }

      // console.log('makeRequest_GetCustomerPayments payment',this._SubscriptionList);
    });
    // makeRequest_GetSubscriptionList() ~ End  ----------------------------------------------------------------------------------------

  }
  //  ~ End - OnInit()  -------------------------------------------------------------------------------------------------

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
    let newData: any[] = this._SubscriptionList;
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


}
