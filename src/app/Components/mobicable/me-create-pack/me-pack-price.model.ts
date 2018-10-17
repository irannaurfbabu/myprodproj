export class PackPrice {

    basePrice: number;
    cgst: number;
    sgst: number;
    total_tax: number;
    total_amount: number;
    

    constructor() {
        this.basePrice = 0;
        this.cgst = 0.00;
        this.sgst = 0.00;
        this.total_tax = 0.00;
        this.total_amount = 0.00;
        
    }

    // calculate pack price
    calculatePackPrice( p_baseprice: number, p_pricetype: string ): void {
        
        if(p_pricetype) {

          switch(p_pricetype) { 
            case "BP": { 
               console.log("BP"); 

               this.basePrice = p_baseprice;
               this.cgst = 0.00;
               this.sgst = 0.00;
               this.total_tax = 0.00;
               this.total_amount = p_baseprice;

               break; 
            } 
            case "TP": { 
               console.log("TP"); 

               this.basePrice = p_baseprice;
               this.cgst = 0.00;
               this.sgst = 0.00;
               this.total_tax = 0.00;
               this.total_amount = p_baseprice;

               break; 
            } 
            case "BPGST": {
               console.log("BPGST"); 

               this.basePrice    = p_baseprice;
               this.cgst         = ( p_baseprice * ( 9/100 ) );
               this.sgst         = ( p_baseprice * ( 9/100 ) );
               this.total_tax    = this.cgst + this.sgst
               this.total_amount = this.basePrice + this.total_tax;

               break;    
            } 
            case "TPGST": { 
               console.log("TPGST"); 

               this.total_amount =  p_baseprice;
               this.basePrice    =  ( p_baseprice - ( (p_baseprice*18)/100) );
               this.total_tax    =  this.total_amount - this.basePrice; 
               this.cgst         =  (this.total_tax/2);
               this.total_tax    =  (this.total_tax/2);

               break; 
            }  
            default: { 
               console.log("Invalid Price Type"); 
               break;              
            } 
         }
        
        }
       
      }

      // calculate pack price
    
  
}