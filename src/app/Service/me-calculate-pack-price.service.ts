import { Injectable } from "@angular/core";

@Injectable()
export class MeCalculatePackPriceService {
  base_price:number = 0;
  cgst_amount:number = 0;
  sgst_amount:number = 0;
  total_tax:number = 0;
  total_amount:number = 0;

  constructor() {}

  // calculate pack price
  calculatePackPrice(p_baseprice: string, p_pricetype: string): void {

    console.log('p_pricetype',p_pricetype);
   if(!(p_baseprice && p_pricetype)){
     console.error('Message1 - Incorrect or Null values received for price caculation');
     console.error('Values - >> base price : ',p_baseprice,' >> price type : ', p_pricetype );

     this.base_price = 0;
     this.cgst_amount = 0;
     this.sgst_amount = 0;
     this.total_tax = 0;
     this.total_amount = 0;

   }  

   if( parseInt(p_baseprice) === 0 && p_pricetype === null ){
      this.base_price = 0;
      this.cgst_amount = 0;
      this.sgst_amount = 0;
      this.total_tax = 0;
      this.total_amount = 0;
  }  

  if( parseInt(p_baseprice) === null && p_pricetype ){
    this.base_price = 0;
    this.cgst_amount = 0;
    this.sgst_amount = 0;
    this.total_tax = 0;
    this.total_amount = 0;
}  

   if(p_baseprice && p_pricetype) {
              // Calculate totals if the base price > 0 
            // ~~ Start ----------------------------------------------------------------------
            if (parseInt(p_baseprice) > 0 ) {
              switch (p_pricetype) {
                case "BP": {
                  console.log("BP");

                  this.base_price   = parseFloat(p_baseprice);
                  this.cgst_amount  = 0.0;
                  this.sgst_amount  = 0.0;
                  this.total_tax    = 0.0;
                  this.total_amount = parseFloat(p_baseprice);

                  break;
                }
                case "TP": {
                  console.log("TP");

                  this.base_price = parseFloat(p_baseprice);
                  this.cgst_amount = 0.0;
                  this.sgst_amount = 0.0;
                  this.total_tax = 0.0;
                  this.total_amount = parseFloat(p_baseprice);

                  break;
                }
                case "BPGST": {
                  console.log("BPGST");

                  this.base_price = parseFloat(p_baseprice);
                  this.cgst_amount = parseFloat(p_baseprice) * (9 / 100);
                  this.sgst_amount = parseFloat(p_baseprice) * (9 / 100);
                  this.total_tax = this.cgst_amount + this.sgst_amount;
                  this.total_amount = this.base_price + this.total_tax;

                  break;
                }
                case "TPGST": {
                  console.log("TPGST");

                  this.total_amount = parseFloat(p_baseprice);
                  this.base_price    = (parseFloat(p_baseprice) / 1.18 )  ;
                  this.total_tax   = this.total_amount - this.base_price;
                  this.cgst_amount  = this.total_tax / 2;
                  this.sgst_amount  = this.total_tax / 2;
                  

                  break;
                }
                default: {
                  console.error("Invalid Price Type");
                  break;
                }
              }
            }
            // Calculate totals if the base price > 0 
            // ~~ End ----------------------------------------------------------------------


            // Calculate totals if the base price <= 0 
            // ~~ Start ----------------------------------------------------------------------
            if(parseInt(p_baseprice) <= 0) {

              this.base_price = 0;
              this.cgst_amount = 0;
              this.sgst_amount = 0;
              this.total_tax = 0;
              this.total_amount = 0;

            }
            // Calculate totals if the base price <= 0 
            // ~~ End ----------------------------------------------------------------------

          }
   }



  // calculate pack price
}
