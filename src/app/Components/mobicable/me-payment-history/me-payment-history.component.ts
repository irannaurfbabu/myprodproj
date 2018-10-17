/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR PAYMENT HISTORY ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   23-MAY-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for Payment history details retrieval
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 23-MAY-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities
import {
  Component,
  OnInit, Input 
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";

// Import Custom Libraries/Functionalities/Services
import { MeUserProfileService } from "../../../Service/me-user-profile.service";
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import { MeCallHttpGetService } from "../../../Service/me-call-http-get.service";

// Import Custom Libraries/Functionalities/Services
import { PersistenceService } from "angular-persistence";
import { MatDividerModule } from "@angular/material/divider";
import { MeDataExchangeService } from "../../../Service/me-data-exchange.service";


//  ~ End  -------------------------------------------------------------------------------------------------

// -------------------  Component & Class Definition - Start -----------------------------------------------

@Component({
  selector: "app-me-payment-history",
  templateUrl: "./me-payment-history.component.html",
  styleUrls: ["./me-payment-history.component.css"]
})
export class MePaymentHistoryComponent implements OnInit {
  // -- @details : Class variable declaration ###################################################################
  //  ~ Start - variable declaration _____________________________________________________________________________

  // Class Local variables
  // All variables used within the class must be private

  @Input() setCustomerObj: any;

  // Local Variables
  public id           : any;
  public source       : string;
  public showNoRecords: boolean = true;
  public showLoader   : boolean = true;
  public customerName : any = "";
  public message      : any;

  // Private Variables
  private _customerDetails_obj: any;
  private getRequestInput     : any = "";
  private customerNumber      : any = "";
  private customerObject : any = {};
   reportCols          : any[];
  private _userLogin          : any;
  private _userProfileData    : any;
  private _CustomerPaymentList: any = [];
  private postRequestCustomerObject: any = {
    records: [
      {
        owner_id: null,
        customer_number: null 
      }
    ]
  };

  // Tera DataTable Local Fields
  paymentArray: any[] = [];

  // --  @details :  constructor #############################################################################
  //  ~ Start -constructor ------------------------------------------------------------------------------------
  constructor(
    public  callHttpGet                      : MeCallHttpGetService,
    private customerDetailsPersistenceService: PersistenceService,
    public  userProfileService               : MeUserProfileService,
    public  route                            : ActivatedRoute,
    public  datepipe                         : DatePipe,
    public  dataExchange                     : MeDataExchangeService
  ) {  }

  //  ~ End -constructor  --------------------------------------------------------------------------------------

  // --  @details :  ngOnInit ##################################################################################
  //  ~ Start -ngOnInit  ---------------------------------------------------------------------------------------
  ngOnInit() {

    console.log("ngOnInit - Inside Payment History");
  

    //initialize loader
    this.showLoader = true;
    this.showNoRecords = false;
    this.paymentArray = [];

    //initialize  and set report columns
    this.reportCols = [
      {
        field: "payment_date",
        header: "Payment Date",
        width: "180",
        isVisible: "false"
      },
      {
        field: "payment_month",
        header: "Month",
        width: "120",
        isVisible: "false"
      },
      {
        field: "payment_amount",
        header: "Amount",
        width: "120",
        isVisible: "false"
      },
      {
        field: "mode_of_payment",
        header: "Mode of Payment",
        width: "150",
        isVisible: "false"
      },
      {
        field: "user_name",
        header: "Agent Name",
        width: "150",
        isVisible: "false"
      },
      {
        field: "payment_remarks",
        header: "Remarks",
        width: "150",
        isVisible: "false"
      }
    ];

   
    console.log(this.customerObject);

    // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.customerDetailsPersistenceService.get(
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
          "----------------- User Profile Response payment ----------------- "
        );
        console.log(this._userProfileData);
        console.log(this._userProfileData.ownerDetails);


        //subscribe for data exchange
  this.dataExchange.currentMessage.subscribe( message => (this.message = message) );

  console.log("--- Message ---");
  console.log(this.message);

  // assign received message
  this.customerObject =   this.message;

  if (this.customerObject) {
    this.customerName = this.customerObject.customerName;
    this.customerNumber = this.customerObject.customerNumber;

    // initialize
    this.postRequestCustomerObject.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
    this.postRequestCustomerObject.records[0].customer_number = this.customerNumber;
    console.log(
      "postRequestCustomerObject payment",
      this.postRequestCustomerObject
    );
  } 

  // Subscribing to get GetCustomerPayments
  this.callHttpGet
    .makeRequest_GetCustomerPayments(this.postRequestCustomerObject)
    .subscribe(response => {
      console.log(
        "%c Subscription List ***** ----------------------------------------------------------- ",
        "background: #ff5722;font-weight: bold;color: white; "
      );

      this._CustomerPaymentList = response.customerPaymentsList;

      if (this._CustomerPaymentList.length > 0) {
        // console.log('areaList:',this._CustomerPaymentList);

        this.paymentArray = this._CustomerPaymentList;

        this.showNoRecords = false;
        this.showLoader = false;
      } else {
        this.showLoader = false;
        this.showNoRecords = true;
      }
    });
  // makeRequest_GetCustomerPayments() ~ End  ----------------------------------------------------------------------------------------
       
      });
    // ~ End  -------------------------------------------------------------------------------------------------
  }

  //  ~ End -ngOnInit  -------------------------------------------------------------------------------------

  // --  @details :  Class Functions for the Component #######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
 
  ngOnChanges(setCustomerObj:any) {
 
    this.customerObject = "";
    this.ngOnInit();


  }

 

  // ~ End -----------------------------------------------------------------------------------------


  //  ## @details : Declare ngOnDestroy 	########################
  // ____________________________________________________________________________________________
  //  ~ Start -ngOnDestroy -------------------------------------------------------------------------
  ngOnDestroy() {

    // console.log("--- Inside Send Message ---");
    this.dataExchange.pushExchangeData('default');

    // unsubscribe
    this.dataExchange.currentMessage.unsubscribe;


  }

  //  ~ End    -ngOnDestroy -------------------------------------------------------------------------




}
// -------------------  Component & Class Definition - Start ---------------------------------------------
