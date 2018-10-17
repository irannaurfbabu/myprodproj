/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR BARCODE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   01-SEP-2018 |   CREATED_BY  |   VIBHA
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Ability to generate barcode
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 01-SEP-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/
// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities
import { Component, OnInit, Input } from '@angular/core';
import { MeCallHttpGetService } from '../../../Service/me-call-http-get.service';
import { PersistenceService } from 'angular-persistence';
import { ActivatedRoute } from '@angular/router';

// Import Custom Libraries/Functionalities/Services
import { MeUserProfileService } from '../../../Service/me-user-profile.service';
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
// import * as jsPDF from 'jspdf';

declare var jsPDF: any; // Important
declare let JsBarcode: any;

//  ~ End  -------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-me-barcode',
  templateUrl: './me-barcode.component.html',
  styleUrls: ['./me-barcode.component.css']
})
export class MeBarcodeComponent implements OnInit {

 // -- @details : Class variable declaration ###################################################################
  //  ~ Start - variable declaration _____________________________________________________________________________

  // Class Local variables
 // All variables used within the class must be private

 @Input() setCustNumObj: any;
 private getRequestInput        : any = "";
 private _userLogin             : any;
 private _userProfileData       : any;
 
 customer_meta : any;

 private postRequestCustomerObject: any =
 {
   records: [{

       owner_id: null,
       customer_number: null,
   }]
 };

 private customer_params : any = {
  "customer_number" : null,
  "owner_id": null
}; 

 customer_number_param : any     = "";
 customerObject   : any;

 //Url Variabes
  public id:any;
  public source:string;

 // Tera DataTable Local Fields
 filteredData: any[] = [];
 filteredTotal: number = 0;

//  ~ End  - variable declaration _______________________________________________________________________________

  constructor(
    public  callHttpGet                      : MeCallHttpGetService,
    private customerDetailsPersistenceService: PersistenceService,
    public  userProfileService               : MeUserProfileService,
    public  route                            : ActivatedRoute,
 
  ) {
    this.customer_number_param = +this.route.snapshot.params["id"];
   }

//  ~ End -constructor  --------------------------------------------------------------------------------------
// --  @details :  ngOnChanges ##################################################################################
  //  ~ Start -ngOnChanges  ---------------------------------------------------------------------------------------
  // ngOnChanges get updated customerNumber
  
  ngOnChanges(setCustNumObj:any) {
    // console.log('on change',this.setCustNumObj);
    this.customer_number_param = this.setCustNumObj;
    console.log('passing customer number to barcode',this.customer_number_param)
    this.filteredData = [];
    this.filteredTotal = 0;


     // Fetch the User Login Details Stored in the Cache
    this._userLogin = this.customerDetailsPersistenceService.get(
    "userLogin",
    StorageType.SESSION
    );
    console.warn("----------------- performa Invoice User Login ----------------- ");
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

    if(this.setCustNumObj) {

    this.customer_number_param = this.setCustNumObj;
    console.log('this.customer_number_param',this.customer_number_param);

    this.customer_params.customer_number = this.customer_number_param;
    this.customer_params.owner_id = this._userProfileData.ownerDetails.owner_id;
    this.customer_params.owner_company_name = this._userProfileData.ownerDetails.owner_company_name;

    // get the Input JSON format for making http request.
    this.getRequestInput = this.callHttpGet.createGetRequestRecord(
    this.customer_params
    );

   //get customer details -- start -------------------------------------------
    this.callHttpGet
    .makeRequest_GetCustomerDetails(this.getRequestInput)
    .subscribe(response => {

      // Log Response - Remove Later
      console.log(
        "%c ---------------------------- *****  Customer Details Response - ngonInit ***** ---------------------------- ",
        "background: #2196f3;color: white; font-weight: bold; display: block;"
      );
       // assign customer details response to local vairable
       this.customerObject = response.customersDetails;
       console.log(this.customerObject[0])

    this.generatePdf();

});   
 
//get customer details -- end -------------------------------------------

}

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


// initialize 
this.postRequestCustomerObject.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
this.postRequestCustomerObject.records[0].customer_number =this.customer_number_param;
console.log('postRequestCustomerObject payment',this.postRequestCustomerObject);



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
console.warn("----------------- performa Invoice User Login ----------------- ");
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


 
 
 if(this.setCustNumObj) {

  this.customer_number_param = this.setCustNumObj;
  console.log('this.customer_number_param',this.customer_number_param);



 this.customer_params.customer_number = this.customer_number_param;
 this.customer_params.owner_id = this._userProfileData.ownerDetails.owner_id;
 this.customer_params.owner_company_name = this._userProfileData.ownerDetails.owner_company_name;

// get the Input JSON format for making http request.
this.getRequestInput = this.callHttpGet.createGetRequestRecord(
  this.customer_params
);

   //get customer details -- start -------------------------------------------
   this.callHttpGet
   .makeRequest_GetCustomerDetails(this.getRequestInput)
   .subscribe(response => {

      // Log Response - Remove Later
      console.log(
        "%c ---------------------------- *****  Customer Details Response - ngonInit ***** ---------------------------- ",
        "background: #2196f3;color: white; font-weight: bold; display: block;"
      );
       // assign customer details response to local vairable
       this.customerObject = response.customersDetails;

});   

}

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
// initialize 
  this.postRequestCustomerObject.records[0].owner_id = this._userProfileData.ownerDetails.owner_id;
  this.postRequestCustomerObject.records[0].customer_number =this.customer_number_param;
  console.log('postRequestCustomerObject payment',this.postRequestCustomerObject);
}
// --  @details : generatePdf()#######################################################
//  ~ Start  -------------------------------------------------------------------------------------------------
  generatePdf()
{
  var pdf = new jsPDF('p', 'pt', 'a4');
  var pageHeight= pdf.internal.pageSize.height;
  console.log(pageHeight)
  var y = pageHeight-800;
  var x = 95
  var xAxis = 155
  console.log(this.customerObject[0].customer_id)
  JsBarcode("#barcode", `${this.customerObject[0].customer_id}`, { height: 25});
  let canvas = document.getElementById('barcode') as HTMLCanvasElement;
  console.log(canvas);
  let dataURL = canvas.toDataURL("image/jpeg");
  pdf.addImage(dataURL, 'JPEG', x, y, 120, 70);
  pdf.setFontSize(12);
  pdf.text(`${this.customerObject[0].full_name}`,xAxis,y,null,null,'center')
  pdf.rect(30, y-20,250,88 )
  pdf.save("Barcode.pdf")
}
//  ~ End  ----------------------------------------------------------------------------------------------------
// --  @details :  receiveCustomerObject (Emit Event)#######################################################
//  ~ Start  -------------------------------------------------------------------------------------------------
receiveCustomerObject($event) {
  // Fetch the Customer Object Value from Event Emitter.
  this.customerObject = $event;
  console.log("**** @@ Customer Object @@ ****");
  console.log(this.customerObject);
  }
//  ~ End  ----------------------------------------------------------------------------------------------------
}


