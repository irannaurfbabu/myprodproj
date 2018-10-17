/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR Proforma Invoice ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   THAPAS
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for user profile retrieval
|   ++ Ability to add balance/credit for a customer
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
import { Component, OnInit, Input } from '@angular/core';
import { MeCallHttpGetService } from '../../../Service/me-call-http-get.service';
import { PersistenceService } from 'angular-persistence';
import { ActivatedRoute } from '@angular/router';
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';

// Import Custom Libraries/Functionalities/Services
import { MeUserProfileService } from '../../../Service/me-user-profile.service';
import { StorageType } from "../../../Service/Interfaces/storage-type.enum";
import swal from "sweetalert2";
import * as moment from 'moment';
// import * as jsPDF from 'jspdf';

declare var jQuery: any;
declare var $     : any;
declare var M: any;
declare var jsPDF: any; // Important

 

//  ~ End  -------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-me-proforma-invoice',
  templateUrl: './me-proforma-invoice.component.html',
  styleUrls: ['./me-proforma-invoice.component.css']
})
export class MeProformaInvoiceComponent implements OnInit {

 // -- @details : Class variable declaration ###################################################################
  //  ~ Start - variable declaration _____________________________________________________________________________

  // Class Local variables
 // All variables used within the class must be private

 @Input() setCustNumObj: any;
 private _customerDetails_obj   : any;
 private getRequestInput        : any = "";
 private _userLogin             : any;
 private _userProfileData       : any;
 private currentDate            = new Date().toString();
private presentDate             = new Date().toLocaleString();

 private _latestBill   : any;
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

  rent_amount            : any = "";
  totalTax               : any = "";
  billAmount             : any = "";
  rebateAmount           : any = "";
  previousDue            : any = "";
  collectionAmountDisplay: any = "";


 // Local Variables
 showNoRecords         :boolean=true;
 showLoader   : boolean = true;

 _BillHistory  :any=[];
 customer_number_param : any     = "";
 owner_meta_Json:any;
 billDetailsList : any    = [];
 bill_date        : any;
 customerObject   : any;
 month            : any;
 billMonth        : any = "";
  billDate        : any = "";
  serial           : any;
  date             : any;
  subscription : any = "";
  stbNumber : any = "";
  vcNumber : any = "";
  vcNum : any = "";
  vcNums : any = "";
  stb : any = "";
  stbNum : any = "";
  stbs : any = [];
  vcs : any = [];
  dueDate : any = "";

 //Url Variabes
  public id:any;
  public source:string;

 // Tera DataTable Local Fields
 filteredData: any[] = [];
 filteredTotal: number = 0;
 searchTerm: string = '';
 fromRow: number = 1;
 currentPage: number = 1;
 pageSize: number = 50;
 sortBy: string = 'bill_id';
 selectedRows: any[] = [];
 sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;


//  ~ End  - variable declaration _______________________________________________________________________________



  constructor(
    public  callHttpGet                      : MeCallHttpGetService,
    private customerDetailsPersistenceService: PersistenceService,
    public  userProfileService               : MeUserProfileService,
    public  route                            : ActivatedRoute,
    private _dataTableService: TdDataTableService
 
  ) {
    this.customer_number_param = +this.route.snapshot.params["id"];
   }

//  ~ End -constructor  --------------------------------------------------------------------------------------


// --  @details :  ngOnChanges ##################################################################################
  //  ~ Start -ngOnChanges  ---------------------------------------------------------------------------------------
  // ngOnChanges get updated customerNumber
  
