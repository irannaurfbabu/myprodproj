export interface MeCustomerInterface {
    customer_number: number;
    customer_id: string ;
    first_name:  string  ;
    last_name:  string  ;
    full_name:  string  ;
    alias_name:  string  ;
    phone:  number  ;
    area_name: string;
    alternate_phone:  number  ;
    email:  string  ;
    address1:  string  ;
    address2:  string  ;
    landmark:  string  ;
    city:  string  ;
    state:  string  ;
    pincode:  number  ;
    gender:  string  ;
    owner_id:  number  ;
    area_id:  number  ;
    active:  string  ;
    dmlType: string;
    comments:  string ;
    remarks: string;
    recordType: string;

    created_on:  number;
    created_by:  string  ;
    created_by_id: number;
    modified_by:   string ;
    modified_on: string;
	modified_by_id: string;
	disabled_on: string;
  

    reminder_date: number;
    activation_date: string;
    agreement_number: number;
    customer_category: string;
    GSTIN: number;

 


}
