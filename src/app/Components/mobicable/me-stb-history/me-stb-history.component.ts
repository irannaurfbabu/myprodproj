import { Component, OnInit, Output , EventEmitter , Input } from '@angular/core';
import { MeCallHttpGetService } from '../../../Service/me-call-http-get.service';
import { PersistenceService } from 'angular-persistence';
import { MeUserProfileService } from '../../../Service/me-user-profile.service';
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { ActivatedRoute } from '@angular/router';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';
import * as _ from "lodash";


// declare var resultObj :any;
@Component({
  selector: 'app-me-stb-history',
  templateUrl: './me-stb-history.component.html',
  styleUrls: ['./me-stb-history.component.css']
})
export class MeStbHistoryComponent implements OnInit {

  @Input() setCustNumObj: any;
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
  showNoRecords : boolean = true;
  showLoader   : boolean = true;

  _STBStatusList: any     = [];
  customer_number_param : any     = "";
  stbDetailsList : any =[];
  stbdetails: any = [];
  stbHistoryList: any = [];
  resultArray: any = [];
  displayData: any = [];

  constructor(
    public  callHttpGet                      : MeCallHttpGetService,
    private customerDetailsPersistenceService: PersistenceService,
    public  userProfileService               : MeUserProfileService,
    public  route                            : ActivatedRoute,
    private _dataTableService: TdDataTableService
  ) 
  {

  }

  //  ~ Start -ngOnChanges  ---------------------------------------------------------------------------------------
  // --  @details :  ngOnChanges ##################################################################################
  // ngOnChanges get updated customerNumber
  
    ngOnChanges(setCustNumObj:any) {
      // console.log('on change',this.setCustNumObj);
      this.customer_number_param = this.setCustNumObj;
      this._STBStatusList = [];
      this.ngOnInit();
    }

  //  ~ End -ngOnChanges  ---------------------------------------------------------------------------------------


  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start -ngOnInit  ---------------------------------------------------------------------------------------

  ngOnInit() {

    //initialize loader
    this.showLoader    = true;
    this.showNoRecords = false;

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
      this.customer_number_param = +this.route.snapshot.params["id"];
      // this.postRequestCustomerObject.records[0].customer_number =this.customer_number_param;
      console.log('postRequestCustomerObject payment',this.postRequestCustomerObject);      

    }
  
    // console.log('this.customer_number_param outside',this.customer_number_param);
    // initialize 
    this.postRequestCustomerObject.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
    this.postRequestCustomerObject.records[0].customer_number =this.customer_number_param;
    console.log('postRequestCustomerObject payment',this.postRequestCustomerObject);


    // Subscribing to get GetCustomerPayments
    this.callHttpGet.makeRequest_getSTBStatusReport(this.postRequestCustomerObject).subscribe(response => {
      console.log(
      "%c STBStatus List ***** ----------------------------------------------------------- ",
      "background: #ff5722;font-weight: bold;color: white; "
      );
     
      console.log('stb status response',response.STBStatusList);
      this._STBStatusList = response.STBStatusList;
      

      if (this._STBStatusList) {
        
        this.stbDetailsList = _.uniq(this._STBStatusList.stb_details);
        console.log('stbDetailsList:',this.stbDetailsList);

        let stbIdList = [];
        let stbResult = [];
        let stbResulstList = [];

        // stbIdList contains only stb_id got from stbDetailsList
        this.stbDetailsList.map(item => {
          return {
              stb_id : item.stb_id
          }
        }).forEach(item => stbIdList.push(item));

        // console.log('stbIdList:',stbIdList);

        let stbHistoryLists = this._STBStatusList.stb_history;
        // console.log('stbHistoryLists:',stbHistoryLists);
       
        _.forEach(stbIdList, function(value, key) {
       
          // console.log('value',value);

          stbResult = _.filter(stbHistoryLists, function(obj) { 
           
            return obj.stb_id == value.stb_id;
          });
          
          stbResulstList.push(stbResult);
          // console.log('stbResulstList',stbResulstList);
         
        });
     
        this.resultArray = stbResulstList;
        // console.log('this.resultArray',this.resultArray);

        this.displayData = {"stbList":stbResulstList};
        console.log('this.displayData',this.displayData);
        
        this.showNoRecords=false;
        this.showLoader = false;

      } 
      else 
      {

        this.showNoRecords = true;
        this.showLoader = false;
      }


    });
    // makeRequest_GetSubscriptionList() ~ End  ----------------------------------------------------------------------------------------

  }
  //  ~ End - OnInit()  -------------------------------------------------------------------------------------------------

}
// -------------------  Component & Class Definition - End ---------------------------------------------