  ngOnChanges(setCustNumObj:any) {

    // ShowLoader
    swal({
      
      titleText: 'Downloading...',
      text: 'Please wait...',
      allowOutsideClick : false,
      allowEscapeKey : false,
      allowEnterKey : false,
      onOpen: () => {
        swal.showLoading()
        }
    });


    // console.log('on change',this.setCustNumObj);
    this.customer_number_param = this.setCustNumObj;
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




this.owner_meta_Json = JSON.parse(this._userProfileData.ownerDetails.owner_meta_value)
console.log(this.owner_meta_Json.enable_gst)
 // Intialize input parameters for get request
 
 
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
       console.log(this.customerObject)

       this.callHttpGet. makeRequest_GetCustomerMeta(this.getRequestInput).subscribe(
        response => {
          console.warn("Customer Meta")
          console.log(response)
          this.customer_meta = response;
          console.log(this.customer_meta.customer_meta.GSTIN)
        }
  
      )


    
 
 this.callHttpGet.makeRequest_GetSubscriptionList(this.getRequestInput).subscribe(
  response => {
    console.warn(
      "%c ___________________________ Subscription Response ___________________________",
      "background: #ff9800;color: black; font-weight: bold;"
    );
    console.log(response);
     this.subscription = response;
    // //JSON.stringify(this.subscription);
    console.log(this.subscription);
    // //console.log(this.subscription.subscription_name);
  
    // for(this.packs of this.packName){
    //   console.log(this.packs);
    // }
  

 this.callHttpGet.makeRequest_GetLatestBill(this.getRequestInput).subscribe(
  response => {

      // Log Response - Remove Later
      console.warn(
        "%c ___________________________ Get Latest Bill Response proforma  ___________________________",
        "background: #ff9800;color: black; font-weight: bold;"
      );

      console.log(response);

      this._latestBill = response;

    
      //assign bill summary
      this.billMonth = this._latestBill.billSummary.bill_date;
      this.billDate = this._latestBill.billSummary.bill_date;
        
     

        // assign bill details
        this.billDetailsList = this._latestBill.billDetail;


        // assign totals

        this.previousDue             = this._latestBill.billSummary.previous_due;
        this.rent_amount             = this._latestBill.billSummary.rent_amount;
       
        this.totalTax                = this._latestBill.billSummary.tax_total  | 0 ;
        this.billAmount              = this._latestBill.billSummary.bill_amount;
        this.rebateAmount            = this._latestBill.billSummary.rebate_amount  | 0 ;
        this.collectionAmountDisplay = this._latestBill.billSummary.collection_amount;

        console.log(this.collectionAmountDisplay);
        
        this.serial = JSON.stringify(this.currentDate);
        console.log(this.serial);
        this.date = moment(this.serial).format('MMMM Do YYYY');
        console.log(this.date);

        this.bill_date = moment(this.billDate).format('DD-MMM-YYYY');
        this.month = moment(this.billMonth).format('MMMM YYYY');
        console.log(this.month);

      //   this.outstandingAmt = parseFloat(this.collectionAmountDisplay) - parseFloat(this.receivedAmountDisplay);

      //   if (this.outstandingAmt >= 0) {
      //     this.overDue = this.outstandingAmt;
      //   }
      //   else{
      //     this.overDue = this.outstandingAmt * -1;
      //   }
        
       

      // hide loader
      this.showLoader = false;

      $(document).ready(function() {
        M.updateTextFields();
        $('select').select();
        $('.datepicker').datepicker();
        $('.modal').modal({
          dismissible: false,
        });
    });
    this.downloadPdf();

});

//  ~ End - get customer bill details  -------------------------------------------------------------------------------------------------
});
//  ~ End - Subscription List  -------------------------------------------------------------------------------------------------

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




this.owner_meta_Json = JSON.parse(this._userProfileData.ownerDetails.owner_meta_value)
console.log(this.owner_meta_Json.enable_gst)
console.log(this.owner_meta_Json.udf1)
console.log(this.owner_meta_Json.udf2)
 // Intialize input parameters for get request
 
 
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


    
 
 this.callHttpGet.makeRequest_GetSubscriptionList(this.getRequestInput).subscribe(
  response => {
    console.warn(
      "%c ___________________________ Subscription Response ___________________________",
      "background: #ff9800;color: black; font-weight: bold;"
    );
    console.log(response);
     this.subscription = response;
    // //JSON.stringify(this.subscription);
    console.log(this.subscription);
    this.stbNumber = this.subscription.subscription.map(function (obj){
      return obj.stb_number;
    });
    console.log(this.stbNumber.length);
    this.vcNumber = this.subscription.subscription.map(function (obj){
      return obj.stb_vc_number;
    });
    console.log(this.vcNumber.length)
    console.log('this.vcNumber',this.vcNumber)
  

 this.callHttpGet.makeRequest_GetLatestBill(this.getRequestInput).subscribe(
  response => {

      // Log Response - Remove Later
      console.warn(
        "%c ___________________________ Get Latest Bill Response proforma  ___________________________",
        "background: #ff9800;color: black; font-weight: bold;"
      );

      console.log(response);

      this._latestBill = response;

    
      //assign bill summary
      this.billMonth = this._latestBill.billSummary.bill_date;
      this.billDate = this._latestBill.billSummary.bill_date;
        
     

        // assign bill details
        this.billDetailsList = this._latestBill.billDetail;


        // assign totals

        this.previousDue             = this._latestBill.billSummary.previous_due;
        this.rent_amount             = this._latestBill.billSummary.rent_amount;
       
        this.totalTax                = this._latestBill.billSummary.tax_total  | 0 ;
        this.billAmount              = this._latestBill.billSummary.bill_amount;
        this.rebateAmount            = this._latestBill.billSummary.rebate_amount  | 0 ;
        this.collectionAmountDisplay = this._latestBill.billSummary.collection_amount;

        // var js = JSON.stringify(this.collectionAmountDisplay)
        // let toWords = require('to-words');
        // let words = toWords(js, {currency: true});
        // console.log(words)


        console.log(this.collectionAmountDisplay);
        
        this.serial = JSON.stringify(this.currentDate);
        console.log(this.serial);
        this.date = moment(this.serial).format('MMMM Do YYYY');
        console.log(this.date);

      

      //   this.outstandingAmt = parseFloat(this.collectionAmountDisplay) - parseFloat(this.receivedAmountDisplay);

      //   if (this.outstandingAmt >= 0) {
      //     this.overDue = this.outstandingAmt;
      //   }
      //   else{
      //     this.overDue = this.outstandingAmt * -1;
      //   }
        
       

    //   // hide loader
    //   this.showLoader = false;

    //   $(document).ready(function() {
    //     M.updateTextFields();
    //     $('select').select();
    //     $('.datepicker').datepicker();
    //     $('.modal').modal({
    //       dismissible: false,
    //     });
    // });
    // // this.downloadPdf();

});

//  ~ End - get customer bill details  -------------------------------------------------------------------------------------------------
});
//  ~ End - Subscription List  -------------------------------------------------------------------------------------------------

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


   // --  @details :  downloadPdf ()#######################################################
  //  ~ Start  -------------------------------------------------------------------------------------------------
  
  downloadPdf() { 
    // this.vcs=[];
    // this.stbs=[];
    var doc = new jsPDF('p','pt','a4');
    doc.setLineWidth(1.5)
    doc.rect(5,5,584,820)
    doc.rect(5,5,584,10, 'F')
    doc.setFontSize(18)
    var text = `${this.customer_params.owner_company_name}`
    doc.text(text,20,55);
   
    doc.setFontSize(20);
    doc.setFontType('bold')
    doc.text('INVOICE',485,46)
    doc.setFontSize(12)
    doc.text('Address :',20,95)
    doc.setFontType('normal')
    var text1 = `${this._userProfileData.ownerDetails.owner_company_address}`
    var line = doc.splitTextToSize(text1,190)
    doc.text(line,20,110);
    doc.setFontType('bold')
    doc.text('Phone :',20,75);
    doc.setFontType('normal')
    doc.text(`${this._userProfileData.ownerDetails.owner_phone}`,67,75)
    doc.setFontType('bold')
    doc.text('Invoice#',380,85)
    doc.text('Invoice Date:',380,105)
    if(this.owner_meta_Json.enable_gst === "Y")
    {
    doc.text('GSTIN#',380,125)
    doc.setFontType('normal')
    doc.text(`${this.owner_meta_Json.gstin_number}`,475,125)
    }
    doc.setFontType('normal')
    doc.text(`${this._latestBill.billSummary.invoice_id}`,475,85)
    doc.text(`${this.bill_date}`,475,105)
    
    doc.rect(20,165,230,20, 'F')
    doc.rect(310,165,263,20, 'F')
    doc.setTextColor(255,255,255)
    doc.setFontType('normal')
    doc.text('Bill To',25,179)
    doc.text('Details',315,179)
    
    doc.setFontType('bold')
    doc.setTextColor(0,0,0)
    doc.text(`${this.customerObject[0].full_name}`, 25, 200)
    doc.text('Phone :',25,216);
    doc.setFontType('normal')
    doc.text(`${this.customerObject[0].phone}`,72,216)
    console.log(this.customer_meta.customer_meta.GSTIN)
    if(this.customer_meta.customer_meta.GSTIN != "" && this.customer_meta.customer_meta.GSTIN != null)
    {
      doc.setFontType('bold')
      doc.text('GSTIN :',25,232) 
      doc.setFontType('normal')
      doc.text(`${this.customer_meta.customer_meta.GSTIN}`,72,232)
    }
    doc.setFontType('bold')
    doc.text(`Address :`,25, 248)
    doc.setFontType('normal')
    var text2 = `${this.customerObject[0].address1}`
    var lines = doc.splitTextToSize(text2, 190)
    doc.text(lines,25, 263)
    doc.setFontType('bold')
    

    doc.setFontType('bold')
    doc.text(`Customer ID:`,315,200)
    doc.text(`Bill Month:`,315,216)
    if(this.owner_meta_Json.due_date != "" && this.owner_meta_Json.due_date != "null" && this.owner_meta_Json.due_date != null ){
      doc.text(`Due Date:`,315,231)
      doc.setFontType('normal')
      doc.text(`${this.owner_meta_Json.due_date}-`,410,231)
      this.dueDate =  moment().format("MMM-YYYY");
      doc.text(`${this.dueDate}`,428,231)
    }
    doc.setFontType('bold')
    doc.text('VC Number:', 315, 247)
    for(var vcno of this.vcNumber){
      console.log('outvcno',vcno)
      if( vcno != "None" && vcno != "null" && vcno != null && vcno != "none"){
        console.log('vcno',vcno)
        this.vcs.push(vcno)
        console.log(this.vcs)
      }
    }
    if(this.vcs.length > 1)
    {
      doc.setFontType('normal')
      this.vcNum = this.vcs.slice(0,1)
      this.vcNums = this.vcNum.concat('...')
      var vc = `${this.vcNums}`
      var line3 = doc.splitTextToSize(vc,128)
      doc.text(line3,410,247)
    }
    else{
      doc.setFontType('normal')
      var vc = `${this.vcs}`
      var line3 = doc.splitTextToSize(vc,128)
      doc.text(line3,410,247)
    }
   
   
    doc.setFontType('bold')
    doc.text('STB Number:', 315, 263)
    for(var stbno of this.stbNumber){
      console.log('outstbno',stbno)
      if( stbno != "None" && stbno != "null" && stbno != null && stbno != "none"){
        console.log('indstbno',stbno)
        this.stbs.push(stbno)
        console.log(this.stbs)
      }
    }
    console.log(this.stbs)

    if(this.stbs.length > 1)
    {
        doc.setFontType('normal')
        this.stb = this.stbs.slice(0,1)
        console.log(this.stb)
        this.stbNum = this.stb.concat('...')
        var text2 = `${this.stbNum}`
        var line2 = doc.splitTextToSize(text2,128)
        doc.text(line2,410,263)  
    }
     else{
          doc.setFontType('normal')
          var text2 =`${this.stbs}`
          var line2 = doc.splitTextToSize(text2,128)
          doc.text(line2,410,263)
    }
    doc.setFontType('normal')
    doc.text(`${this.customerObject[0].customer_id}`,410, 200)
    this.month = moment(this.billMonth).format('MMMM YYYY');
    var bill_month = moment(this.month).subtract('months',1).format('MMM YYYY')
    doc.text(`${bill_month}`,410,216)

    doc.setLineWidth(0.5)
    doc.line(20, 295, 571, 295)
    doc.setFontSize(18);
    doc.setFontType('bold')
    doc.text('INVOICE TOTAL',25,320)
    doc.text(`Rs. ${this._latestBill.billSummary.collection_amount_original.toFixed(2)}`,520,320,null,null,'right')
    doc.line(20,332,571,332)


    var data = this.subscription.subscription;
    var columns = [
      { title:"#", dataKey: "rownum"},
      { title:"Description",dataKey:"subscription_name"},
      { title:"Amount",dataKey:"total_amount"}
    ]
    var res = doc.autoTable(columns, data,{startX:250,startY: 368,theme:'grid',
    columnStyles: { rownum:{columnWidth:70,halign:'center'},subscription_name:{columnWidth:320}, total_amount: {columnWidth: 125,halign:'right'}},
    headerStyles:{fillColor: [0, 0, 0],halign:'center',fontSize: 12},});
    let first = doc.autoTable.previous.finalY;
    doc.rect(430,first,125,20)
    doc.rect(430,first+20,125,20)
    doc.rect(430,first+40,125,20)
    doc.rect(430,first+60,125,20)
    doc.rect(430,first+80,125,20)
    doc.rect(430,first+100,125,20)
    doc.setFontType('normal')
    doc.setFontSize(10)
    doc.text(`${this.rent_amount.toFixed(2)}`,550,first+14,null,null,'right')
    doc.text(`${this._latestBill.billSummary.cgst_total.toFixed(2)}`,550,first+34,null,null,'right')
    doc.text(`${this._latestBill.billSummary.sgst_total.toFixed(2)}`,550,first+54,null,null,'right')
    doc.text(`${this.billAmount.toFixed(2)}`,550,first+74,null,null,'right')
    doc.text(`${this.rebateAmount.toFixed(2)}`,550,first+94,null,null,'right')
    doc.text(`${this.previousDue.toFixed(2)}`,550,first+114,null,null,'right')
    doc.setFontSize(11)
    doc.text('Sub Total',377,first+14)
    doc.text('CGST[9%]',372,first+34)
    doc.text('SGST[9%]',372,first+54)
    doc.text('Monthly Charge',348,first+74)
    doc.text('Rebate Amount',349,first+94)
    doc.text('Previous Due',359,first+114)
    doc.setFontSize(15);
    doc.setFontType('bold')
    doc.text('Total',385,first+140)
    doc.setFillColor(0, 0, 0)
    doc.rect(429.5,first+120,125.5,30,'F')
    doc.setTextColor(255,255,255)
    doc.text(`${this._latestBill.billSummary.collection_amount_original.toFixed(2)}`,550,first+140,null,null,'right')
   

    doc.rect(40,first+40,250,110)
    if(this.owner_meta_Json.udf1 != ""&& this.owner_meta_Json.udf1 != "null" && this.owner_meta_Json.udf1 != null)
    {
      if(this.owner_meta_Json.udf2 != "" && this.owner_meta_Json.udf2 != "null" && this.owner_meta_Json.udf2 != null)
      {
        doc.setFontSize(10);
        doc.setFontType('normal')
        doc.setTextColor(0,0,0)
        doc.rect(40,first+120,250,15)
        doc.text(`${this.owner_meta_Json.udf1}`,45,first+131)
        doc.rect(40,first+135,250,15)
        doc.text(`${this.owner_meta_Json.udf2}`,45,first+147)
      }
    }
    doc.setFillColor(0, 0, 0)
    doc.rect(40,first+24,250,20,'F')
    doc.setFontSize(12);
    doc.setFontType('bold')
    doc.setTextColor(255,255,255)
    doc.text('Comments',45,first+38)

    if(this.collectionAmountDisplay === 0)
    {
    var image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANUAAABKCAMAAAAbruEnAAADAFBMVEVHcEz/iYn/gID/gYH/goL/gID/gID/AAD/h4f/qqr/gID/gID/gID/mZn/gID/gID/gID/g4P/goL/gID/gID/gID/gID/iIj/gID/gID/i4v/gID/gID/gID/g4P/gID/gID/gID/hob/jo7/gID/gID/gID/gYH/gID/gYH/g4P/gID/gID/gID/gID/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/goL/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gID/kpL/gID/gID/gID/gID/hIT/gID/goL/hob/gID/gID/gID/gID/gID/hIT/gID/gID/gID/gID/gID/hIT/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/g4P/gID/gID/gID/gID/gID/gYH/gYH/gID/gID/gID/goL/gID/gID/goL/gID/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gYH/gID/gID/gID/gID/goL/gID/gID/gID/gID/gID/gID/gID/gYH/gID/gYH/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gID/hYX/gYH/gID/gYH/gID/gID/gID/gID/gID/gYH/gID/gID/gID/gID/gYH/gID/gID/gID/gID/gID/goL/gID/gID/gID/g4P/gYH/gID/gID/gYH/gID/gID/gID/gYH/gID/gID/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gID/gYH/gID/goL/gID/gID/gID/gID/gID/gID/gID/goL/hYX/gID/gID/gID/gID/gID/gID/goL/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gYH/gID/gID/gID/gID/gID/gID/gID/gID/gID/gYH/gYH/gID/gID/gID/gIBfxqbjAAAA/3RSTlMADcxVM/4CAREDZpnuBf1EUiMtxafyBA/JagvYQN0p0N98FQmc/I11qUMnVKO3DEiIdygy+oJQXjo1ip5ZsvsY0QYiPItfTlgsRxpwCgeU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"
    doc.addImage(image, 'PNG', 110, 600, 120, 50);
    }
    
    doc.setFontSize(15);
    doc.setFontType('normal')
    doc.setTextColor(0,0,0)
    doc.setDrawColor(0,0,0)
    doc.line(20, 790, 571, 790)
    doc.text('Thank You',258,814)
    doc.setFontSize(8);
    doc.setFontType('normal')
    // doc.setTextColor(161,169,169)
    doc.text('**This is a computer generated invoice and does not require any signature',25,837)

    swal.close();
    
    doc.save('Invoice_'+this.customerObject[0].full_name+'_'+this._latestBill.billSummary.customer_id+'_'+this.presentDate+'.pdf');



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
